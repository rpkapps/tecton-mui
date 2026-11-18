/**
 * Internal adapter contract. Every Tecton source adapter (UMD today, npm later) produces a
 * RawTectonSource; the normalizer turns it into a NormalizedTectonTheme which the emitter writes
 * into @tecton-mui/ui. Applications never see these types.
 */
export type TectonSourceOrigin = 'umd' | 'npm';

export interface RawTectonSource {
  version: string;
  origin: TectonSourceOrigin;
  /** Compiled tecton-core ESM module (regions: tokens, injectTokens, ThemeManager, palettes, scales, typography). */
  coreModule: string;
  /** Original tecton-mui TypeScript sources keyed by path relative to its src/ directory. */
  muiSources: Record<string, string>;
  fontsCss: string;
  iconsCss: string;
  /** Font binaries keyed by their path relative to fonts.css (assets/fonts/*.woff2). */
  fonts: Record<string, Uint8Array>;
  /** Where each artifact came from, for THIRD_PARTY/provenance notes. */
  provenance: Record<string, string>;
}

export type TectonMode = 'light' | 'dark';

export interface NormalizedIcon {
  /** Base icon name, e.g. `add` (monochrome) or `aam-letters` (multicolor). */
  name: string;
  variants: Array<'outline' | 'filled'>;
  multicolor: boolean;
}

export interface NormalizedTectonTheme {
  version: string;
  origin: TectonSourceOrigin;
  modes: TectonMode[];
  tokensCss: string;
  tokenNames: string[];
  icons: NormalizedIcon[];
  /** TypeScript modules to emit, keyed by path relative to the generated directory. */
  modules: Record<string, string>;
  /** Static CSS/font assets to emit, keyed by path relative to the assets directory. */
  assets: Record<string, string | Uint8Array>;
}
