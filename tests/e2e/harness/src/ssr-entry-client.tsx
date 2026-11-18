import * as React from 'react';
import { hydrateRoot } from 'react-dom/client';
import '@tecton-mui/ui/styles/fonts.css';
import '@tecton-mui/ui/styles/icons.css';
import { SsrApp } from './ssr-app.js';

const errors: string[] = [];
(window as unknown as { __hydrationErrors: string[] }).__hydrationErrors = errors;
hydrateRoot(document.getElementById('root')!, <SsrApp />, {
  onRecoverableError: (error) => errors.push(String(error)),
});
document.documentElement.dataset.hydrated = 'true';
