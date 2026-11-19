import Menubar, {
  MenubarItem,
  MenubarMenu,
  MenubarPopup,
  MenubarPortal,
  MenubarPositioner,
  MenubarSeparator,
  MenubarSubmenu,
  MenubarSubmenuTrigger,
  MenubarTrigger,
} from '@tecton-mui/ui/Menubar';

export default function BasicMenubar() {
  return (
    <Menubar aria-label="Project">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarPortal>
          <MenubarPositioner>
            <MenubarPopup>
              <MenubarItem>New project</MenubarItem>
              <MenubarItem>Open…</MenubarItem>
              <MenubarItem>Save</MenubarItem>
              <MenubarSeparator />
              <MenubarSubmenu>
                <MenubarSubmenuTrigger>Export as</MenubarSubmenuTrigger>
                <MenubarPortal>
                  <MenubarPositioner>
                    <MenubarPopup>
                      <MenubarItem>CSV</MenubarItem>
                      <MenubarItem>LAS</MenubarItem>
                      <MenubarItem>PDF report</MenubarItem>
                    </MenubarPopup>
                  </MenubarPositioner>
                </MenubarPortal>
              </MenubarSubmenu>
              <MenubarSeparator />
              <MenubarItem>Close project</MenubarItem>
            </MenubarPopup>
          </MenubarPositioner>
        </MenubarPortal>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarPortal>
          <MenubarPositioner>
            <MenubarPopup>
              <MenubarItem>Undo</MenubarItem>
              <MenubarItem>Redo</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Select all wells</MenubarItem>
            </MenubarPopup>
          </MenubarPositioner>
        </MenubarPortal>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Help</MenubarTrigger>
        <MenubarPortal>
          <MenubarPositioner>
            <MenubarPopup>
              <MenubarItem>Documentation</MenubarItem>
              <MenubarItem>Release notes</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>About</MenubarItem>
            </MenubarPopup>
          </MenubarPositioner>
        </MenubarPortal>
      </MenubarMenu>
    </Menubar>
  );
}
