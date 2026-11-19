import Paper from '@tecton-mui/ui/Paper';
import Menubar, {
  MenubarItem,
  MenubarMenu,
  MenubarPopup,
  MenubarPortal,
  MenubarPositioner,
  MenubarTrigger,
} from '@tecton-mui/ui/Menubar';

const sections = {
  Wells: ['Add well', 'Import trajectory', 'Archive'],
  Reports: ['Daily drilling', 'Formation tops', 'Cost summary'],
  Admin: ['Users', 'Permissions'],
};

export default function VerticalMenubar() {
  return (
    <Paper variant="outlined" sx={{ display: 'inline-flex', p: 0.5 }}>
      <Menubar orientation="vertical" aria-label="Sections">
        {Object.entries(sections).map(([label, items]) => (
          <MenubarMenu key={label}>
            <MenubarTrigger>{label}</MenubarTrigger>
            <MenubarPortal>
              <MenubarPositioner side="inline-end" align="start" sideOffset={8}>
                <MenubarPopup>
                  {items.map((item) => (
                    <MenubarItem key={item}>{item}</MenubarItem>
                  ))}
                </MenubarPopup>
              </MenubarPositioner>
            </MenubarPortal>
          </MenubarMenu>
        ))}
      </Menubar>
    </Paper>
  );
}
