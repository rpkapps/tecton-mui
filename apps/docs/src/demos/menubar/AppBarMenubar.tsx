import AppBar, { AppBarActions, AppBarBrand } from '@tecton-mui/ui/AppBar';
import Icon from '@tecton-mui/ui/Icon';
import Menubar, {
  MenubarItem,
  MenubarMenu,
  MenubarPopup,
  MenubarPortal,
  MenubarPositioner,
  MenubarSeparator,
  MenubarTrigger,
} from '@tecton-mui/ui/Menubar';

const menus = [
  { label: 'File', items: ['New survey', 'Open…', 'Save'] },
  { label: 'Data', items: ['Import logs…', 'Refresh sources'] },
  { label: 'Tools', items: ['Unit converter', 'Depth calculator'] },
];

export default function AppBarMenubar() {
  return (
    <AppBar>
      <AppBarBrand logo={<Icon name="layers" variant="filled" />}>Survey workspace</AppBarBrand>
      <AppBarActions>
        <Menubar aria-label="Survey workspace">
          {menus.map((menu) => (
            <MenubarMenu key={menu.label}>
              <MenubarTrigger>{menu.label}</MenubarTrigger>
              <MenubarPortal>
                <MenubarPositioner>
                  <MenubarPopup>
                    {menu.items.map((item) => (
                      <MenubarItem key={item}>{item}</MenubarItem>
                    ))}
                    <MenubarSeparator />
                    <MenubarItem icon={<Icon name="settings" />}>{menu.label} settings</MenubarItem>
                  </MenubarPopup>
                </MenubarPositioner>
              </MenubarPortal>
            </MenubarMenu>
          ))}
        </Menubar>
      </AppBarActions>
    </AppBar>
  );
}
