import { spawn, type ChildProcess } from 'node:child_process';
import { constants as osConstants } from 'node:os';
import type { Readable, Writable } from 'node:stream';
import {
  UPSTREAM_PACKAGE,
  UPSTREAM_VERSION,
  assertUpstreamPinned,
  resolveUpstreamBin,
} from './upstream.js';

export {
  PINNED_UPSTREAM_VERSION,
  UPSTREAM_PACKAGE,
  UPSTREAM_VERSION,
  assertUpstreamPinned,
  checkUpstreamVersion,
  resolveUpstreamBin,
} from './upstream.js';

/** Set to `1` to write relay diagnostics to stderr (never stdout). */
export const DEBUG_ENV = 'TECTON_MUI_MCP_DEBUG';
/**
 * How long (ms) the upstream may keep running after our stdin ends before it is sent SIGTERM, and
 * again before SIGTERM escalates to SIGKILL.
 */
export const SHUTDOWN_TIMEOUT_ENV = 'TECTON_MUI_MCP_SHUTDOWN_TIMEOUT_MS';
export const DEFAULT_SHUTDOWN_TIMEOUT_MS = 3000;
/** Signals received by the relay that are forwarded to the upstream process. */
export const FORWARDED_SIGNALS = ['SIGINT', 'SIGTERM', 'SIGHUP'] as const;

/** Time allowed for the child's stdio to drain after it has exited. */
const CLOSE_AFTER_EXIT_TIMEOUT_MS = 2000;
const LOG_PREFIX = '[tecton-mui-mcp]';

type SignalListener = (signal: NodeJS.Signals) => void;

/** Where forwarded signals come from; `process` by default. */
export interface SignalSource {
  on(event: NodeJS.Signals, listener: SignalListener): unknown;
  off(event: NodeJS.Signals, listener: SignalListener): unknown;
}

export interface RelayOptions {
  /** Executable to spawn. Defaults to the current Node binary running the pinned upstream. */
  command?: string;
  /** Arguments for `command`. Defaults to the pinned upstream's bin entry. */
  args?: readonly string[];
  /** Extra arguments appended unchanged (the CLI forwards its own argv here). */
  forwardArgs?: readonly string[];
  /** Environment for the child, passed through unchanged. Defaults to `process.env`. */
  env?: NodeJS.ProcessEnv;
  stdin?: Readable;
  stdout?: Writable;
  stderr?: Writable;
  signals?: SignalSource;
  /** Overrides {@link SHUTDOWN_TIMEOUT_ENV}. */
  shutdownTimeoutMs?: number;
  /** Overrides {@link DEBUG_ENV}. */
  debug?: boolean;
}

/**
 * How the relay process should end: exit with `code`, or re-raise `signal` on itself so the parent
 * observes the same termination as the upstream's. Exactly one of the two is non-null.
 */
export interface RelayExit {
  code: number | null;
  signal: NodeJS.Signals | null;
}

export interface RelayHandle {
  /** The spawned upstream process. */
  readonly child: ChildProcess;
  /** Resolves once the upstream has exited and its output has been relayed. */
  readonly done: Promise<RelayExit>;
}

function parseTimeout(value: string | undefined): number {
  const parsed = value === undefined ? Number.NaN : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_SHUTDOWN_TIMEOUT_MS;
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Spawns the upstream MCP server and relays raw bytes between it and our stdio: stdin → child
 * stdin, child stdout → stdout, child stderr → stderr. Nothing is parsed, buffered into messages,
 * re-encoded or filtered.
 *
 * Lifecycle: SIGINT/SIGTERM/SIGHUP are forwarded to the child. When stdin ends, the child's stdin
 * is ended so it can exit on its own; if it is still running after the shutdown timeout it gets
 * SIGTERM, then SIGKILL after the same timeout again. Throws synchronously only when the installed
 * upstream does not match the pinned version.
 */
export function startRelay(options: RelayOptions = {}): RelayHandle {
  const stdin = options.stdin ?? process.stdin;
  const stdout = options.stdout ?? process.stdout;
  const stderr = options.stderr ?? process.stderr;
  const signals: SignalSource = options.signals ?? process;
  const env = options.env ?? process.env;
  const debug = options.debug ?? env[DEBUG_ENV] === '1';
  const shutdownTimeoutMs = options.shutdownTimeoutMs ?? parseTimeout(env[SHUTDOWN_TIMEOUT_ENV]);

  const log = (message: string): void => {
    if (debug) {
      stderr.write(`${LOG_PREFIX} ${message}\n`);
    }
  };

  let command: string;
  let args: string[];
  if (options.command === undefined) {
    assertUpstreamPinned();
    command = process.execPath;
    args = [...(options.args ?? [resolveUpstreamBin()])];
    log(`upstream ${UPSTREAM_PACKAGE}@${UPSTREAM_VERSION}`);
  } else {
    command = options.command;
    args = [...(options.args ?? [])];
  }
  args.push(...(options.forwardArgs ?? []));
  log(`spawning ${JSON.stringify([command, ...args])}`);

  const child = spawn(command, args, {
    env,
    stdio: ['pipe', 'pipe', 'pipe'],
    windowsHide: true,
  });

  let resolveDone!: (exit: RelayExit) => void;
  const done = new Promise<RelayExit>((resolve) => {
    resolveDone = resolve;
  });

  let settled = false;
  let inputEnded = false;
  let stoppedAfterInputEnd = false;
  let forwardedSignal: NodeJS.Signals | null = null;
  let exitStatus: { code: number | null; signal: NodeJS.Signals | null } | undefined;
  const timers = new Set<NodeJS.Timeout>();
  let bytesIn = 0;
  let bytesOut = 0;

  const isRunning = (): boolean =>
    child.pid !== undefined && child.exitCode === null && child.signalCode === null;

  const later = (ms: number, fn: () => void): void => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      fn();
    }, ms);
    timers.add(timer);
  };

  const onSignal: SignalListener = (signal) => {
    log(`received ${signal}, forwarding to upstream`);
    forwardedSignal = signal;
    if (isRunning()) {
      child.kill(signal);
    }
  };

  // Last-resort guard so the upstream never outlives the relay.
  const killOnExit = (): void => {
    if (isRunning()) {
      child.kill('SIGKILL');
    }
  };

  const onInputEnd = (): void => {
    if (inputEnded) {
      return;
    }
    inputEnded = true;
    log(`stdin ended after ${bytesIn} bytes; ending upstream stdin`);
    if (!child.stdin.writableEnded) {
      child.stdin.end();
    }
    later(shutdownTimeoutMs, () => {
      if (!isRunning()) {
        return;
      }
      log(`upstream still running ${shutdownTimeoutMs}ms after stdin ended; sending SIGTERM`);
      stoppedAfterInputEnd = true;
      child.kill('SIGTERM');
      later(shutdownTimeoutMs, () => {
        if (isRunning()) {
          log('upstream ignored SIGTERM; sending SIGKILL');
          child.kill('SIGKILL');
        }
      });
    });
  };

  const onInputError = (error: Error): void => {
    log(`stdin error: ${describe(error)}`);
    onInputEnd();
  };

  const onOutputError = (error: Error): void => {
    // The client stopped reading; treat it like a disconnect.
    log(`stdout error: ${describe(error)}`);
    onInputEnd();
  };

  const countIn = (chunk: Buffer): void => {
    bytesIn += chunk.length;
  };
  const countOut = (chunk: Buffer): void => {
    bytesOut += chunk.length;
  };

  const cleanup = (): void => {
    for (const signal of FORWARDED_SIGNALS) {
      signals.off(signal, onSignal);
    }
    process.off('exit', killOnExit);
    for (const timer of timers) {
      clearTimeout(timer);
    }
    timers.clear();
    stdin.unpipe(child.stdin);
    stdin.off('end', onInputEnd);
    stdin.off('error', onInputError);
    stdin.off('data', countIn);
    stdin.pause();
    child.stdout.unpipe(stdout);
    child.stderr.unpipe(stderr);
    stdout.off('error', onOutputError);
  };

  const finish = (exit: RelayExit): void => {
    if (settled) {
      return;
    }
    settled = true;
    cleanup();
    log(
      `relay finished (${bytesIn} bytes in, ${bytesOut} bytes out): ` +
        (exit.signal ? `re-raising ${exit.signal}` : `exit code ${exit.code}`),
    );
    resolveDone(exit);
  };

  const finishFromStatus = (code: number | null, signal: NodeJS.Signals | null): void => {
    if (signal === null) {
      finish({ code: code ?? 1, signal: null });
    } else if (stoppedAfterInputEnd && forwardedSignal === null) {
      // We stopped the upstream ourselves after the client disconnected: a clean shutdown.
      finish({ code: 0, signal: null });
    } else {
      finish({ code: null, signal });
    }
  };

  for (const signal of FORWARDED_SIGNALS) {
    signals.on(signal, onSignal);
  }
  process.on('exit', killOnExit);

  child.on('error', (error) => {
    if (child.pid === undefined) {
      stderr.write(
        `tecton-mui-mcp: failed to start the upstream MCP server (${command}): ${describe(error)}\n`,
      );
      finish({ code: 1, signal: null });
    } else {
      log(`upstream process error: ${describe(error)}`);
    }
  });
  child.on('spawn', () => log(`upstream pid=${child.pid}`));
  child.on('exit', (code, signal) => {
    log(`upstream exited (code=${code}, signal=${signal})`);
    exitStatus = { code, signal };
    // 'close' normally follows once stdio drains; don't hang if a grandchild holds the pipes.
    later(CLOSE_AFTER_EXIT_TIMEOUT_MS, () => finishFromStatus(code, signal));
  });
  child.on('close', (code, signal) => {
    const status = exitStatus ?? { code, signal };
    finishFromStatus(status.code, status.signal);
  });

  // Writes after the upstream has gone away fail with EPIPE; the exit path handles that case.
  child.stdin.on('error', (error) => log(`upstream stdin error: ${describe(error)}`));

  if (debug) {
    stdin.on('data', countIn);
    child.stdout.on('data', countOut);
  }
  stdin.on('end', onInputEnd);
  stdin.on('error', onInputError);
  stdout.on('error', onOutputError);
  stdin.pipe(child.stdin);
  child.stdout.pipe(stdout, { end: false });
  child.stderr.pipe(stderr, { end: false });

  return { child, done };
}

function flush(stream: Writable, timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeoutMs);
    stream.write('', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

/** The parts of `process` that {@link exitProcess} uses. */
export interface ExitTarget {
  readonly pid: number;
  readonly stdout: Writable;
  readonly stderr: Writable;
  exit(code: number): void;
  kill(pid: number, signal: NodeJS.Signals): unknown;
}

/** Ends the current process the way `exit` describes, after flushing stdout and stderr. */
export async function exitProcess(exit: RelayExit, target: ExitTarget = process): Promise<void> {
  await Promise.all([flush(target.stdout, 1000), flush(target.stderr, 1000)]);
  const { signal } = exit;
  if (signal !== null) {
    // Our forwarding listeners are gone, so the default action terminates us with this signal.
    target.kill(target.pid, signal);
    // Fallback for platforms where self-signalling does not terminate (e.g. Windows).
    setTimeout(() => target.exit(128 + (osConstants.signals[signal] ?? 1)), 1000);
    return;
  }
  target.exit(exit.code ?? 1);
}
