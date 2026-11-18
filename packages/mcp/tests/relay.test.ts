// @vitest-environment node
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { EmptyResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { afterAll, describe, expect, it } from 'vitest';
import { UPSTREAM_VERSION, resolveUpstreamBin } from '../src/upstream.js';

// Black-box protocol parity: every check talks to the pinned upstream twice, once directly and once
// through the relay CLI (run from source via tsx), and requires identical observable behaviour.
// Only offline-capable behaviour is exercised; the docs backend is pointed at a refused address so
// both servers see the same (unreachable) network regardless of the sandbox.

const PACKAGE_DIR = fileURLToPath(new URL('..', import.meta.url));
const TEST_HOME = mkdtempSync(join(tmpdir(), 'tecton-mui-mcp-parity-'));

interface ServerCommand {
  label: string;
  command: string;
  args: string[];
}

const DIRECT: ServerCommand = {
  label: 'direct',
  command: process.execPath,
  args: [resolveUpstreamBin()],
};
const RELAY: ServerCommand = {
  label: 'relay',
  command: process.execPath,
  args: ['--import', 'tsx', join(PACKAGE_DIR, 'src', 'cli.ts')],
};

afterAll(() => {
  rmSync(TEST_HOME, { recursive: true, force: true });
});

function serverEnv(extra: Record<string, string> = {}): Record<string, string> {
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined && !key.startsWith('TECTON_MUI_MCP_') && !key.startsWith('MUI_')) {
      env[key] = value;
    }
  }
  return {
    ...env,
    // Keep upstream's ~/.mui-mcp.log out of the real home directory.
    HOME: TEST_HOME,
    USERPROFILE: TEST_HOME,
    // Deterministic offline docs backend (fetch rejects port 9 immediately).
    MUI_DOCS_BASE_URL: 'http://127.0.0.1:9',
    TECTON_MUI_MCP_SHUTDOWN_TIMEOUT_MS: '500',
    ...extra,
  };
}

async function protocolSnapshot(server: ServerCommand) {
  const transport = new StdioClientTransport({
    command: server.command,
    args: server.args,
    cwd: PACKAGE_DIR,
    env: serverEnv(),
    stderr: 'pipe',
  });
  transport.stderr?.on('data', () => {});
  const client = new Client({ name: 'tecton-mui-mcp-parity', version: '1.0.0' });
  await client.connect(transport);
  try {
    const tools = await client.listTools();
    const unknownTool = await client
      .callTool({ name: 'tecton-parity-unknown-tool', arguments: {} })
      .then(
        (result) => ({ result }),
        (error: { code?: number; message?: string }) => ({
          error: { code: error.code, message: error.message },
        }),
      );
    const unknownMethod = await client
      .request({ method: 'tecton/parity-unknown-method' } as never, EmptyResultSchema)
      .then(
        (result) => ({ result }),
        (error: { code?: number; message?: string }) => ({
          error: { code: error.code, message: error.message },
        }),
      );
    return {
      serverInfo: client.getServerVersion(),
      capabilities: client.getServerCapabilities(),
      instructions: client.getInstructions(),
      tools: tools.tools,
      toolNames: tools.tools.map((tool) => tool.name),
      inputSchemas: Object.fromEntries(tools.tools.map((tool) => [tool.name, tool.inputSchema])),
      unknownTool,
      unknownMethod,
    };
  } finally {
    await client.close();
  }
}

interface RawRun {
  stdout: Buffer;
  stderr: string;
  code: number | null;
  signal: NodeJS.Signals | null;
}

/**
 * Spawns `server`, writes `chunks` to its stdin, waits for `expectedLines` newline-terminated lines
 * on stdout, then either closes stdin and waits for a natural exit or kills the process.
 */
function rawRun(
  server: ServerCommand,
  chunks: Buffer[],
  expectedLines: number,
  finish: 'close-stdin' | 'kill',
  extraEnv: Record<string, string> = {},
): Promise<RawRun> {
  return new Promise((resolve, reject) => {
    const child = spawn(server.command, server.args, {
      cwd: PACKAGE_DIR,
      env: serverEnv(extraEnv),
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const out: Buffer[] = [];
    const err: Buffer[] = [];
    let done = false;
    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`${server.label}: timed out; stderr:\n${Buffer.concat(err)}`));
    }, 20_000);
    child.on('error', reject);
    child.stderr.on('data', (chunk: Buffer) => err.push(chunk));
    child.stdout.on('data', (chunk: Buffer) => {
      out.push(chunk);
      const lines = Buffer.concat(out).toString('utf8').split('\n').length - 1;
      if (!done && lines >= expectedLines) {
        done = true;
        if (finish === 'close-stdin') {
          child.stdin.end();
        } else {
          child.kill('SIGKILL');
        }
      }
    });
    child.on('close', (code, signal) => {
      clearTimeout(timeout);
      resolve({ stdout: Buffer.concat(out), stderr: Buffer.concat(err).toString(), code, signal });
    });
    void (async () => {
      for (const chunk of chunks) {
        child.stdin.write(chunk);
        await new Promise((r) => setTimeout(r, 25));
      }
    })();
  });
}

describe('protocol parity with the pinned upstream', () => {
  it('returns identical initialize, tools/list and error responses', async () => {
    const [direct, relayed] = await Promise.all([
      protocolSnapshot(DIRECT),
      protocolSnapshot(RELAY),
    ]);

    expect(relayed.serverInfo).toEqual(direct.serverInfo);
    expect(relayed.capabilities).toEqual(direct.capabilities);
    expect(relayed.instructions).toEqual(direct.instructions);
    expect(relayed.toolNames).toEqual(direct.toolNames);
    expect(relayed.inputSchemas).toEqual(direct.inputSchemas);
    expect(relayed.tools).toEqual(direct.tools);
    expect(relayed.unknownTool).toEqual(direct.unknownTool);
    expect(relayed.unknownMethod).toEqual(direct.unknownMethod);

    // Sanity-check that the snapshot is meaningful, not two identical failures.
    expect(direct.serverInfo).toEqual({ name: 'mui-mcp', version: UPSTREAM_VERSION });
    expect(direct.toolNames).toEqual(expect.arrayContaining(['fetchDocs', 'generateReactCode']));
    expect(direct.unknownTool).toMatchObject({ result: { isError: true } });
    expect(direct.unknownMethod).toMatchObject({ error: { code: -32601 } });
  }, 30_000);

  it('produces byte-identical stdout for the same raw JSON-RPC input', async () => {
    const request = (message: object) => Buffer.from(`${JSON.stringify(message)}\n`, 'utf8');
    const unknownTool = request({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: { name: 'nö-tööl-✓', arguments: {} },
    });
    // Split inside the multibyte "✓" so the relay must not decode or re-chunk text.
    const split = unknownTool.indexOf(Buffer.from('✓', 'utf8')) + 1;
    const chunks = [
      Buffer.concat([
        request({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2025-06-18',
            capabilities: {},
            clientInfo: { name: 'raw-parity', version: '1.0.0' },
          },
        }),
        request({ jsonrpc: '2.0', method: 'notifications/initialized' }),
      ]),
      request({ jsonrpc: '2.0', id: 2, method: 'tools/list' }),
      unknownTool.subarray(0, split),
      unknownTool.subarray(split),
      request({ jsonrpc: '2.0', id: 'four', method: 'no/such-method', params: {} }),
    ];

    const [direct, relayed] = await Promise.all([
      rawRun(DIRECT, chunks, 4, 'kill'),
      // Diagnostics enabled to prove they never reach stdout.
      rawRun(RELAY, chunks, 4, 'close-stdin', { TECTON_MUI_MCP_DEBUG: '1' }),
    ]);

    expect(direct.stdout.length).toBeGreaterThan(0);
    expect(relayed.stdout.equals(direct.stdout)).toBe(true);
    expect(direct.stdout.toString('utf8')).toContain('nö-tööl-✓');
    expect(relayed.stderr).toContain('[tecton-mui-mcp]');
    expect(relayed).toMatchObject({ code: 0, signal: null });
  }, 30_000);
});

describe('relay process lifecycle', () => {
  const initialize = Buffer.from(
    JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'lifecycle', version: '1.0.0' },
      },
    }) + '\n',
  );

  it('exits 0 after stdin closes', async () => {
    const run = await rawRun(RELAY, [initialize], 1, 'close-stdin');
    expect(run).toMatchObject({ code: 0, signal: null });
    expect(JSON.parse(run.stdout.toString()).id).toBe(1);
  }, 20_000);

  it.each(['SIGINT', 'SIGTERM', 'SIGHUP'] as const)(
    'forwards %s to the upstream and terminates like it, leaving no process behind',
    async (signal) => {
      const signalled = (server: ServerCommand) =>
        new Promise<{ code: number | null; signal: NodeJS.Signals | null; stderr: string }>(
          (resolve, reject) => {
            const child = spawn(server.command, server.args, {
              cwd: PACKAGE_DIR,
              env: serverEnv({ TECTON_MUI_MCP_DEBUG: '1' }),
              stdio: ['pipe', 'pipe', 'pipe'],
            });
            let stderr = '';
            const timeout = setTimeout(() => {
              child.kill('SIGKILL');
              reject(new Error(`${server.label}: no exit after ${signal}; stderr:\n${stderr}`));
            }, 15_000);
            child.stderr.on('data', (chunk: Buffer) => (stderr += chunk.toString()));
            child.stdout.once('data', () => child.kill(signal));
            child.on('close', (code, sig) => {
              clearTimeout(timeout);
              resolve({ code, signal: sig, stderr });
            });
            child.stdin.write(initialize);
          },
        );

      const [direct, relayed] = await Promise.all([signalled(DIRECT), signalled(RELAY)]);
      expect({ code: relayed.code, signal: relayed.signal }).toEqual({
        code: direct.code,
        signal: direct.signal,
      });
      expect(relayed.signal).toBe(signal);
      expect(relayed.stderr).toContain(`received ${signal}, forwarding to upstream`);

      const upstreamPid = Number(/upstream pid=(\d+)/.exec(relayed.stderr)?.[1]);
      expect(upstreamPid).toBeGreaterThan(0);
      expect(() => process.kill(upstreamPid, 0)).toThrow(
        expect.objectContaining({ code: 'ESRCH' }),
      );
    },
    20_000,
  );
});
