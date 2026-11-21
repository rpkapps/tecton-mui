import { describe, expect, it } from 'vitest';
import { ICON_NAMES, searchIcons } from '../iconSearch';
import { iconKeywords } from '../iconKeywords';
import { ICON_IMPORT, iconJsx, svgFromCssUrl } from '../iconSnippets';

describe('icon search', () => {
  it('lists every icon alphabetically for an empty query', () => {
    expect(searchIcons('   ')).toEqual(ICON_NAMES);
    expect(ICON_NAMES.length).toBeGreaterThan(100);
  });

  it('only has keywords for icons of the pinned Tecton version', () => {
    const missing = Object.keys(iconKeywords).filter(
      (name) => !(ICON_NAMES as string[]).includes(name),
    );
    expect(missing).toEqual([]);
  });

  it('ranks the exact name first', () => {
    expect(searchIcons('close')[0]).toBe('close');
    expect(searchIcons('close')).toContain('close-small');
    expect(searchIcons('3d')[0]).toBe('3d');
  });

  it('matches every word, in any separator style', () => {
    expect(searchIcons('chevron left')).toEqual(['chevron-left', 'chevron-left-small']);
    expect(searchIcons('Chevron-Left_small')).toEqual(['chevron-left-small']);
    expect(searchIcons('left small chevron')).toEqual(['chevron-left-small']);
  });

  it('matches name word prefixes and substrings', () => {
    expect(searchIcons('chev')).toContain('chevron-up');
    // "box" is inside "checkbox-*"; the keyword "box" (container, cube) ranks higher.
    const box = searchIcons('box');
    expect(box).toEqual(expect.arrayContaining(['checkbox-checked', 'container', 'cube']));
    expect(box.indexOf('container')).toBeLessThan(box.indexOf('checkbox-checked'));
  });

  it('finds icons by what they show', () => {
    expect(searchIcons('trash')).toEqual(['delete']);
    expect(searchIcons('gear')[0]).toBe('settings');
    expect(searchIcons('pencil')).toContain('edit-square');
    expect(searchIcons('sign out')).toEqual(['log-out']);
    expect(searchIcons('kebab')).toEqual(['more-vert']);
  });

  it('prefers name matches over keyword matches', () => {
    const results = searchIcons('search');
    expect(results[0]).toBe('search');
  });

  it('returns nothing for an unknown word', () => {
    expect(searchIcons('xylophone')).toEqual([]);
    expect(searchIcons('chevron xylophone')).toEqual([]);
  });
});

describe('icon snippets', () => {
  it('writes variant="filled" only when the icon has a filled glyph', () => {
    expect(iconJsx('delete', 'outline')).toBe('<Icon name="delete" />');
    expect(iconJsx('delete', 'filled')).toBe('<Icon name="delete" variant="filled" />');
    // Outline-only and multicolor icons render the same glyph whatever the variant.
    expect(iconJsx('container', 'filled')).toBe('<Icon name="container" />');
    expect(iconJsx('aam-symbol', 'filled')).toBe('<Icon name="aam-symbol" />');
    expect(ICON_IMPORT).toBe("import Icon from '@tecton-mui/ui/Icon';");
  });

  it('decodes the SVG from a Tecton CSS url() value', () => {
    const svg = '<svg viewBox="0 0 16 16"><path d="M0 0h16" fill="currentColor"/></svg>';
    const encoded = encodeURIComponent(svg.replace('><', '>\r\n<'));
    expect(svgFromCssUrl(` url("data:image/svg+xml,${encoded}")`)).toBe(svg.replace('><', '>\n<'));
    expect(svgFromCssUrl(`url(data:image/svg+xml;base64,${btoa(svg)})`)).toBe(svg);
    // Tecton glyphs with a clip path have parentheses inside the (quoted) data URL.
    const clipped = '<svg><g clip-path="url(#clip0)"><path d="M0 0"/></g></svg>';
    expect(svgFromCssUrl(`url("data:image/svg+xml,${encodeURIComponent(clipped)}")`)).toBe(clipped);
    expect(svgFromCssUrl(`url('data:image/svg+xml,${encodeURIComponent(clipped)}')`)).toBe(clipped);
    expect(svgFromCssUrl('url("data:image/png;base64,AAAA")')).toBeNull();
    expect(svgFromCssUrl('none')).toBeNull();
    expect(svgFromCssUrl('url("data:image/svg+xml,%E0%A4%A")')).toBeNull();
    expect(svgFromCssUrl('url("data:image/svg+xml,hello")')).toBeNull();
  });
});
