import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Button from '@tecton-mui/ui/Button';
import Divider from '@tecton-mui/ui/Divider';
import Heading, {
  HeadingActions,
  HeadingSearch,
  HeadingTabs,
  HeadingTitle,
} from '@tecton-mui/ui/Heading';
import Icon from '@tecton-mui/ui/Icon';
import IconButton from '@tecton-mui/ui/IconButton';
import Slider from '@tecton-mui/ui/Slider';
import Stack from '@tecton-mui/ui/Stack';
import Tab from '@tecton-mui/ui/Tab';
import Typography from '@tecton-mui/ui/Typography';

const SECTIONS = ['Overview', 'Framing', 'Team', 'Builder', 'Time & Cost', 'Compare', 'Analytics'];

export default function ResponsiveHeading() {
  const [width, setWidth] = React.useState(100);
  const [section, setSection] = React.useState('Overview');
  const [query, setQuery] = React.useState('');

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', maxWidth: 360 }}>
        <Typography variant="body2" id="heading-width-label" sx={{ flexShrink: 0 }}>
          Width
        </Typography>
        <Slider
          value={width}
          min={25}
          max={100}
          onChange={(_event, next) => setWidth(next as number)}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value}%`}
          aria-labelledby="heading-width-label"
        />
      </Stack>
      <Box sx={{ width: `${width}%`, border: 1, borderColor: 'divider', borderStyle: 'dashed' }}>
        <Heading>
          <IconButton aria-label="Overview" onClick={() => setSection('Overview')}>
            <Icon name="home" />
          </IconButton>
          <HeadingTitle>Portfolio</HeadingTitle>
          <HeadingTabs
            value={section}
            onChange={(_event, next: string) => setSection(next)}
            aria-label="Portfolio sections"
          >
            {SECTIONS.map((name) => (
              <Tab key={name} value={name} label={name} />
            ))}
          </HeadingTabs>
          <HeadingActions>
            <HeadingSearch value={query} onChange={(_event, next) => setQuery(next)} />
            <Divider orientation="vertical" flexItem emphasis="subtle" />
            <Button variant="text" color="secondary">
              Publish
            </Button>
            <Button variant="contained" startIcon={<Icon name="add" />}>
              Create Project
            </Button>
          </HeadingActions>
        </Heading>
        {query ? (
          <Typography variant="body2" sx={{ px: { xs: 2, md: 9 }, pb: 2 }}>
            Projects matching “{query}”
          </Typography>
        ) : null}
      </Box>
    </Stack>
  );
}
