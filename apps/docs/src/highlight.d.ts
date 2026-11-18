/** `import source from './File.tsx?highlight'` (scripts/highlight-plugin.ts). */
declare module '*?highlight' {
  const source: {
    /** File content. */
    code: string;
    /** Shiki line markup (content of `<code>`), Tecton-token colors. */
    html: string;
    /** File extension, e.g. `tsx`. */
    language: string;
  };
  export default source;
}
