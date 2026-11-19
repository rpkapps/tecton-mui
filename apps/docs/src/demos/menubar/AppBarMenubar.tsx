import AppBar from '@tecton-mui/ui/AppBar';
import Toolbar from '@tecton-mui/ui/Toolbar';
import Typography from '@tecton-mui/ui/Typography';
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
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar variant="dense" sx={{ gap: 2 }}>
        <Icon name="layers" size="medium" />
        <Typography variant="subtitle1" component="span">
          Survey workspace
        </Typography>
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
      </Toolbar>
    </AppBar>
  );
}
