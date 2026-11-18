// Upstream access for the documentation sync: raw files of a tagged MUI repository, cached on disk
// so that a sync can be re-run (and reviewed) without fetching everything again.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export class Upstream {
  /**
   * @param {{ repo: string, ref: string, cacheDir: string, offline?: boolean, refresh?: boolean }} options
   */
  constructor({ repo, ref, cacheDir, offline = false, refresh = false }) {
    this.repo = repo;
    this.ref = ref;
    this.cacheDir = join(cacheDir, repo.replace('/', '__'), ref);
    this.offline = offline;
    this.refresh = refresh;
    this.fetched = 0;
  }

  url(path) {
    return `https://raw.githubusercontent.com/${this.repo}/${this.ref}/${path}`;
  }

  /** Returns the file text, or `null` when the file does not exist at this ref. */
  async read(path) {
    const file = join(this.cacheDir, path);
    const missing = `${file}.404`;
    if (!this.refresh) {
      if (existsSync(file)) return readFileSync(file, 'utf8');
      if (existsSync(missing)) return null;
    }
    if (this.offline) throw new Error(`Not in the sync cache (offline): ${path}`);
    const text = await fetchWithRetry(this.url(path));
    mkdirSync(dirname(file), { recursive: true });
    this.fetched += 1;
    if (text === null) {
      writeFileSync(missing, '');
      return null;
    }
    writeFileSync(file, text);
    return text;
  }

  async require(path) {
    const text = await this.read(path);
    if (text === null) throw new Error(`Upstream file not found: ${this.url(path)}`);
    return text;
  }
}

async function fetchWithRetry(url, attempts = 4) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (error) {
      lastError = error;
      await new Promise((r) => setTimeout(r, 500 * 2 ** i));
    }
  }
  throw new Error(`Fetch failed: ${url} (${lastError?.message})`);
}

/** Runs `fn` over `items` with at most `limit` concurrent calls; keeps the input order. */
export async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}
