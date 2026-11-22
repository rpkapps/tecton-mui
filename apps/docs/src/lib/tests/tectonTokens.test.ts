import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  tectonBorderRadius,
  tectonBorderWidth,
  tectonIconSize,
  tectonSpacing,
} from '@tecton-mui/ui/styles';
import {
  COLOR_PREFIX,
  formatFactor,
  groupColorTokens,
  parseTokenCss,
  roleLabel,
  scaleEntries,
} from '../tectonTokens';

// The stylesheet ../tokenData.ts imports with `?raw`. The test config disables CSS processing, which
// empties CSS imports, so read the file directly (Vitest runs from the repository root).
const variables = parseTokenCss(
  readFileSync(resolve(process.cwd(), 'packages/ui/assets/tecton/tokens.css'), 'utf8'),
);
const byName = new Map(variables.map((v) => [v.name, v]));

describe('parseTokenCss', () => {
  it('reads light and dark values and keeps mode-independent tokens', () => {
    const parsed = parseTokenCss(`
      /* comment { --tecton-color-ignored: red; } */
      :root, [data-theme="light"] { color-scheme: light; --tecton-space-100: 8px; --tecton-color-a: #fff; }
      [data-theme="dark"] { --tecton-color-a: #000; }
      .unrelated { --tecton-color-b: red; }
    `);
    expect(parsed).toEqual([
      { name: '--tecton-space-100', light: '8px', dark: '8px' },
      { name: '--tecton-color-a', light: '#fff', dark: '#000' },
    ]);
  });

  it('finds a dark value for every color of the pinned Tecton version', () => {
    const colors = variables.filter((v) => v.name.startsWith(COLOR_PREFIX));
    expect(colors.length).toBeGreaterThan(100);
    expect(byName.get('--tecton-color-text-primary')?.light).toMatch(/^#/);
    expect(byName.get('--tecton-color-text-primary')?.dark).toMatch(/^#/);
    expect(byName.get('--tecton-color-text-primary')?.light).not.toBe(
      byName.get('--tecton-color-text-primary')?.dark,
    );
  });
});

describe('groupColorTokens', () => {
  const groups = groupColorTokens(variables);

  it('puts every color variable in exactly one group, as a row or as an alias', () => {
    const grouped = Object.values(groups).flatMap((rows) =>
      rows.flatMap((r) => [r.name, ...(r.aliases ?? [])]),
    );
    const colors = variables.filter((v) => v.name.startsWith(COLOR_PREFIX)).map((v) => v.name);
    expect(grouped.sort()).toEqual([...colors].sort());
  });

  it('has a section for every prefix of the pinned Tecton version', () => {
    // A failure here means a Tecton update added a new kind of color: give it a section on the
    // Colors page (it is shown under "Other colors" until then).
    expect(groups.other.map((r) => r.name)).toEqual([]);
    for (const [id, rows] of Object.entries(groups)) {
      if (id !== 'other') expect(rows.length, id).toBeGreaterThan(0);
    }
  });

  it('labels rows by role and state', () => {
    const label = (name: string) =>
      Object.values(groups)
        .flat()
        .find((r) => r.name === `${COLOR_PREFIX}${name}`)?.label;
    expect(label('text-primary')).toBe('Primary');
    expect(label('action-primary-bg-hover')).toBe('Background, hover');
    expect(label('input-filled-bg-hover')).toBe('Background, hover');
    expect(
      groups['input-filled'].find((r) => r.name === `${COLOR_PREFIX}input-filled-bg-hover`)
        ?.aliases,
    ).toContain(`${COLOR_PREFIX}component-input-filled-states-hover-background`);
    expect(label('status-success')).toBe('Main');
    expect(label('divider')).toBe('Default');
    expect(label('focus-ring')).toBe('Focus ring');
  });

  it('lists the tokens with guidance first', () => {
    expect(groups.text.slice(0, 2).map((r) => r.name)).toEqual([
      '--tecton-color-text-primary',
      '--tecton-color-text-secondary',
    ]);
    expect(groups['status-success'].slice(0, 3).map((r) => r.label)).toEqual([
      'Main',
      'Muted',
      'Bright',
    ]);
  });

  it('folds component-* aliases into the row they duplicate', () => {
    const row = groups['input-filled'].find((r) => r.name === '--tecton-color-input-filled-bg');
    expect(row?.aliases).toEqual(['--tecton-color-component-input-filled-background']);
    const all = Object.values(groups).flat();
    for (const r of all) {
      for (const alias of r.aliases ?? []) {
        const source = byName.get(alias);
        expect([source?.light, source?.dark], alias).toEqual([r.light, r.dark]);
      }
    }
  });

  it('lists aliases that have no short name after the short names', () => {
    for (const [id, rows] of Object.entries(groups)) {
      const names = rows.map((r) => r.name);
      const firstAlias = names.findIndex((n) => n.includes('-component-'));
      if (firstAlias === -1) continue;
      expect(
        names.slice(firstAlias).every((n) => n.includes('-component-')),
        id,
      ).toBe(true);
    }
  });
});

describe('roleLabel', () => {
  it('reads token name parts as words', () => {
    expect(roleLabel('')).toBe('Main');
    expect(roleLabel('contrast-text')).toBe('Text');
    expect(roleLabel('outline-adornment-press')).toBe('Outlined icon, press');
    expect(roleLabel('text-only-text')).toBe('Text-only text');
    expect(roleLabel('hover')).toBe('Hover');
  });
});

describe('scales', () => {
  it.each([
    ['--tecton-space-', tectonSpacing],
    ['--tecton-radius-', tectonBorderRadius],
    ['--tecton-border-width-', tectonBorderWidth],
    ['--tecton-icon-size-', tectonIconSize],
  ])('every %s step has a CSS variable with the same value', (prefix, scale) => {
    for (const [key, value] of scaleEntries(scale as Record<string, number>)) {
      expect(byName.get(`${prefix}${key}`)?.light, `${prefix}${key}`).toBe(`${value}px`);
    }
  });

  it('orders numeric steps ascending with named steps last', () => {
    expect(scaleEntries({ round: 1000, '100': 8, '25': 2 })).toEqual([
      ['25', 2],
      ['100', 8],
      ['round', 1000],
    ]);
  });

  it('formats sx multipliers', () => {
    expect(formatFactor(2, 8)).toBe('0.25');
    expect(formatFactor(12, 8)).toBe('1.5');
    expect(formatFactor(16, 8)).toBe('2');
  });
});
