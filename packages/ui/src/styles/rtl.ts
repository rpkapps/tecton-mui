import createCache, { type EmotionCache } from '@emotion/cache';
import rtlPlugin from '@mui/stylis-plugin-rtl';

let rtlCache: EmotionCache | undefined;

/**
 * Shared Emotion cache that flips styles for `direction: 'rtl'` (created lazily, once).
 *
 * No `prefixer` from the standalone `stylis` package: Emotion compiles with its own bundled
 * stylis, and a prefixer from a different stylis minor crashes on rules it "lifts"
 * (`::placeholder`, `:read-only`), i.e. on every input. Current browsers need no vendor prefixes.
 */
export function getRtlCache(): EmotionCache {
  rtlCache ??= createCache({ key: 'muirtl', stylisPlugins: [rtlPlugin] });
  return rtlCache;
}
