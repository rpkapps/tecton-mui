// Bridges Tecton's page-wide `themeManager` (the single source of truth for light/dark mode) to
// React via useSyncExternalStore. There is deliberately no React-owned mode state: every root on
// the page (shell and independently mounted MFEs) reads the same globalThis-shared manager.
import { useSyncExternalStore } from 'react';
import {
  TOKENS_MARKER,
  sharedThemeManager,
  type TectonThemeManager,
  type ThemeManagerConfig,
  type ThemeMode,
  type ThemeModePreference,
} from './tecton/index.js';

export type { ThemeMode, ThemeModePreference, ThemeManagerConfig };

let manager: TectonThemeManager | null = null;
let serverMode: ThemeMode = 'light';

/**
 * Tecton's manager injects a `<style data-tecton="tokens">` when it first initializes. When the
 * host already loaded the tokens as CSS (e.g. `styles/global.css`), mark them as present so the
 * variables are not injected a second time.
 */
function markStaticTokens(): void {
  if (document.querySelector(`style[data-tecton="${TOKENS_MARKER}"]`)) return;
  const probe = getComputedStyle(document.documentElement).getPropertyValue('--tecton-space-100');
  if (probe.trim() === '') return;
  const marker = document.createElement('style');
  marker.setAttribute('data-tecton', TOKENS_MARKER);
  marker.setAttribute('data-tecton-static', 'true');
  document.head.appendChild(marker);
}

/** Returns the page-wide Tecton theme manager, initializing it on first use (browser only). */
export function getThemeManager(): TectonThemeManager | null {
  if (manager) return manager;
  if (typeof document === 'undefined') return null;
  markStaticTokens();
  manager = sharedThemeManager();
  return manager;
}

/**
 * Explicit host initialization step: initializes the shared Tecton manager (token injection,
 * `data-theme` on <html>) and optionally applies configuration. Safe to call from every root;
 * on the server it only records `defaultMode` as the server-render mode.
 */
export function initTecton(config?: ThemeManagerConfig): TectonThemeManager | null {
  if (config?.defaultMode && config.defaultMode !== 'system') serverMode = config.defaultMode;
  const m = getThemeManager();
  if (m && config) m.configure(config);
  return m;
}

const subscribe = (onChange: () => void): (() => void) => {
  const m = getThemeManager();
  if (!m) return () => {};
  const unsubscribe = m.subscribe(onChange);
  return () => {
    unsubscribe();
  };
};
const getMode = (): ThemeMode => getThemeManager()?.getMode() ?? serverMode;
const getPreference = (): ThemeModePreference => getThemeManager()?.getPreference() ?? serverMode;
const getServerMode = (): ThemeMode => serverMode;

/** Current shared Tecton mode. Re-renders only when the mode changes. SSR/hydration safe. */
export function useTectonModeValue(): ThemeMode {
  return useSyncExternalStore(subscribe, getMode, getServerMode);
}

export interface TectonModeApi {
  mode: ThemeMode;
  preference: ThemeModePreference;
  setMode: (mode: ThemeModePreference) => void;
  toggleMode: () => void;
  clearPreference: () => void;
}

// Stable action references: consumers can pass them to memoized children without re-renders.
const setMode = (mode: ThemeModePreference) => getThemeManager()?.setMode(mode);
const toggleMode = () => getThemeManager()?.toggleMode();
const clearPreference = () => getThemeManager()?.clearPreference();

/** Read and change the shared Tecton light/dark mode (affects every root on the page). */
export function useTectonMode(): TectonModeApi {
  const mode = useTectonModeValue();
  const preference = useSyncExternalStore(subscribe, getPreference, getServerMode);
  return { mode, preference, setMode, toggleMode, clearPreference };
}

/** @internal test helper */
export function __resetModeStoreForTests(): void {
  manager = null;
  serverMode = 'light';
}
