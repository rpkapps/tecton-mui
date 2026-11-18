import * as React from 'react';
import Tabs from '@tecton-mui/ui/Tabs';
import Tab from '@tecton-mui/ui/Tab';
import Box from '@tecton-mui/ui/Box';
import Typography from '@tecton-mui/ui/Typography';

const panels = ['Summary', 'Wells', 'Documents'];

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);
  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={value}
        onChange={(_, next: number) => setValue(next)}
        aria-label="Project sections"
      >
        {panels.map((label, index) => (
          <Tab key={label} label={label} id={`tab-${index}`} aria-controls={`tabpanel-${index}`} />
        ))}
      </Tabs>
      {panels.map((label, index) => (
        <div
          key={label}
          role="tabpanel"
          hidden={value !== index}
          id={`tabpanel-${index}`}
          aria-labelledby={`tab-${index}`}
        >
          {value === index && (
            <Typography sx={{ p: 2 }} variant="body2">
              {label} content
            </Typography>
          )}
        </div>
      ))}
    </Box>
  );
}
