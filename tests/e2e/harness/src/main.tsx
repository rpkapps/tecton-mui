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
} else {
  createRoot(container).render(<App scenario={scenario} rtl={params.get('dir') === 'rtl'} />);
}
