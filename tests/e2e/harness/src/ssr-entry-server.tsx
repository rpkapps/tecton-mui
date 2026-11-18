import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { TectonModeScript, TectonTokensStyle } from '@tecton-mui/ui/styles';
import { renderToStaticMarkup } from 'react-dom/server';
import { SsrApp } from './ssr-app.js';

export function render(): { head: string; html: string } {
  return {
    head: renderToStaticMarkup(
      <>
        <TectonModeScript />
        <TectonTokensStyle />
      </>,
    ),
    html: renderToString(<SsrApp />),
  };
}
