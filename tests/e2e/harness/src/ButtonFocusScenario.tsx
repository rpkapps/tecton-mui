import * as React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Link,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  MenuList,
  Pagination,
  Stack,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
} from '@tecton-mui/ui';

/** ButtonBase controls whose keyboard focus ring comes from `theme.focusVisible`, in tab order. */
export function ButtonFocusScenario() {
  const [align, setAlign] = React.useState('left');
  const [tab, setTab] = React.useState(0);
  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3} sx={{ alignItems: 'flex-start' }}>
        <button type="button">Start</button>
        <ToggleButtonGroup
          exclusive
          value={align}
          onChange={(_, value: string | null) => value && setAlign(value)}
        >
          <ToggleButton value="left">Left</ToggleButton>
          <ToggleButton value="right">Right</ToggleButton>
        </ToggleButtonGroup>
        <ButtonGroup variant="contained">
          <Button>One</Button>
          <Button>Two</Button>
        </ButtonGroup>
        <Pagination count={5} />
        <Tabs value={tab} onChange={(_, v: number) => setTab(v)}>
          <Tab label="Summary" />
          <Tab label="Wells" />
        </Tabs>
        <List sx={{ width: 240, overflow: 'auto' }}>
          <ListItemButton>
            <ListItemText primary="Overview" />
          </ListItemButton>
        </List>
        <Link href="#wells">Wells</Link>
        <MenuList sx={{ width: 200 }}>
          <MenuItem>Cut</MenuItem>
          <MenuItem>Copy</MenuItem>
        </MenuList>
      </Stack>
    </Box>
  );
}
