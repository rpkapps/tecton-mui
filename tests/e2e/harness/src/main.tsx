import * as React from 'react';
import { createRoot } from 'react-dom/client';
import '@tecton-mui/ui/styles/fonts.css';
import '@tecton-mui/ui/styles/icons.css';
import '@tecton-mui/ui/styles/tokens.css';
import { initTecton } from '@tecton-mui/ui/styles';
import { App } from './App.js';

const params = new URLSearchParams(location.search);
const manager = initTecton();
manager?.setMode((params.get('mode') as 'light' | 'dark') ?? 'light');
createRoot(document.getElementById('root')!).render(
  <App scenario={params.get('scenario') ?? 'showcase'} rtl={params.get('dir') === 'rtl'} />,
);
