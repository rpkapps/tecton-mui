// @vitest-environment node
import { randomBytes } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PassThrough } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import {
  DEBUG_ENV,
  PINNED_UPSTREAM_VERSION,
  SHUTDOWN_TIMEOUT_ENV,
  UPSTREAM_PACKAGE,
  UPSTREAM_VERSION,
  assertUpstreamPinned,
  checkUpstreamVersion,
  exitProcess,
  resolveUpstreamBin,
  startRelay,
  type ExitTarget,
  type RelayOptions,
} from '../src/relay.js';

// In-process tests of the relay's plumbing and lifecycle against a scripted stand-in upstream.

const FAKE_UPSTREAM = fileURLToPath(new URL('./fixtures/fake-upstream.mjs', import.meta.url));
const PACKAGE_JSON = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as { dependencies: Record<string, string> };
const TEST_HOME = mkdtempSync(join(tmpdir(), 'tecton-mui-mcp-home-'));

afterAll(() => {
  rmSync(TEST_HOME, { recursive: true, force: true });
});

function baseEnv(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env, ...extra };
  for (const key of [DEBUG_ENV, SHUTDOWN_TIMEOUT_ENV]) {
    if (!(key in extra)) {
      delete env[key];
    }
  }
  return env;
}

function harness(options: RelayOptions & { mode?: string; modeArgs?: string[] }) {
  const { mode, modeArgs = [], ...relayOptions } = options;
  const stdin = new PassThrough();
  const stdout = new PassThrough();
  const stderr = new PassThrough();
  const signals = new EventEmitter();
  const out: Buffer[] = [];
  const err: Buffer[] = [];
  stdout.on('data', (chunk: Buffer) => out.push(chunk));
  stderr.on('data', (chunk: Buffer) => err.push(chunk));
  const handle = startRelay({
    ...(mode === undefined
      ? {}
      : { command: process.execPath, args: [FAKE_UPSTREAM, mode, ...modeArgs] }),
    stdin,
    stdout,
    stderr,
    signals,
    env: baseEnv(),
    shutdownTimeoutMs: 200,
    ...relayOptions,
  });
  const stdoutBytes = () => Buffer.concat(out);
  const stderrText = () => Buffer.concat(err).toString('utf8');
  const waitForStdout = (text: string) =>
    new Promise<void>((resolve) => {
      const check = () => {
        if (stdoutBytes().includes(text)) {
          stdout.off('data', check);
          resolve();
        }
      };
      stdout.on('data', check);
      check();
    });
  return { stdin, stdout, signals, handle, stdoutBytes, stderrText, waitForStdout };
}

describe('upstream pin', () => {
  it('reads the installed upstream version and matches the exact pin in package.json', () => {
    expect(UPSTREAM_PACKAGE).toBe('@mui/mcp');
    expect(PINNED_UPSTREAM_VERSION).toBe(PACKAGE_JSON.dependencies[UPSTREAM_PACKAGE]);
    expect(UPSTREAM_VERSION).toBe(PINNED_UPSTREAM_VERSION);
    expect(checkUpstreamVersion(UPSTREAM_VERSION, PINNED_UPSTREAM_VERSION)).toBeUndefined();
    expect(() => assertUpstreamPinned()).not.toThrow();
  });

  it('fails fast with a clear message on a version mismatch or a non-exact pin', () => {
    expect(() => assertUpstreamPinned('0.1.9', '0.1.10')).toThrow(
      'Installed @mui/mcp@0.1.9 does not match the pinned @mui/mcp@0.1.10',
    );
    expect(checkUpstreamVersion('0.1.10', '^0.1.10')).toMatch(/exact version.*"\^0\.1\.10"/);
    expect(checkUpstreamVersion('0.1.10', '')).toMatch(/\(missing\)/);
    expect(checkUpstreamVersion('', '0.1.10')).toMatch(/@mui\/mcp@\(unknown\)/);
  });

  it('resolves the upstream bin inside the installed package', () => {
    const bin = resolveUpstreamBin();
    expect(bin).toMatch(/@mui[\\/]mcp[\\/]stdio\.js$/);
    expect(existsSync(bin)).toBe(true);
  });
});

describe('startRelay plumbing', () => {
  it('relays arbitrary bytes unchanged in both directions and forwards stderr and args', async () => {
    const r = harness({ mode: 'echo', forwardArgs: ['--forwarded', 'arg'] });
    // Invalid UTF-8, a multibyte character split across writes, NULs, CRLF and bulk random data.
    const input = Buffer.concat([
      Buffer.from([0xff, 0xfe, 0x00, 0xc3]),
      Buffer.from([0xa9, 0x0d, 0x0a]),
      Buffer.from('{"jsonrpc":"2.0","id":1}\n', 'utf8'),
      randomBytes(256 * 1024),
    ]);
    for (let offset = 0; offset < input.length; offset += 7919) {
      r.stdin.write(input.subarray(offset, offset + 7919));
    }
    r.stdin.end();
    await expect(r.handle.done).resolves.toEqual({ code: 0, signal: null });
    expect(r.stdoutBytes().equals(input)).toBe(true);
    expect(r.stderrText()).toContain('fake-upstream stderr --forwarded arg');
  });

  it('keeps diagnostics on stderr only, and only when debugging is enabled', async () => {
    const quiet = harness({ mode: 'echo' });
    quiet.stdin.end('payload\n');
    await quiet.handle.done;
    expect(quiet.stderrText()).not.toContain('[tecton-mui-mcp]');

    const verbose = harness({ mode: 'echo', debug: true });
    verbose.stdin.end('payload\n');
    await expect(verbose.handle.done).resolves.toEqual({ code: 0, signal: null });
    expect(verbose.stdoutBytes().toString()).toBe('payload\n');
    expect(verbose.stderrText()).toMatch(/\[tecton-mui-mcp\] upstream pid=\d+/);
    expect(verbose.stderrText()).toContain('[tecton-mui-mcp] relay finished (8 bytes in, 8 bytes');
  });

  it('reads debug and shutdown timeout settings from the environment', async () => {
    const r = harness({
      mode: 'hang',
      shutdownTimeoutMs: undefined,
      env: baseEnv({ [DEBUG_ENV]: '1', [SHUTDOWN_TIMEOUT_ENV]: '50' }),
    });
    await r.waitForStdout('ready');
    r.stdin.end();
    await expect(r.handle.done).resolves.toEqual({ code: 0, signal: null });
    expect(r.stderrText()).toContain('still running 50ms after stdin ended; sending SIGTERM');
  });

  it('falls back to the default shutdown timeout for invalid values', async () => {
    const r = harness({
      mode: 'echo',
      shutdownTimeoutMs: undefined,
      env: baseEnv({ [SHUTDOWN_TIMEOUT_ENV]: 'soon' }),
    });
    r.stdin.end();
    await expect(r.handle.done).resolves.toEqual({ code: 0, signal: null });
  });
});

describe('startRelay lifecycle', () => {
  it('propagates the upstream exit code', async () => {
    const r = harness({ mode: 'exit-code', modeArgs: ['3'] });
    await expect(r.handle.done).resolves.toEqual({ code: 3, signal: null });
  });

  it('propagates termination by a signal', async () => {
    const r = harness({ mode: 'self-signal' });
    await expect(r.handle.done).resolves.toEqual({ code: null, signal: 'SIGTERM' });
  });

  it.each([
    ['SIGINT', 21],
    ['SIGTERM', 22],
    ['SIGHUP', 23],
  ] as const)('forwards %s to the upstream', async (signal, code) => {
    const r = harness({ mode: 'trap' });
    await r.waitForStdout('ready');
    r.signals.emit(signal, signal);
    await expect(r.handle.done).resolves.toEqual({ code, signal: null });
    expect(r.stderrText()).toContain(`got ${signal}`);
    expect(r.signals.listenerCount(signal)).toBe(0);
  });

  it('ends upstream stdin on EOF and lets it exit on its own', async () => {
    const r = harness({ mode: 'echo', debug: true });
    r.stdin.end();
    await expect(r.handle.done).resolves.toEqual({ code: 0, signal: null });
    expect(r.stderrText()).not.toContain('sending SIGTERM');
  });

  it('terminates an upstream that outlives stdin EOF and reports a clean exit', async () => {
    const r = harness({ mode: 'hang', debug: true });
    await r.waitForStdout('ready');
    r.stdin.end();
    await expect(r.handle.done).resolves.toEqual({ code: 0, signal: null });
    expect(r.stderrText()).toContain('sending SIGTERM');
    expect(r.handle.child.signalCode).toBe('SIGTERM');
  });

  it('escalates to SIGKILL when the upstream ignores SIGTERM', async () => {
    const r = harness({ mode: 'stubborn', debug: true });
    await r.waitForStdout('ready');
    r.stdin.end();
    await expect(r.handle.done).resolves.toEqual({ code: 0, signal: null });
    expect(r.stderrText()).toContain('ignoring SIGTERM');
    expect(r.stderrText()).toContain('sending SIGKILL');
    expect(r.handle.child.signalCode).toBe('SIGKILL');
  });

  it('treats a stdin error like EOF', async () => {
    const r = harness({ mode: 'echo', debug: true });
    r.stdin.destroy(new Error('stdin broke'));
    await expect(r.handle.done).resolves.toEqual({ code: 0, signal: null });
    expect(r.stderrText()).toContain('stdin error: stdin broke');
  });

  it('shuts down when stdout fails (client went away)', async () => {
    const r = harness({ mode: 'hang', debug: true });
    await r.waitForStdout('ready');
    r.stdout.destroy(new Error('EPIPE'));
    await expect(r.handle.done).resolves.toEqual({ code: 0, signal: null });
    expect(r.stderrText()).toContain('stdout error: EPIPE');
  });

  it('exits non-zero with a stderr message when the upstream cannot be spawned', async () => {
    const r = harness({ command: join(TEST_HOME, 'does-not-exist'), args: [] });
    await expect(r.handle.done).resolves.toEqual({ code: 1, signal: null });
    expect(r.stderrText()).toMatch(/failed to start the upstream MCP server .*ENOENT/);
  });

  it('launches the pinned upstream with the current Node binary by default', async () => {
    const r = harness({
      debug: true,
      env: baseEnv({
        HOME: TEST_HOME,
        USERPROFILE: TEST_HOME,
        MUI_DOCS_BASE_URL: 'http://127.0.0.1:9',
      }),
    });
    r.stdin.write(
      '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18",' +
        '"capabilities":{},"clientInfo":{"name":"lifecycle-test","version":"1.0.0"}}}\n',
    );
    await r.waitForStdout('"id":1}');
    r.stdin.end();
    await expect(r.handle.done).resolves.toEqual({ code: 0, signal: null });
    expect(r.stderrText()).toContain(`upstream ${UPSTREAM_PACKAGE}@${UPSTREAM_VERSION}`);
    expect(r.stderrText()).toContain(JSON.stringify([process.execPath, resolveUpstreamBin()]));
    expect(JSON.parse(r.stdoutBytes().toString()).result.serverInfo).toEqual({
      name: 'mui-mcp',
      version: UPSTREAM_VERSION,
    });
  }, 20_000);
});

describe('exitProcess', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  function fakeProcess() {
    const target = {
      pid: 4242,
      stdout: new PassThrough(),
      stderr: new PassThrough(),
      exit: vi.fn<(code: number) => void>(),
      kill: vi.fn<(pid: number, signal: NodeJS.Signals) => unknown>(),
    } satisfies ExitTarget;
    return target;
  }

  it('exits with the relayed code after flushing output', async () => {
    const target = fakeProcess();
    await exitProcess({ code: 7, signal: null }, target);
    expect(target.exit).toHaveBeenCalledWith(7);
    expect(target.kill).not.toHaveBeenCalled();
  });

  it('treats a missing code as a failure', async () => {
    const target = fakeProcess();
    await exitProcess({ code: null, signal: null }, target);
    expect(target.exit).toHaveBeenCalledWith(1);
  });

  it('re-raises the relayed signal, with an exit-code fallback', async () => {
    const target = fakeProcess();
    await exitProcess({ code: null, signal: 'SIGTERM' }, target);
    expect(target.kill).toHaveBeenCalledWith(4242, 'SIGTERM');
    expect(target.exit).not.toHaveBeenCalled();
    vi.useFakeTimers();
    await exitProcess({ code: null, signal: 'SIGHUP' }, target);
    vi.advanceTimersByTime(1000);
    expect(target.exit).toHaveBeenCalledWith(128 + 1);
  });
});
