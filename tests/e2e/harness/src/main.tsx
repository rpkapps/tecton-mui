import * as React from 'react';
import { createRoot } from 'react-dom/client';
import '@tecton-mui/ui/styles/fonts.css';
import '@tecton-mui/ui/styles/icons.css';
import '@tecton-mui/ui/styles/tokens.css';
import { initTecton } from '@tecton-mui/ui/styles';
import { App } from './App.js';
import { MultiRootPanel } from './MultiRoot.js';

const params = new URLSearchParams(location.search);
const manager = initTecton();
const mode = params.get('mode');
if (mode === 'light' || mode === 'dark') manager?.setMode(mode);

const scenario = params.get('scenario') ?? 'showcase';
const container = document.getElementById('root')!;
if (scenario === 'multi-root') {
  // Two independently mounted React roots (shell + hosted MFE) sharing one document, each with its
  // own id prefix as the MFE guide recommends.
  for (const name of ['shell', 'mfe'] as const) {
    const el = document.createElement('div');
    el.id = `root-${name}`;
    container.appendChild(el);
    createRoot(el, { identifierPrefix: `${name}-` }).render(<MultiRootPanel name={name} />);
  }
} else if (scenario === 'modal-layer') {
  // Loaded on demand: it brings a second copy of MUI that no other scenario should load.
  void import('./ModalLayerScenario.js').then((m) => m.mountModalLayerScenario(container));
} else {
  // The Storybook reproductions render once the Tecton font has loaded, as a Storybook story does
  // (the Storybook has its font before the story renders). A font that arrives after the first
  // render changes the text widths, and MUI's scrollable tabs react to that: they scroll the
  // selected tab into view again, which the Storybook's tabs never do.
  const fontReady =
    scenario.startsWith('sb:') && document.fonts
      ? Promise.race([
          document.fonts.load('400 1em Figtree').catch(() => undefined),
          new Promise((resolve) => setTimeout(resolve, 3000)),
        ])
      : Promise.resolve();
  void fontReady.then(() => {
    createRoot(container).render(<App scenario={scenario} rtl={params.get('dir') === 'rtl'} />);
  });
}
