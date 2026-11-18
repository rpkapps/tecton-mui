# `@tecton-mui/mcp`

A **transparent stdio relay** to the official MUI MCP server ([`@mui/mcp`](https://www.npmjs.com/package/@mui/mcp)), pinned to an exact upstream version.

`tecton-mui-mcp` starts the pinned upstream server as a child process and copies raw bytes between your MCP client and that server: stdin to the server, server stdout to stdout, server stderr to stderr. It does not parse, filter or rewrite anything in between.

- **No custom tools.** The tools, schemas, results and errors your client sees are exactly what the pinned `@mui/mcp` returns.
- **No content filtering, prompt or context injection, documentation rewriting, or Tecton-specific context** (v1, SPEC §10.1).
- **No runtime downloads.** The upstream is an installed, exact-pinned dependency started with the same Node.js binary, never through `npx`.
- **Not part of application builds.** This package is a developer tool. Nothing in `@tecton-mui/ui` or the docs site depends on it.

## Install

```bash
pnpm add -D @tecton-mui/mcp
```

The package is published to the internal registry with restricted access. How the registry is set up (the `.npmrc` scope mapping and authentication) is not decided yet. Until it is, use the package from this workspace.

Requires Node.js 22.12 or later, the minimum the upstream server supports.

## MCP client configuration

The relay speaks MCP over stdio. Point your client at the `tecton-mui-mcp` binary.

### Claude Code (`.mcp.json` in the project root)

```json
{
  "mcpServers": {
    "mui": {
      "command": "pnpm",
      "args": ["exec", "tecton-mui-mcp"]
    }
  }
}
```

Or register it from the CLI with `claude mcp add mui -- pnpm exec tecton-mui-mcp`.

### VS Code (`.vscode/mcp.json`)

```json
{
  "servers": {
    "mui": {
      "type": "stdio",
      "command": "pnpm",
      "args": ["exec", "tecton-mui-mcp"]
    }
  }
}
```

### Cursor (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "mui": {
      "command": "pnpm",
      "args": ["exec", "tecton-mui-mcp"]
    }
  }
}
```

If your client does not run commands from the project directory, use the absolute path to the binary instead: `"command": "node", "args": ["/abs/path/to/node_modules/@tecton-mui/mcp/dist/cli.js"]`.

## Environment variables

The relay passes its whole environment to the upstream unchanged. This means the upstream's own variables work as usual, for example `MUI_RECIPES_API_KEY`, `MUI_DOCS_BASE_URL`, `MUI_BACKEND_BASE_URL` and `MUI_RECIPES_BACKEND_BASE_URL` (see the [`@mui/mcp` README](https://github.com/mui/mui-x/tree/master/packages/mcp#readme)). Set them in the client config's `env` block.

The relay reads two variables of its own:

| Variable                             | Default | Effect                                                                                                                                                                     |
| ------------------------------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TECTON_MUI_MCP_DEBUG`               | unset   | When `1`, writes relay diagnostics (upstream path and version, PID, signals, byte counts, exit status) to **stderr**, prefixed `[tecton-mui-mcp]`. Nothing goes to stdout. |
| `TECTON_MUI_MCP_SHUTDOWN_TIMEOUT_MS` | `3000`  | Grace period after the client closes stdin before the upstream is sent `SIGTERM`, and again before `SIGTERM` escalates to `SIGKILL`.                                       |

The upstream also writes its own log to `~/.mui-mcp.log`.

## Process lifecycle

- **Signals.** `SIGINT`, `SIGTERM` and `SIGHUP` are forwarded to the upstream. When the upstream exits, the relay exits the same way: with the same exit code, or by re-raising the signal that terminated the upstream.
- **Client disconnect.** When stdin ends, the relay ends the upstream's stdin so the upstream can shut down on its own. Offline, `@mui/mcp` keeps retrying its docs-catalog fetch for about a minute after stdin closes. If it is still running when the grace period ends, the relay sends it `SIGTERM` and, if needed, then `SIGKILL`, and exits with code `0`. The relay waits for the upstream to exit before it exits itself, so no orphan or zombie process is left behind.
- **Startup failures.** If the upstream cannot be spawned, is missing, or does not match the pinned version, the relay prints a one-line message to stderr and exits with code `1`.

## Versioning policy

- `@tecton-mui/mcp` is **versioned independently** of `@tecton-mui/ui` and the docs site.
- It pins `@mui/mcp` to an **exact** version in `dependencies`. At startup the relay reads the installed upstream `package.json` and refuses to run if its version differs from the pin. The constants `UPSTREAM_PACKAGE` and `UPSTREAM_VERSION` hold the package name and the installed version.
- **Upgrading the upstream** is a deliberate, manual change:
  1. Bump the exact `@mui/mcp` version in `packages/mcp/package.json` and reinstall.
  2. Run the parity tests: `pnpm --filter @tecton-mui/mcp test`.
  3. Release a new `@tecton-mui/mcp` version through a changeset. A new upstream version gets at least a minor bump, because it can change the tools that clients see.

## Development

```bash
pnpm --filter @tecton-mui/mcp build      # tsc -> dist/, dist/cli.js is the bin
pnpm --filter @tecton-mui/mcp typecheck
pnpm --filter @tecton-mui/mcp test       # vitest, from the repository root config
```

- `src/upstream.ts` resolves the pinned upstream and checks that the installed version matches the pin.
- `src/relay.ts` handles spawning, byte piping and the process lifecycle.
- `src/cli.ts` is the bin entry.

The tests are black-box:

- `tests/relay.test.ts` starts the real upstream twice, once directly and once through the relay (run from source with `tsx`). It requires identical `initialize` results, an identical `tools/list` (names and input schemas), identical unknown-tool and unknown-method errors, byte-identical raw stdout for the same JSON-RPC input, and the same termination after each forwarded signal.
- `tests/relay-lifecycle.test.ts` covers piping, shutdown escalation and spawn failures against a scripted stand-in upstream.

The tests use only offline-capable protocol features. They point `MUI_DOCS_BASE_URL` at an unreachable address so that direct and relayed runs see the same network conditions in any environment.
