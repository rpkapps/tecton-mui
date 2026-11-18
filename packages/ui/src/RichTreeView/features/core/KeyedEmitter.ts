export type Listener = () => void;

/**
 * Minimal external-store emitter with per-key subscriptions.
 *
 * Items subscribe to their own key (their item id) so that a change affecting one item
 * (drag hover target, lazy-loading status, virtual row position) only wakes up the
 * subscribers of that item instead of the whole tree. Global subscribers are notified on
 * every emit.
 */
export class KeyedEmitter {
  private readonly keyed = new Map<string, Set<Listener>>();

  private readonly global = new Set<Listener>();

  subscribe = (listener: Listener): (() => void) => {
    this.global.add(listener);
    return () => {
      this.global.delete(listener);
    };
  };

  subscribeKey = (key: string, listener: Listener): (() => void) => {
    let listeners = this.keyed.get(key);
    if (!listeners) {
      listeners = new Set();
      this.keyed.set(key, listeners);
    }
    listeners.add(listener);
    return () => {
      const current = this.keyed.get(key);
      if (!current) {
        return;
      }
      current.delete(listener);
      if (current.size === 0) {
        this.keyed.delete(key);
      }
    };
  };

  /** Number of keyed listeners for `key` (used by tests and diagnostics). */
  listenerCount(key: string): number {
    return this.keyed.get(key)?.size ?? 0;
  }

  /** Notifies the subscribers of the given keys, then the global subscribers. */
  emit(keys: Iterable<string> = []): void {
    const toCall: Listener[] = [];
    const seen = new Set<string>();
    for (const key of keys) {
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      const listeners = this.keyed.get(key);
      if (listeners) {
        toCall.push(...listeners);
      }
    }
    toCall.push(...this.global);
    for (const listener of toCall) {
      listener();
    }
  }

  /** Notifies every keyed and global subscriber. */
  emitAll(): void {
    const toCall: Listener[] = [];
    for (const listeners of this.keyed.values()) {
      toCall.push(...listeners);
    }
    toCall.push(...this.global);
    for (const listener of toCall) {
      listener();
    }
  }
}
