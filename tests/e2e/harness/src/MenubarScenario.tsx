import * as React from 'react';
import { Box, Typography } from '@tecton-mui/ui';
import Icon from '@tecton-mui/ui/Icon';
import Menubar, {
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
} from '@tecton-mui/ui/Menubar';

export function MenubarScenario() {
  const [last, setLast] = React.useState('none');
  const [wrap, setWrap] = React.useState(false);
  const [zoom, setZoom] = React.useState('100');
  return (
    <Box sx={{ p: 3, minHeight: 480 }}>
      <Menubar aria-label="Application">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarPositioner>
              <MenubarPopup>
                <MenubarItem
                  icon={<Icon name="add" />}
                  hint="Ctrl+N"
                  onClick={() => setLast('New')}
                >
                  New
                </MenubarItem>
                <MenubarItem disabled>Save</MenubarItem>
                <MenubarSeparator />
                <MenubarSubmenu>
                  <MenubarSubmenuTrigger>Export as</MenubarSubmenuTrigger>
                  <MenubarPortal>
                    <MenubarPositioner>
                      <MenubarPopup>
                        <MenubarItem onClick={() => setLast('CSV')}>CSV</MenubarItem>
                        <MenubarItem onClick={() => setLast('PDF')}>PDF</MenubarItem>
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
                <MenubarCheckboxItem checked={wrap} onCheckedChange={setWrap}>
                  Word wrap
                </MenubarCheckboxItem>
                <MenubarSeparator />
                <MenubarGroup>
                  <MenubarGroupLabel>Zoom</MenubarGroupLabel>
                  <MenubarRadioGroup value={zoom} onValueChange={(v) => setZoom(v as string)}>
                    <MenubarRadioItem value="100">100%</MenubarRadioItem>
                    <MenubarRadioItem value="150">150%</MenubarRadioItem>
                  </MenubarRadioGroup>
                </MenubarGroup>
              </MenubarPopup>
            </MenubarPositioner>
          </MenubarPortal>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Help</MenubarTrigger>
          <MenubarPortal>
            <MenubarPositioner>
              <MenubarPopup>
                <MenubarItem onClick={() => setLast('About')}>About</MenubarItem>
              </MenubarPopup>
            </MenubarPositioner>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
      <Typography data-testid="menubar-state" sx={{ mt: 2 }}>
        {`last=${last} wrap=${wrap} zoom=${zoom}`}
      </Typography>
    </Box>
  );
}
