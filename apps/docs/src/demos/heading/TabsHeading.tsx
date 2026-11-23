import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Heading, { HeadingTabs, HeadingTitle } from '@tecton-mui/ui/Heading';
import Tab from '@tecton-mui/ui/Tab';
import Typography from '@tecton-mui/ui/Typography';

const VIEWS = ['Grid', 'List', 'Map'] as const;

export default function TabsHeading() {
  const [view, setView] = React.useState<(typeof VIEWS)[number]>('Grid');

  return (
    <Box sx={{ width: '100%' }}>
      <Heading>
        <HeadingTitle>Wells</HeadingTitle>
        <HeadingTabs
          value={view}
          onChange={(_event, next) => setView(next)}
          aria-label="Wells views"
        >
          {VIEWS.map((name) => (
            <Tab
              key={name}
              value={name}
              label={name}
              id={`wells-tab-${name}`}
              aria-controls={`wells-panel-${name}`}
            />
          ))}
        </HeadingTabs>
      </Heading>
      <Box
        role="tabpanel"
        id={`wells-panel-${view}`}
        aria-labelledby={`wells-tab-${view}`}
        sx={{ px: 9, pb: 4 }}
      >
        <Typography sx={{ color: 'text.secondary' }}>
          The wells, shown as a {view.toLowerCase()}.
        </Typography>
      </Box>
    </Box>
  );
}
