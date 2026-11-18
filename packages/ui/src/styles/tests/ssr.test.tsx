import { renderToStaticMarkup } from 'react-dom/server';
import { TectonModeScript, TectonTokensStyle, getTectonModeScript } from '../index.js';

describe('SSR helpers', () => {
  it('mode script applies the stored preference before paint', () => {
    localStorage.setItem('tecton-theme-mode', 'dark');
    new Function(getTectonModeScript())();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    localStorage.setItem('tecton-theme-mode', 'bogus');
    new Function(getTectonModeScript({ defaultMode: 'light' }))();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    localStorage.clear();
  });

  it('renders script and token style markup', () => {
    expect(renderToStaticMarkup(<TectonModeScript nonce="n" />)).toContain('nonce="n"');
    const style = renderToStaticMarkup(<TectonTokensStyle />);
    expect(style).toContain('data-tecton="tokens"');
    expect(style).toContain('--tecton-space-100');
  });
});
