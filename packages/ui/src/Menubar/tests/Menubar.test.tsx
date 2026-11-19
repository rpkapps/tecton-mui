import * as React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import {
  createTheme as createMuiTheme,
  ThemeProvider as MuiThemeProvider,
} from '@mui/material/styles';
import { ThemeProvider } from '../../styles/index.js';
import Menubar, {
  menubarClasses,
  MenubarCheckboxItem,
  MenubarGroup,
  MenubarGroupLabel,
  MenubarItem,
  MenubarMenu,
  MenubarPopup,
  MenubarPortal,
  MenubarPositioner,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarSubmenu,
  MenubarSubmenuTrigger,
  MenubarTrigger,
} from '../index.js';
import * as root from '../../index.js';

function AppMenubar({
  onNew = () => {},
  onSave = () => {},
  onWrap = () => {},
  onZoom = () => {},
}: {
  onNew?: () => void;
  onSave?: () => void;
  onWrap?: (checked: boolean) => void;
  onZoom?: (value: unknown) => void;
}) {
  return (
    <Menubar aria-label="Application">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarPortal>
          <MenubarPositioner>
            <MenubarPopup>
              <MenubarItem onClick={onNew} hint="Ctrl+N">
                New
              </MenubarItem>
              <MenubarItem onClick={onSave} disabled>
                Save
              </MenubarItem>
              <MenubarSeparator />
              <MenubarSubmenu>
                <MenubarSubmenuTrigger>Share</MenubarSubmenuTrigger>
                <MenubarPortal>
                  <MenubarPositioner>
                    <MenubarPopup>
                      <MenubarItem>Email link</MenubarItem>
                    </MenubarPopup>
                  </MenubarPositioner>
                </MenubarPortal>
              </MenubarSubmenu>
            </MenubarPopup>
          </MenubarPositioner>
        </MenubarPortal>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarPortal>
          <MenubarPositioner>
            <MenubarPopup>
              <MenubarCheckboxItem onCheckedChange={onWrap}>Word wrap</MenubarCheckboxItem>
              <MenubarGroup>
                <MenubarGroupLabel>Zoom</MenubarGroupLabel>
                <MenubarRadioGroup defaultValue={100} onValueChange={onZoom}>
                  <MenubarRadioItem value={100}>100%</MenubarRadioItem>
                  <MenubarRadioItem value={150}>150%</MenubarRadioItem>
                </MenubarRadioGroup>
              </MenubarGroup>
            </MenubarPopup>
          </MenubarPositioner>
        </MenubarPortal>
      </MenubarMenu>
    </Menubar>
  );
}

const renderBar = (props: React.ComponentProps<typeof AppMenubar> = {}) =>
  render(
    <ThemeProvider>
      <AppMenubar {...props} />
    </ThemeProvider>,
  );

describe('Menubar', () => {
  it('is exported from the root and the subpath', () => {
    expect(root.Menubar).toBe(Menubar);
    expect(root.MenubarItem).toBe(MenubarItem);
    expect(root.menubarClasses).toBe(menubarClasses);
    // The Material `MenuItem` keeps its root name.
    expect(root.MenuItem).not.toBe(MenubarItem);
  });

  it('renders a menubar whose triggers are tertiary text buttons', () => {
    renderBar();
    const bar = screen.getByRole('menubar', { name: 'Application' });
    expect(bar).toHaveClass(menubarClasses.root);
    const file = screen.getByRole('menuitem', { name: 'File' });
    expect(file.tagName).toBe('BUTTON');
    expect(file).toHaveClass('MuiButton-text', 'MuiButton-colorTertiary', menubarClasses.trigger);
    expect(file).toHaveAttribute('aria-haspopup', 'menu');
    // Medium by default, so the bar text matches the menu items.
    expect(file).toHaveClass('MuiButton-sizeMedium');
  });

  it('takes a small trigger size', () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger size="small">File</MenubarTrigger>
        </MenubarMenu>
      </Menubar>,
    );
    expect(screen.getByRole('menuitem', { name: 'File' })).toHaveClass('MuiButton-sizeSmall');
  });

  it('opens a menu on click and runs a command once, then closes', async () => {
    const user = userEvent.setup();
    const onNew = vi.fn();
    renderBar({ onNew });
    await user.click(screen.getByRole('menuitem', { name: 'File' }));
    const menu = await screen.findByRole('menu');
    expect(menu).toHaveClass(menubarClasses.popup, 'MuiPaper-root');
    const item = screen.getByRole('menuitem', { name: /New/ });
    expect(item).toHaveClass('MuiMenuItem-root', menubarClasses.item);
    expect(item.querySelector('.tecton-menu-shortcut')).toHaveTextContent('Ctrl+N');
    await user.click(item);
    expect(onNew).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('runs a command once with the keyboard (no extra ButtonBase click)', async () => {
    const user = userEvent.setup();
    const onNew = vi.fn();
    renderBar({ onNew });
    act(() => screen.getByRole('menuitem', { name: 'File' }).focus());
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('menu');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: /New/ })).toHaveFocus());
    await user.keyboard('{Enter}');
    expect(onNew).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    expect(screen.getByRole('menuitem', { name: 'File' })).toHaveFocus();
  });

  it('moves between triggers with the arrow keys', async () => {
    const user = userEvent.setup();
    renderBar();
    act(() => screen.getByRole('menuitem', { name: 'File' }).focus());
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('menuitem', { name: 'View' })).toHaveFocus();
  });

  it('keeps disabled items focusable but inert, with the disabled paint', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderBar({ onSave });
    await user.click(screen.getByRole('menuitem', { name: 'File' }));
    const save = await screen.findByRole('menuitem', { name: 'Save' });
    expect(save).toHaveAttribute('aria-disabled', 'true');
    expect(save).not.toBeDisabled();
    expect(save).toHaveClass('Mui-disabled');
    fireEvent.click(save);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('opens a submenu', async () => {
    const user = userEvent.setup();
    renderBar();
    await user.click(screen.getByRole('menuitem', { name: 'File' }));
    const share = await screen.findByRole('menuitem', { name: 'Share' });
    expect(share).toHaveClass(menubarClasses.submenuTrigger);
    expect(share.querySelector('.tecton-chevron-right-outline')).not.toBeNull();
    await user.click(share);
    expect(await screen.findByRole('menuitem', { name: 'Email link' })).toBeInTheDocument();
  });

  it('toggles checkbox items and selects radio items', async () => {
    const user = userEvent.setup();
    const onWrap = vi.fn();
    const onZoom = vi.fn();
    renderBar({ onWrap, onZoom });
    await user.click(screen.getByRole('menuitem', { name: 'View' }));
    const wrap = await screen.findByRole('menuitemcheckbox', { name: 'Word wrap' });
    expect(wrap).toHaveAttribute('aria-checked', 'false');
    expect(wrap.querySelector('.tecton-check-outline')).toBeNull();
    await user.click(wrap);
    expect(onWrap).toHaveBeenCalledTimes(1);
    expect(onWrap.mock.calls[0][0]).toBe(true);

    // Checkbox and radio items keep the menu open by default.
    expect(wrap).toHaveAttribute('aria-checked', 'true');
    expect(wrap.querySelector('.tecton-check-outline')).not.toBeNull();

    expect(screen.getByRole('group', { name: 'Zoom' })).toBeInTheDocument();
    const r100 = screen.getByRole('menuitemradio', { name: '100%' });
    const r150 = screen.getByRole('menuitemradio', { name: '150%' });
    expect(r100).toHaveAttribute('aria-checked', 'true');
    expect(r100.querySelector('.tecton-radio-button-filled')).not.toBeNull();
    expect(r150.querySelector('.tecton-radio-button-outline')).not.toBeNull();
    await user.click(r150);
    expect(onZoom).toHaveBeenCalledTimes(1);
    expect(onZoom.mock.calls[0][0]).toBe(150);
  });

  it('styles the popup from the theme Menu paper override', async () => {
    const user = userEvent.setup();
    const theme = createMuiTheme({
      components: { MuiMenu: { styleOverrides: { paper: { backgroundColor: 'rgb(1, 2, 3)' } } } },
    });
    render(
      <MuiThemeProvider theme={theme}>
        <AppMenubar />
      </MuiThemeProvider>,
    );
    await user.click(screen.getByRole('menuitem', { name: 'File' }));
    const menu = await screen.findByRole('menu');
    expect(getComputedStyle(menu).backgroundColor).toBe('rgb(1, 2, 3)');
  });

  it('accepts sx and className on the bar', () => {
    render(
      <Menubar className="app-bar-menu" sx={{ marginTop: '7px' }}>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
        </MenubarMenu>
      </Menubar>,
    );
    const bar = screen.getByRole('menubar');
    expect(bar).toHaveClass('app-bar-menu', menubarClasses.root);
    expect(getComputedStyle(bar).marginTop).toBe('7px');
  });

  it('renders on the server', () => {
    const html = renderToString(
      <ThemeProvider>
        <AppMenubar />
      </ThemeProvider>,
    );
    expect(html).toContain('role="menubar"');
    expect(html).toContain('File');
  });
});
