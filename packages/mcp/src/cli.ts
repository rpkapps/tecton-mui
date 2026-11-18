#!/usr/bin/env node
// Entry point for `tecton-mui-mcp`: a transparent stdio relay to the pinned official MUI MCP server.

function fail(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`tecton-mui-mcp: ${message}\n`);
  process.exit(1);
}

try {
  // Loaded dynamically so a missing or mismatched upstream produces a one-line error, not a stack.
  const { startRelay, exitProcess } = await import('./relay.js');
  const exit = await startRelay({ forwardArgs: process.argv.slice(2) }).done;
  await exitProcess(exit);
} catch (error) {
  fail(error);
}
