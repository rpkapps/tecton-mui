import createCache, { type EmotionCache } from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from '@mui/stylis-plugin-rtl';

let rtlCache: EmotionCache | undefined;

/** Shared Emotion cache that flips styles for `direction: 'rtl'` (created lazily, once). */
export function getRtlCache(): EmotionCache {
  rtlCache ??= createCache({ key: 'muirtl', stylisPlugins: [prefixer, rtlPlugin] });
  return rtlCache;
}
