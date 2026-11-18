import type {
  GridDataSourceCache,
  GridGetRowsParams,
  GridGetRowsResponse,
} from '../../public-types.js';

/** Default in-memory data source cache with a time-to-live. */
export class GridDataSourceCacheDefault implements GridDataSourceCache {
  private entries = new Map<string, { value: GridGetRowsResponse; expires: number }>();
  constructor(private ttlMs = 5 * 60_000) {}

  get(key: string): GridGetRowsResponse | undefined {
    const hit = this.entries.get(key);
    if (!hit) return undefined;
    if (hit.expires < Date.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return hit.value;
  }

  set(key: string, value: GridGetRowsResponse): void {
    this.entries.set(key, { value, expires: Date.now() + this.ttlMs });
  }

  clear(): void {
    this.entries.clear();
  }
}

export const cacheKey = (params: GridGetRowsParams): string => JSON.stringify(params);
