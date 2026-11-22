import * as React from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { hasMuiDocs, MuiDocsSection } from '../index';
import { defineDemo, stripHeader } from '../runtime/demo';
import iconMap from '../../../../../tooling/docs-sync/icon-map.json';
// Sync tooling (plain ESM, no types): the import/markdown rules the generated files rely on.
// @ts-expect-error untyped tooling module
import { transformDemo, readUiSurface } from '../../../../../tooling/docs-sync/lib/demos.mjs';
// @ts-expect-error untyped tooling module
import { parsePage } from '../../../../../tooling/docs-sync/lib/markdown.mjs';
// @ts-expect-error untyped tooling module
import { rewriteSnippetImports, upstreamHash } from '../../../../../tooling/docs-sync/lib/emit.mjs';
// @ts-expect-error untyped tooling module
import { loadParsers } from '../../../../../tooling/docs-sync/lib/deps.mjs';

// Vitest runs from the repository root.
const repo = process.cwd();

describe('synced MUI docs runtime', () => {
  it('knows which component pages have synced content', () => {
    expect(hasMuiDocs('button')).toBe(true);
    expect(hasMuiDocs('timeline')).toBe(true);
    expect(hasMuiDocs('data-grid')).toBe(false);
  });

  it('lazy-loads and renders a synced page with its attribution', { timeout: 30000 }, async () => {
    await act(async () => {
      render(
        <React.Suspense fallback="loading">
          <MuiDocsSection slug="no-ssr" />
        </React.Suspense>,
      );
    });
    expect(
      await screen.findByText(
        /adapted from the MIT-licensed Material UI documentation/,
        {},
        { timeout: 15000 },
      ),
    ).toBeTruthy();
    expect(document.querySelectorAll('[data-mui-demo]').length).toBeGreaterThan(0);
  });

  it('strips the license header from the shown source and its highlighted lines', () => {
    const code = '/* Synced from x\n * do not edit */\nconst a = 1;\nconst b = 2;\n';
    const html = 'h1\nh2\nline a\nline b';
    expect(stripHeader({ code, html })).toEqual({
      code: 'const a = 1;\nconst b = 2;\n',
      html: 'line a\nline b',
    });
    expect(stripHeader({ code: 'const a = 1;\n' })).toEqual({ code: 'const a = 1;\n' });
  });

  it('contains a failing demo in an error boundary', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Broken(): React.ReactElement {
      throw new Error('boom');
    }
    const demo = defineDemo('Broken', Broken, { code: '' });
    render(<demo.Component />);
    expect(document.querySelector('[data-mui-demo-error="Broken"]')?.textContent).toContain('boom');
    spy.mockRestore();
  });
});

describe('docs sync transform', () => {
  let parsers: { ts: unknown; parseMarkdown: (s: string) => unknown };
  let surface: unknown;
  beforeAll(async () => {
    parsers = await loadParsers(repo);
    surface = readUiSurface(repo);
  });
  const transform = (source: string) =>
    transformDemo(source, { ts: parsers.ts, surface, iconMap, fileName: 'Demo.tsx' });

  it('rewrites MUI imports to @tecton-mui/ui entries and marks type-only imports', () => {
    const result = transform(
      [
        "import Select, { SelectChangeEvent } from '@mui/material/Select';",
        "import { styled } from '@mui/material/styles';",
        "import { SxProps } from '@mui/system';",
        "import Masonry from '@mui/lab/Masonry';",
        "const img = '/static/images/a.jpg';",
        'export default function Demo(p: { sx: SxProps; e: SelectChangeEvent }) {',
        '  return <Select />;',
        '}',
      ].join('\n'),
    );
    expect(result.status).toBe('included');
    expect(result.code).toContain(
      "import Select, { type SelectChangeEvent } from '@tecton-mui/ui/Select';",
    );
    expect(result.code).toContain("from '@tecton-mui/ui/styles';");
    expect(result.code).toContain("import { type SxProps } from '@tecton-mui/ui/styles';");
    expect(result.code).toContain("from '@tecton-mui/ui/Masonry'");
    expect(result.code).toContain("'https://mui.com/static/images/a.jpg'");
  });

  it('rewrites @mui/icons-material icons to the Tecton Icon component', () => {
    const result = transform(
      [
        "import IconButton from '@mui/material/IconButton';",
        "import DeleteIcon from '@mui/icons-material/Delete';",
        "import StarIcon from '@mui/icons-material/Star';",
        "import { Mail as MailIcon } from '@mui/icons-material';",
        'export default function Demo() {',
        '  return (',
        '    <div>',
        '      <IconButton><DeleteIcon /></IconButton>',
        '      <DeleteIcon fontSize="small" color="error" titleAccess="Delete" />',
        '      <StarIcon fontSize="inherit" sx={{ mr: 1 }} />',
        '      <MailIcon htmlColor="#f00" />',
        '    </div>',
        '  );',
        '}',
      ].join('\n'),
    );
    expect(result.status).toBe('included');
    expect(result.code).not.toContain('@mui/icons-material');
    expect(result.code.match(/import Icon from '@tecton-mui\/ui\/Icon';/g)).toHaveLength(1);
    // A container that sizes its icons: no size. Elsewhere SvgIcon's default medium size.
    expect(result.code).toContain('<IconButton><Icon name="delete" /></IconButton>');
    expect(result.code).toContain(
      `<Icon name="delete" sx={{ color: 'error.main' }} size="small" title="Delete" />`,
    );
    expect(result.code).toContain(`<Icon name="star" variant="filled" sx={{ mr: 1 }} />`);
    expect(result.code).toContain(`<Icon name="chat" size="medium" sx={{ color: '#f00' }} />`);
    expect(result.icons).toEqual(['Delete', 'Star', 'Mail']);
  });

  it('gives icons passed as components a local Icon wrapper', () => {
    const result = transform(
      [
        "import Pagination from '@mui/material/Pagination';",
        "import ArrowBackIcon from '@mui/icons-material/ArrowBack';",
        "import CheckBoxIcon from '@mui/icons-material/CheckBox';",
        "import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';",
        'export default function Demo({ on }: { on: boolean }) {',
        '  const SelectionIcon = on ? CheckBoxIcon : CheckBoxOutlineBlankIcon;',
        '  return (',
        '    <div>',
        '      <Pagination slots={{ previous: ArrowBackIcon }} />',
        '      <SelectionIcon fontSize="small" />',
        '    </div>',
        '  );',
        '}',
      ].join('\n'),
    );
    expect(result.status).toBe('included');
    expect(result.code).not.toContain('@mui/icons-material');
    expect(result.code).toContain("import Icon, { type IconProps } from '@tecton-mui/ui/Icon';");
    expect(result.code).toContain(
      'function ArrowBackIcon(props: Omit<IconProps, \'name\'>) {\n  return <Icon name="arrow-left" {...props} />;\n}',
    );
    expect(result.code).toContain('<Icon name="checkbox-checked" variant="filled" {...props} />');
    expect(result.code).toContain('<SelectionIcon size="small" />');
    expect(result.notes[0]).toMatch(/local `Icon` wrappers/);
  });

  it('reports icons without a Tecton mapping', () => {
    const result = transform(
      "import NoSuchIcon from '@mui/icons-material/NoSuchThing';\nexport const a = <NoSuchIcon />;",
    );
    expect(result).toEqual({ status: 'unmapped', icons: ['NoSuchThing'] });
  });

  it('excludes demos that need unavailable modules', () => {
    expect(transform("import { FixedSizeList } from 'react-window';").reason).toMatch(
      /react-window/,
    );
    expect(transform("import Icon from '@mui/material/Icon';").status).toBe('excluded');
    expect(transform("import LoadingButton from '@mui/lab/LoadingButton';").status).toBe(
      'excluded',
    );
    expect(transform("import { DataGrid } from '@mui/x-data-grid';").reason).toMatch(/MUI X/);
  });

  it('parses MUI markdown extensions', () => {
    const page = parsePage(
      [
        '---',
        'title: React Button component',
        '---',
        '# Button',
        '<p class="description">Buttons allow users to act.</p>',
        '{{"component": "@mui/internal-core-docs/ComponentLinkHeader"}}',
        '## Basic button',
        '{{"demo": "BasicButtons.js", "defaultCodeOpen": true}}',
        ':::warning',
        'Careful.',
        ':::',
      ].join('\n'),
      parsers,
    );
    expect(page.title).toBe('Button');
    expect(page.description).toHaveLength(1);
    expect(page.blocks.map((b: { type: string }) => b.type)).toEqual([
      'heading',
      'demo',
      'callout',
    ]);
    expect(page.blocks[1]).toMatchObject({
      name: 'BasicButtons',
      options: { defaultCodeOpen: true },
    });
  });

  it('rewrites imports in prose snippets and computes upstream anchors', () => {
    expect(rewriteSnippetImports("import Button from '@mui/material/Button';")).toBe(
      "import Button from '@tecton-mui/ui/Button';",
    );
    expect(rewriteSnippetImports("import { styled } from '@mui/material/styles';")).toBe(
      "import { styled } from '@tecton-mui/ui/styles';",
    );
    expect(upstreamHash('Performance & SEO')).toBe('performance-seo');
  });
});
