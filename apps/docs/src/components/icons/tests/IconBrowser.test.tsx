// Matcher types (the docs tsconfig type-checks tests; the setup file registers the matchers).
import '@testing-library/jest-dom/vitest';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconBrowser, type IconBrowserState } from '../IconBrowser';

// The detail panel links to the Icon component page; the router itself is not under test.
vi.mock('../../links', () => ({
  RouterLink: ({ children }: { children: React.ReactNode }) => <a href="#icon">{children}</a>,
}));

function Harness({ initial }: { initial?: Partial<IconBrowserState> }) {
  const [state, setState] = React.useState<IconBrowserState>({
    query: '',
    selected: null,
    variant: 'outline',
    ...initial,
  });
  return (
    <IconBrowser {...state} onChange={(patch) => setState((prev) => ({ ...prev, ...patch }))} />
  );
}

const tiles = () =>
  within(screen.getByRole('list', { name: 'Icons' }))
    .getAllByRole('button')
    .map((b) => b.getAttribute('data-icon'));

describe('IconBrowser', () => {
  it('filters the icons as you type, including by keyword', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(tiles().length).toBeGreaterThan(100);
    await user.type(screen.getByRole('searchbox', { name: 'Search icons' }), 'trash');
    expect(tiles()).toEqual(['delete']);
    expect(screen.getByText(/^1 of \d+ icons$/)).toBeInTheDocument();
  });

  it('shows an empty state when nothing matches', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(screen.getByRole('searchbox', { name: 'Search icons' }), 'xylophone');
    expect(screen.queryByRole('list', { name: 'Icons' })).not.toBeInTheDocument();
    expect(screen.getByText(/No icon matches “xylophone”/)).toBeInTheDocument();
  });

  it('copies the JSX of a clicked icon and selects it', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'settings, copy JSX' }));
    await expect(navigator.clipboard.readText()).resolves.toBe('<Icon name="settings" />');
    expect(screen.getByRole('button', { name: 'settings, copy JSX' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(screen.getByRole('region', { name: 'Icon settings' })).toBeInTheDocument();
    expect(await screen.findByText('Copied <Icon name="settings" />')).toBeInTheDocument();
  });

  it('copies the best match with Enter, in the chosen variant', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Filled' }));
    await user.type(screen.getByRole('searchbox', { name: 'Search icons' }), 'gear{Enter}');
    await expect(navigator.clipboard.readText()).resolves.toBe(
      '<Icon name="settings" variant="filled" />',
    );
  });

  it('copies the name and the import from the detail panel', async () => {
    const user = userEvent.setup();
    render(<Harness initial={{ selected: 'delete' }} />);
    const panel = screen.getByRole('region', { name: 'Icon delete' });
    await user.click(within(panel).getByRole('button', { name: 'Copy Name' }));
    await expect(navigator.clipboard.readText()).resolves.toBe('delete');
    await user.click(within(panel).getByRole('button', { name: 'Copy Import' }));
    await expect(navigator.clipboard.readText()).resolves.toBe(
      "import Icon from '@tecton-mui/ui/Icon';",
    );
  });

  it('reports a failed copy instead of failing silently', async () => {
    const user = userEvent.setup();
    render(<Harness initial={{ selected: 'delete' }} />);
    // jsdom has no icons.css, so there is no SVG to read.
    await user.click(screen.getByRole('button', { name: 'Copy SVG' }));
    expect(await screen.findByText(/Could not copy/)).toBeInTheDocument();
  });

  it('follows the query prop while the field is not focused', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <IconBrowser query="" selected={null} variant="outline" onChange={onChange} />,
    );
    rerender(<IconBrowser query="trash" selected="delete" variant="outline" onChange={onChange} />);
    expect(screen.getByRole('searchbox', { name: 'Search icons' })).toHaveValue('trash');
    expect(tiles()).toEqual(['delete']);
  });

  it('moves between icons with the arrow keys and back to the field', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const field = screen.getByRole('searchbox', { name: 'Search icons' });
    await user.type(field, 'chevron');
    await user.keyboard('{ArrowDown}');
    const first = tiles()[0];
    expect(document.activeElement).toHaveAttribute('data-icon', first);
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toHaveAttribute('data-icon', tiles()[1]);
    // Only one tile is in the tab order.
    const tabbable = screen
      .getAllByRole('button')
      .filter((b) => b.hasAttribute('data-icon') && b.tabIndex === 0);
    expect(tabbable).toHaveLength(1);
    // jsdom lays everything out on one row, so ArrowUp leaves the grid.
    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(field);
  });
});
