import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

/** The official MUI MCP server package this relay launches. */
export const UPSTREAM_PACKAGE = '@mui/mcp';

interface PackageJson {
  name?: string;
  version?: string;
  bin?: string | Record<string, string>;
  dependencies?: Record<string, string>;
}

const require = createRequire(import.meta.url);

function readJson(path: string | URL): PackageJson {
  return JSON.parse(readFileSync(path, 'utf8')) as PackageJson;
}

/**
 * Absolute path of the installed upstream `package.json`. The upstream `exports` map only exposes
 * `./package.json`, so the bin entry is located relative to it rather than resolved directly.
 */
function resolveUpstreamPackageJsonPath(): string {
  try {
    return require.resolve(`${UPSTREAM_PACKAGE}/package.json`);
  } catch (error) {
    throw new Error(
      `${UPSTREAM_PACKAGE} is not installed next to @tecton-mui/mcp. Reinstall @tecton-mui/mcp; ` +
        'the relay never downloads the upstream server at runtime.',
      { cause: error },
    );
  }
}

const upstreamPackageJsonPath = resolveUpstreamPackageJsonPath();
const upstreamPackageJson = readJson(upstreamPackageJsonPath);
const ownPackageJson = readJson(new URL('../package.json', import.meta.url));

/** Version of the upstream server actually installed (read from its package.json at runtime). */
export const UPSTREAM_VERSION: string = upstreamPackageJson.version ?? '';

/** Version of the upstream server pinned in this package's `dependencies`. */
export const PINNED_UPSTREAM_VERSION: string =
  ownPackageJson.dependencies?.[UPSTREAM_PACKAGE] ?? '';

const EXACT_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

/**
 * Returns a human-readable problem description when the installed upstream does not match the
 * exact pinned version, or `undefined` when they match.
 */
export function checkUpstreamVersion(installed: string, pinned: string): string | undefined {
  if (!EXACT_VERSION.test(pinned)) {
    return (
      `@tecton-mui/mcp must pin ${UPSTREAM_PACKAGE} to an exact version, ` +
      `but package.json declares "${pinned || '(missing)'}".`
    );
  }
  if (installed !== pinned) {
    return (
      `Installed ${UPSTREAM_PACKAGE}@${installed || '(unknown)'} does not match the pinned ` +
      `${UPSTREAM_PACKAGE}@${pinned}. Reinstall dependencies so the pinned version is used.`
    );
  }
  return undefined;
}

/** Throws when the installed upstream differs from the pinned version. */
export function assertUpstreamPinned(
  installed: string = UPSTREAM_VERSION,
  pinned: string = PINNED_UPSTREAM_VERSION,
): void {
  const problem = checkUpstreamVersion(installed, pinned);
  if (problem) {
    throw new Error(problem);
  }
}

/** Absolute path of the upstream server's stdio entry point (its `bin`). */
export function resolveUpstreamBin(): string {
  const { bin } = upstreamPackageJson;
  const relative = typeof bin === 'string' ? bin : (bin?.mcp ?? Object.values(bin ?? {})[0]);
  if (!relative) {
    throw new Error(`${UPSTREAM_PACKAGE}@${UPSTREAM_VERSION} does not declare a bin entry.`);
  }
  return resolve(dirname(upstreamPackageJsonPath), relative);
}
