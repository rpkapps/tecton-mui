import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Button from '@tecton-mui/ui/Button';
import Heading, {
  HeadingActions,
  HeadingSearch,
  HeadingTabs,
  HeadingTitle,
} from '@tecton-mui/ui/Heading';
import Icon from '@tecton-mui/ui/Icon';
import IconButton from '@tecton-mui/ui/IconButton';
import Tab from '@tecton-mui/ui/Tab';
import Typography from '@tecton-mui/ui/Typography';
import ToggleButton from '@tecton-mui/ui/ToggleButton';
import ToggleButtonGroup from '@tecton-mui/ui/ToggleButtonGroup';

const SECTIONS = ['Overview', 'Team', 'Builder', 'Analytics'];
const PROJECTS = ['Orion Discovery', 'Gulf Appraisal', 'North Sea Infill'];

export default function PageHeading() {
  const [section, setSection] = React.useState('Overview');
  const [layout, setLayout] = React.useState('list');
  const [query, setQuery] = React.useState('');
  const projects = PROJECTS.filter((name) =>
    name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Heading component="header">
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
          <HeadingSearch
            label="Search projects"
            value={query}
            onChange={(_event, next) => setQuery(next)}
          />
          <ToggleButtonGroup
            exclusive
            value={layout}
            onChange={(_event, next: string | null) => next && setLayout(next)}
            aria-label="Layout"
          >
            <ToggleButton value="list">
              <Icon name="list" sx={{ mr: 0.5 }} />
              List
            </ToggleButton>
            <ToggleButton value="grid">
              <Icon name="grid-view" sx={{ mr: 0.5 }} />
              Grid
            </ToggleButton>
          </ToggleButtonGroup>
          <Button variant="text" color="secondary">
            Publish
          </Button>
          <Button variant="contained" startIcon={<Icon name="add" />}>
            Create Project
          </Button>
        </HeadingActions>
      </Heading>
      <Typography variant="body2" sx={{ px: { xs: 2, md: 9 }, pb: 2 }}>
        {section}: {projects.join(', ') || 'no project matches'}
      </Typography>
    </Box>
  );
}
