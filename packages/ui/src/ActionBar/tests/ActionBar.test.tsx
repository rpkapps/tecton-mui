import * as React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import MenuItem from '@mui/material/MenuItem';
import { ThemeProvider } from '../../styles/index.js';
import Icon from '../../Icon/Icon.js';
import ActionBar, {
  actionBarClasses,
  ActionBarButton,
  ActionBarGroup,
  ActionBarSelect,
  ActionBarTool,
  ActionBarToolMenu,
  type ActionBarProps,
  type ActionBarValue,
} from '../index.js';
import * as root from '../../index.js';

function Tools({
  onUndo = () => {},
  undoDisabled = false,
  onZoom = () => {},
  ...props
}: Partial<ActionBarProps> & {
  onUndo?: () => void;
  undoDisabled?: boolean;
  onZoom?: (value: unknown) => void;
}) {
  return (
    <ActionBar aria-label="Canvas tools" defaultValue="select" {...props}>
      <ActionBarGroup>
        <ActionBarSelect
          aria-label="Zoom level"
          defaultValue="fit"
          onChange={(event) => onZoom(event.target.value)}
        >
          <MenuItem value="fit">Fit</MenuItem>
          <MenuItem value="100">100%</MenuItem>
        </ActionBarSelect>
      </ActionBarGroup>
      <ActionBarGroup>
        <ActionBarButton value="select" label="Select" icon={<Icon name="select-cursor" />} />
        <ActionBarButton value="pan" label="Pan" icon={<Icon name="pan-tool" />} />
        <ActionBarToolMenu label="Measure">
          <ActionBarTool value="ruler" label="Ruler" icon={<Icon name="ruler" />} />
          <ActionBarTool value="angle" label="Angle" icon={<Icon name="line-weight" />} />
        </ActionBarToolMenu>
      </ActionBarGroup>
      <ActionBarGroup>
        <ActionBarButton
          label="Undo"
          icon={<Icon name="undo" />}
          onClick={onUndo}
          disabled={undoDisabled}
        />
        <ActionBarButton label="Redo" icon={<Icon name="redo" />} />
      </ActionBarGroup>
    </ActionBar>
  );
}

const renderTools = (props: React.ComponentProps<typeof Tools> = {}) =>
  render(
    <ThemeProvider>
      <Tools {...props} />
    </ThemeProvider>,
  );

const button = (name: string | RegExp) => screen.getByRole('button', { name });
const zoom = () => screen.getByRole('combobox', { name: 'Zoom level' });
const measure = () => screen.getByRole('button', { name: /^(Ruler|Angle)$/ });

describe('ActionBar', () => {
  it('is exported from the root and the subpath', () => {
    expect(root.ActionBar).toBe(ActionBar);
    expect(root.ActionBarButton).toBe(ActionBarButton);
    expect(root.ActionBarToolMenu).toBe(ActionBarToolMenu);
    expect(root.actionBarClasses).toBe(actionBarClasses);
  });

  it('renders a vertical toolbar of bordered groups and square tertiary icon buttons', () => {
    renderTools();
    const bar = screen.getByRole('toolbar', { name: 'Canvas tools' });
    expect(bar).toHaveAttribute('aria-orientation', 'vertical');
    expect(bar).toHaveClass(actionBarClasses.root, actionBarClasses.alignLeft);
    const groups = within(bar).getAllByRole('group');
    expect(groups).toHaveLength(3);
    expect(groups[0]).toHaveClass(actionBarClasses.group, 'MuiPaper-root');
    expect(getComputedStyle(groups[0]).borderStyle).toBe('solid');

    const pan = button('Pan');
    expect(pan).toHaveClass(
      actionBarClasses.button,
      'MuiIconButton-colorTertiary',
      'MuiIconButton-sizeMedium',
    );
    expect(pan.querySelector('.tecton-pan-tool-outline')).not.toBeNull();
    // Plain actions are not toggle buttons.
    expect(button('Redo')).not.toHaveAttribute('aria-pressed');
  });

  it('keeps one tab stop and moves with Up, Down, Home and End (skipping disabled controls)', async () => {
    const user = userEvent.setup();
    renderTools({ undoDisabled: true });
    const bar = screen.getByRole('toolbar');
    const tabStops = () =>
      Array.from(bar.querySelectorAll('[tabindex="0"]')).filter(
        (element) => !element.matches('input'),
      );
    expect(tabStops()).toEqual([zoom()]);

    await user.tab();
    expect(zoom()).toHaveFocus();
    // Down moves along the bar instead of opening the Select.
    await user.keyboard('{ArrowDown}');
    expect(button('Select')).toHaveFocus();
    expect(screen.queryByRole('listbox')).toBeNull();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(measure()).toHaveFocus();
    // Undo is disabled and skipped.
    await user.keyboard('{ArrowDown}');
    expect(button('Redo')).toHaveFocus();
    // Wraps around.
    await user.keyboard('{ArrowDown}');
    expect(zoom()).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(button('Redo')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(zoom()).toHaveFocus();
    await user.keyboard('{End}');
    expect(button('Redo')).toHaveFocus();
    expect(tabStops()).toEqual([button('Redo')]);

    // Tab leaves the bar and Shift+Tab comes back to the last focused control.
    await user.tab();
    expect(bar).not.toContainElement(document.activeElement as HTMLElement);
    await user.tab({ shift: true });
    expect(button('Redo')).toHaveFocus();
  });

  it('opens a Select with Enter, and its menu lists the options', async () => {
    const user = userEvent.setup();
    const onZoom = vi.fn();
    renderTools({ onZoom });
    act(() => zoom().focus());
    await user.keyboard('{Enter}');
    const listbox = await screen.findByRole('listbox');
    expect(within(listbox).getByRole('option', { name: 'Fit' })).toHaveFocus();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onZoom).toHaveBeenCalledWith('100');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(zoom()).toHaveTextContent('100%');
  });

  describe('horizontal group', () => {
    function MapTools({ direction = 'ltr' }: { direction?: 'ltr' | 'rtl' }) {
      return (
        <ThemeProvider direction={direction}>
          <ActionBar aria-label="Map tools" defaultValue="select">
            <ActionBarGroup orientation="horizontal" aria-label="Map view">
              <ActionBarSelect aria-label="Base map" variant="filled" defaultValue="terrain">
                <MenuItem value="terrain">Terrain</MenuItem>
                <MenuItem value="street">Street</MenuItem>
              </ActionBarSelect>
              <ActionBarSelect aria-label="Scale" variant="filled" defaultValue="25000">
                <MenuItem value="25000">1:25,000</MenuItem>
                <MenuItem value="50000">1:50,000</MenuItem>
              </ActionBarSelect>
            </ActionBarGroup>
            <ActionBarGroup>
              <ActionBarButton value="select" label="Select" icon={<Icon name="select-cursor" />} />
              <ActionBarButton value="pan" label="Pan" icon={<Icon name="pan-tool" />} />
            </ActionBarGroup>
          </ActionBar>
        </ThemeProvider>
      );
    }
    const baseMap = () => screen.getByRole('combobox', { name: 'Base map' });
    const scale = () => screen.getByRole('combobox', { name: 'Scale' });

    it('lays its controls out in a row; Left and Right move along it, Up and Down along the bar', async () => {
      const user = userEvent.setup();
      render(<MapTools />);
      const row = screen.getByRole('group', { name: 'Map view' });
      expect(row).toHaveClass(actionBarClasses.group, actionBarClasses.groupHorizontal);
      expect(getComputedStyle(row).flexDirection).toBe('row');
      expect(screen.getAllByRole('group')[1]).not.toHaveClass(actionBarClasses.groupHorizontal);

      await user.tab();
      expect(baseMap()).toHaveFocus();
      await user.keyboard('{ArrowRight}');
      expect(scale()).toHaveFocus();
      // The row does not wrap.
      await user.keyboard('{ArrowRight}');
      expect(scale()).toHaveFocus();
      await user.keyboard('{ArrowLeft}');
      expect(baseMap()).toHaveFocus();
      await user.keyboard('{ArrowLeft}');
      expect(baseMap()).toHaveFocus();
      expect(screen.queryByRole('listbox')).toBeNull();

      await user.keyboard('{ArrowDown}');
      expect(scale()).toHaveFocus();
      await user.keyboard('{ArrowDown}');
      expect(button('Select')).toHaveFocus();
      // Outside a row, Left and Right do not move.
      await user.keyboard('{ArrowRight}{ArrowLeft}');
      expect(button('Select')).toHaveFocus();
    });

    it('mirrors Left and Right in RTL', async () => {
      const user = userEvent.setup();
      render(<MapTools direction="rtl" />);
      act(() => baseMap().focus());
      await user.keyboard('{ArrowLeft}');
      expect(scale()).toHaveFocus();
      await user.keyboard('{ArrowRight}');
      expect(baseMap()).toHaveFocus();
    });
  });

  it('makes a pressed tool current and calls onChange once per change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderTools({ onChange });
    expect(button('Select')).toHaveAttribute('aria-pressed', 'true');
    expect(button('Pan')).toHaveAttribute('aria-pressed', 'false');
    await user.click(button('Pan'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][1]).toBe('pan');
    expect(button('Pan')).toHaveAttribute('aria-pressed', 'true');
    expect(button('Select')).toHaveAttribute('aria-pressed', 'false');
    // Pressing the current tool again changes nothing.
    await user.click(button('Pan'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('runs plain actions without changing the tool', async () => {
    const user = userEvent.setup();
    const onUndo = vi.fn();
    const onChange = vi.fn();
    renderTools({ onUndo, onChange });
    await user.click(button('Undo'));
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows the tool name in a tooltip beside the button', async () => {
    const user = userEvent.setup();
    renderTools();
    await user.hover(button('Pan'));
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Pan');
    expect(tooltip).toHaveAttribute('data-popper-placement', 'right');
  });

  it('follows a controlled value', () => {
    const { rerender } = render(
      <ThemeProvider>
        <Tools value="pan" />
      </ThemeProvider>,
    );
    expect(button('Pan')).toHaveAttribute('aria-pressed', 'true');
    rerender(
      <ThemeProvider>
        <Tools value="angle" />
      </ThemeProvider>,
    );
    expect(button('Pan')).toHaveAttribute('aria-pressed', 'false');
    // The tool menu button shows the current tool of its set.
    expect(measure()).toHaveAccessibleName('Angle');
    expect(measure()).toHaveAttribute('aria-pressed', 'true');
  });

  it('re-renders only the buttons whose state changes', async () => {
    const user = userEvent.setup();
    const renders = new Map<string, number>();
    const count: React.ProfilerOnRenderCallback = (id) =>
      renders.set(id, (renders.get(id) ?? 0) + 1);
    const names = ['a', 'b', 'c', 'd', 'e'];
    render(
      <ThemeProvider>
        <ActionBar aria-label="Tools" defaultValue="a">
          <ActionBarGroup>
            {names.map((name) => (
              <React.Profiler key={name} id={name} onRender={count}>
                <ActionBarButton value={name} label={name} icon={<Icon name="cube" />} />
              </React.Profiler>
            ))}
          </ActionBarGroup>
        </ActionBar>
      </ThemeProvider>,
    );
    renders.clear();
    await user.click(button('c'));
    // `a` loses the tool and the tab stop, `c` gets both; b, d and e stay untouched.
    expect([...renders.keys()].sort()).toEqual(['a', 'c']);
  });

  describe('tool menu', () => {
    it('shows its first tool, marks itself and describes how to open the menu', () => {
      renderTools();
      const tools = measure();
      expect(tools).toHaveAccessibleName('Ruler');
      expect(tools).toHaveAttribute('aria-haspopup', 'menu');
      expect(tools).toHaveAttribute('aria-expanded', 'false');
      expect(tools).toHaveAttribute('aria-pressed', 'false');
      expect(tools).toHaveAccessibleDescription('Right Arrow for more tools');
      expect(tools.querySelector(`.${actionBarClasses.moreIndicator}`)).not.toBeNull();
      expect(tools.querySelector('.tecton-ruler-outline')).not.toBeNull();
    });

    it('makes its shown tool current when pressed', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderTools({ onChange });
      await user.click(measure());
      expect(onChange.mock.calls[0][1]).toBe('ruler');
      expect(measure()).toHaveAttribute('aria-pressed', 'true');
      expect(screen.queryByRole('menu')).toBeNull();
    });

    it('opens with the arrow key toward the menu, picks a tool and returns focus', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderTools({ onChange });
      const tools = measure();
      act(() => tools.focus());
      await user.keyboard('{ArrowRight}');
      // The open menu is modal: the rest of the page leaves the accessibility tree meanwhile.
      const menu = await screen.findByRole('menu', { name: 'Measure' });
      expect(tools).toHaveAttribute('aria-expanded', 'true');
      expect(tools).toHaveAttribute('aria-controls', menu.id);
      const ruler = within(menu).getByRole('menuitemradio', { name: 'Ruler' });
      // The shown tool is selected in the menu and gets the focus.
      expect(ruler).toHaveAttribute('aria-checked', 'true');
      await waitFor(() => expect(ruler).toHaveFocus());
      await user.keyboard('{ArrowDown}{Enter}');
      expect(onChange.mock.calls[0][1]).toBe('angle');
      await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
      await waitFor(() => expect(measure()).toHaveFocus());
      expect(measure()).toHaveAccessibleName('Angle');
      expect(measure().querySelector('.tecton-line-weight-outline')).not.toBeNull();
    });

    it('keeps showing the picked tool when another tool becomes current', async () => {
      const user = userEvent.setup();
      renderTools();
      act(() => measure().focus());
      await user.keyboard('{ArrowRight}');
      await user.click(await screen.findByRole('menuitemradio', { name: 'Angle' }));
      await user.click(button('Pan'));
      expect(measure()).toHaveAccessibleName('Angle');
      expect(measure()).toHaveAttribute('aria-pressed', 'false');
    });

    it('closes with the arrow key back toward the bar and with Escape', async () => {
      const user = userEvent.setup();
      renderTools();
      act(() => measure().focus());
      await user.keyboard('{ArrowRight}');
      await screen.findByRole('menu');
      await waitFor(() =>
        expect(screen.getByRole('menuitemradio', { name: 'Ruler' })).toHaveFocus(),
      );
      await user.keyboard('{ArrowLeft}');
      await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
      await waitFor(() => expect(measure()).toHaveFocus());
      await user.keyboard('{ArrowRight}');
      await screen.findByRole('menu');
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    });

    it('opens on right-click (and the context menu key)', async () => {
      renderTools();
      fireEvent.contextMenu(measure());
      expect(await screen.findByRole('menu')).toBeInTheDocument();
    });

    it('opens on a long press, and the release does not close it or press the tool', () => {
      vi.useFakeTimers();
      try {
        const onChange = vi.fn();
        renderTools({ onChange });
        const tools = measure();
        fireEvent.pointerDown(tools, { button: 0, pointerType: 'touch' });
        act(() => vi.advanceTimersByTime(499));
        expect(screen.queryByRole('menu')).toBeNull();
        act(() => vi.advanceTimersByTime(1));
        expect(screen.getByRole('menu')).toBeInTheDocument();
        // The release lands on the menu backdrop.
        const backdrop = document.querySelector('.MuiBackdrop-root')!;
        fireEvent.pointerUp(backdrop);
        fireEvent.click(backdrop);
        expect(screen.getByRole('menu')).toBeInTheDocument();
        fireEvent.click(tools, { detail: 1 });
        expect(onChange).not.toHaveBeenCalled();
        // A later click on the backdrop closes the menu as usual.
        act(() => vi.advanceTimersByTime(1));
        fireEvent.click(backdrop);
        act(() => vi.advanceTimersByTime(500));
        expect(screen.queryByRole('menu')).toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });

    it('does not open on a short press', () => {
      vi.useFakeTimers();
      try {
        renderTools();
        const tools = measure();
        fireEvent.pointerDown(tools, { button: 0 });
        act(() => vi.advanceTimersByTime(200));
        fireEvent.pointerUp(tools);
        act(() => vi.advanceTimersByTime(1000));
        expect(screen.queryByRole('menu')).toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });

    it('labels the menu with the button when the set has no name', async () => {
      const user = userEvent.setup();
      render(
        <ThemeProvider>
          <ActionBar aria-label="Tools">
            <ActionBarToolMenu>
              <ActionBarTool value="a" label="Alpha" icon={<Icon name="cube" />} />
              <ActionBarTool value="b" label="Beta" icon={<Icon name="3d" />} />
            </ActionBarToolMenu>
          </ActionBar>
        </ThemeProvider>,
      );
      act(() => button('Alpha').focus());
      await user.keyboard('{ArrowRight}');
      expect(await screen.findByRole('menu', { name: 'Alpha' })).toBeInTheDocument();
    });
  });

  describe('alignment', () => {
    function RightBar({ value }: { value?: ActionBarValue }) {
      return (
        <ActionBar aria-label="Tools" alignment="right" value={value}>
          <ActionBarGroup>
            <ActionBarButton value="pan" label="Pan" icon={<Icon name="pan-tool" />} />
            <ActionBarToolMenu label="Measure">
              <ActionBarTool value="ruler" label="Ruler" icon={<Icon name="ruler" />} />
              <ActionBarTool value="angle" label="Angle" icon={<Icon name="line-weight" />} />
            </ActionBarToolMenu>
          </ActionBarGroup>
        </ActionBar>
      );
    }

    it('right: opens tooltips and menus to the left', async () => {
      const user = userEvent.setup();
      render(
        <ThemeProvider>
          <RightBar />
        </ThemeProvider>,
      );
      expect(screen.getByRole('toolbar')).toHaveClass(actionBarClasses.alignRight);
      expect(measure()).toHaveAccessibleDescription('Left Arrow for more tools');
      await user.hover(button('Pan'));
      expect(await screen.findByRole('tooltip')).toHaveAttribute('data-popper-placement', 'left');
      act(() => measure().focus());
      await user.keyboard('{ArrowRight}');
      expect(screen.queryByRole('menu')).toBeNull();
      await user.keyboard('{ArrowLeft}');
      expect(await screen.findByRole('menu')).toBeInTheDocument();
      await waitFor(() =>
        expect(screen.getByRole('menuitemradio', { name: 'Ruler' })).toHaveFocus(),
      );
      await user.keyboard('{ArrowRight}');
      await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    });

    it('left in RTL: the bar sits on the right, so menus open to the left', async () => {
      const user = userEvent.setup();
      render(
        <ThemeProvider direction="rtl">
          <Tools />
        </ThemeProvider>,
      );
      expect(measure()).toHaveAccessibleDescription('Left Arrow for more tools');
      act(() => measure().focus());
      await user.keyboard('{ArrowLeft}');
      expect(await screen.findByRole('menu')).toBeInTheDocument();
    });
  });

  it('accepts sx and className on the bar and its parts', () => {
    render(
      <ThemeProvider>
        <ActionBar aria-label="Tools" className="canvas-tools" sx={{ marginTop: '7px' }}>
          <ActionBarGroup className="main" sx={{ marginLeft: '3px' }}>
            <ActionBarButton
              label="Pan"
              icon={<Icon name="pan-tool" />}
              sx={{ marginTop: '5px' }}
            />
          </ActionBarGroup>
        </ActionBar>
      </ThemeProvider>,
    );
    const bar = screen.getByRole('toolbar');
    expect(bar).toHaveClass('canvas-tools');
    expect(getComputedStyle(bar).marginTop).toBe('7px');
    expect(getComputedStyle(screen.getByRole('group')).marginLeft).toBe('3px');
    expect(getComputedStyle(button('Pan')).marginTop).toBe('5px');
  });

  it('works outside a bar: a button keeps its own tab order', () => {
    render(
      <ThemeProvider>
        <ActionBarButton label="Pan" icon={<Icon name="pan-tool" />} />
      </ThemeProvider>,
    );
    expect(button('Pan')).toHaveAttribute('tabindex', '0');
  });

  it('renders on the server', () => {
    const html = renderToString(
      <ThemeProvider>
        <Tools />
      </ThemeProvider>,
    );
    expect(html).toContain('role="toolbar"');
    expect(html).toContain('aria-label="Pan"');
  });
});
