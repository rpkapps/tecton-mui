import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Tab from '@tecton-mui/ui/Tab';
import TabScrollButton, { type TabScrollButtonProps } from '@tecton-mui/ui/TabScrollButton';
import Tabs from '@tecton-mui/ui/Tabs';

const wells = Array.from({ length: 14 }, (_, i) => `WELL-${String(i + 1).padStart(2, '0')}`);

// Module-level slot component: a stable identity, so Tabs never remounts its scroll buttons.
// It keeps TabScrollButton's behaviour and hides the button while there is nothing to scroll.
function FadingScrollButton(props: TabScrollButtonProps) {
  return (
    <TabScrollButton
      {...props}
      sx={{ transition: 'opacity 150ms', '&.Mui-disabled': { opacity: 0 } }}
    />
  );
}

export default function CustomScrollButtons() {
  const [value, setValue] = React.useState(0);
  return (
    <Box sx={{ width: '100%', maxWidth: 480, bgcolor: 'background.paper' }}>
      <Tabs
        value={value}
        onChange={(_, next: number) => setValue(next)}
        variant="scrollable"
        scrollButtons
        allowScrollButtonsMobile
        aria-label="Wells"
        slots={{ scrollButtons: FadingScrollButton }}
      >
        {wells.map((well) => (
          <Tab key={well} label={well} />
        ))}
      </Tabs>
    </Box>
  );
}
