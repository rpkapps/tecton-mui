import type { TreeViewDataSourceCache } from './types.js';

export interface TreeViewDataSourceCacheDefaultOptions {
  /** Time to live of each entry in milliseconds. @default 300_000 (5 minutes) */
  ttl?: number;
}

/** In-memory cache with a time to live, used when `dataSourceCache` is not provided. */
export class TreeViewDataSourceCacheDefault<R = unknown> implements TreeViewDataSourceCache<R> {
  private readonly entries = new Map<string, { value: R[]; expiresAt: number }>();

  private readonly ttl: number;

  constructor(options: TreeViewDataSourceCacheDefaultOptions = {}) {
    this.ttl = options.ttl ?? 300_000;
  }

  get(key: string): R[] | undefined {
    const entry = this.entries.get(key);
    if (!entry) {
      return undefined;
    }
    if (Date.now() > entry.expiresAt) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: R[]): void {
    this.entries.set(key, { value, expiresAt: Date.now() + this.ttl });
  }

  clear(): void {
    this.entries.clear();
  }
}
