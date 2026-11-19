import * as React from 'react';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import Menubar, {
  MenubarCheckboxItem,
  MenubarGroup,
  MenubarGroupLabel,
  MenubarMenu,
  MenubarPopup,
  MenubarPortal,
  MenubarPositioner,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarTrigger,
} from '@tecton-mui/ui/Menubar';

export default function MenubarSelection() {
  const [showGrid, setShowGrid] = React.useState(true);
  const [showLabels, setShowLabels] = React.useState(false);
  const [units, setUnits] = React.useState('metric');
  return (
    <Stack spacing={2}>
      <Menubar aria-label="Map">
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarPortal>
            <MenubarPositioner>
              <MenubarPopup>
                <MenubarGroup>
                  <MenubarGroupLabel>Layers</MenubarGroupLabel>
                  <MenubarCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
                    Grid lines
                  </MenubarCheckboxItem>
                  <MenubarCheckboxItem checked={showLabels} onCheckedChange={setShowLabels}>
                    Well labels
                  </MenubarCheckboxItem>
                </MenubarGroup>
                <MenubarSeparator />
                <MenubarGroup>
                  <MenubarGroupLabel>Units</MenubarGroupLabel>
                  <MenubarRadioGroup
                    value={units}
                    onValueChange={(value) => setUnits(value as string)}
                  >
                    <MenubarRadioItem value="metric">Metric</MenubarRadioItem>
                    <MenubarRadioItem value="imperial">Imperial</MenubarRadioItem>
                  </MenubarRadioGroup>
                </MenubarGroup>
              </MenubarPopup>
            </MenubarPositioner>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
      <Typography variant="body2" color="text.secondary">
        Grid lines {showGrid ? 'on' : 'off'}, well labels {showLabels ? 'on' : 'off'}, {units}{' '}
        units.
      </Typography>
    </Stack>
  );
}
