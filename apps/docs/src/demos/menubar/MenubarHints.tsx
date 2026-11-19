import * as React from 'react';
import Stack from '@tecton-mui/ui/Stack';
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

export default function MenubarHints() {
  const [last, setLast] = React.useState('nothing yet');
  const run = (command: string) => () => setLast(command);
  return (
    <Stack spacing={2}>
      <Menubar aria-label="Editor">
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarPortal>
            <MenubarPositioner>
              <MenubarPopup>
                <MenubarItem icon={<Icon name="undo" />} hint="Ctrl+Z" onClick={run('Undo')}>
                  Undo
                </MenubarItem>
                <MenubarItem icon={<Icon name="redo" />} hint="Ctrl+Y" onClick={run('Redo')}>
                  Redo
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem icon={<Icon name="copy" />} hint="Ctrl+C" onClick={run('Copy')}>
                  Copy
                </MenubarItem>
                <MenubarItem icon={<Icon name="delete" />} hint="Del" disabled>
                  Delete
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem icon={<Icon name="search" />} hint="Ctrl+F" onClick={run('Find')}>
                  Find…
                </MenubarItem>
              </MenubarPopup>
            </MenubarPositioner>
          </MenubarPortal>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarPortal>
            <MenubarPositioner>
              <MenubarPopup>
                <MenubarItem icon={<Icon name="zoom-in" />} hint="Ctrl++" onClick={run('Zoom in')}>
                  Zoom in
                </MenubarItem>
                <MenubarItem
                  icon={<Icon name="zoom-out" />}
                  hint="Ctrl+-"
                  onClick={run('Zoom out')}
                >
                  Zoom out
                </MenubarItem>
              </MenubarPopup>
            </MenubarPositioner>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
      <Typography variant="body2" color="text.secondary">
        Last command: {last}
      </Typography>
    </Stack>
  );
}
