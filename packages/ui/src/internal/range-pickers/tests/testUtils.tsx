import * as React from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { LocalizationProvider } from '../../../LocalizationProvider/index.js';

export function renderWithProvider(ui: React.ReactElement, options?: RenderOptions): RenderResult {
  return render(ui, {
    wrapper: ({ children }) => <LocalizationProvider>{children}</LocalizationProvider>,
    ...options,
  });
}

export const day = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m, d, h, min);

export const fmt = (value: [Date | null, Date | null]) =>
  value.map((date) => (date ? date.toISOString() : null));

/** Local date strings, easier to read than ISO when the time zone shifts the day. */
export const days = (value: readonly (Date | null)[]) =>
  value.map((date) =>
    date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
          date.getDate(),
        ).padStart(2, '0')}`
      : null,
  );

export const times = (value: readonly (Date | null)[]) =>
  value.map((date) =>
    date
      ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
      : null,
  );

export function mockMatchMedia(matches: boolean) {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
  return () => {
    window.matchMedia = original;
  };
}
