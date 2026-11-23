// Page heading in a real browser: the title's home and menu buttons, tabs that switch the page's
// section, actions, and a section heading below. Used by tests/e2e/heading.spec.ts.
import * as React from 'react';
import {
  Box,
  Button,
  Divider,
  FormControl,
  Heading,
  HeadingActions,
  HeadingTabs,
  HeadingTitle,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Select,
  Tab,
  Typography,
} from '@tecton-mui/ui';
import Icon from '@tecton-mui/ui/Icon';

const PORTFOLIOS = ['Portfolio', 'Gulf Coast', 'North Sea'];
const SECTIONS = ['Overview', 'Framing', 'Team', 'Builder', 'Time & Cost', 'Compare', 'Analytics'];

export function HeadingScenario() {
  const [portfolio, setPortfolio] = React.useState(PORTFOLIOS[0]);
  const [section, setSection] = React.useState(0);
  const [sort, setSort] = React.useState('Recent');
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const [log, setLog] = React.useState('');
  const open = Boolean(anchor);

  return (
    <Box>
      <Heading component="header" data-testid="page-heading">
        <HeadingTitle
          onHomeClick={() => setLog('home')}
          onMenuClick={(event) => setAnchor(event.currentTarget)}
          slotProps={{
            menuButton: {
              'aria-label': 'Switch portfolio',
              'aria-haspopup': 'menu',
              'aria-expanded': open,
              'aria-controls': open ? 'portfolio-menu' : undefined,
            },
          }}
        >
          {portfolio}
        </HeadingTitle>
        <HeadingTabs
          value={section}
          onChange={(_event, next: number) => setSection(next)}
          aria-label="Portfolio sections"
        >
          {SECTIONS.map((label) => (
            <Tab key={label} label={label} />
          ))}
        </HeadingTabs>
        <HeadingActions>
          <IconButton aria-label="Search" onClick={() => setLog('search')}>
            <Icon name="search" />
          </IconButton>
          <Divider orientation="vertical" flexItem emphasis="subtle" />
          <FormControl size="small" variant="filled">
            <Select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              inputProps={{ 'aria-label': 'Sort' }}
              startAdornment={
                <InputAdornment position="start">
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Sort:
                  </Typography>
                </InputAdornment>
              }
            >
              <MenuItem value="Recent">Recent</MenuItem>
              <MenuItem value="Name">Name</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<Icon name="add" />}
            onClick={() => setLog('create')}
          >
            Create Project
          </Button>
        </HeadingActions>
      </Heading>
      <Menu
        id="portfolio-menu"
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        slotProps={{ list: { 'aria-label': 'Portfolios' } }}
      >
        {PORTFOLIOS.map((name) => (
          <MenuItem
            key={name}
            selected={name === portfolio}
            onClick={() => {
              setPortfolio(name);
              setAnchor(null);
            }}
          >
            {name}
          </MenuItem>
        ))}
      </Menu>
      <Box component="main" sx={{ px: 9 }}>
        <Typography data-testid="section">{SECTIONS[section]}</Typography>
        <Typography data-testid="event-log">{log}</Typography>
      </Box>
      <Heading data-testid="section-heading">
        <HeadingTitle slotProps={{ title: { component: 'h2' } }}>Wells</HeadingTitle>
      </Heading>
    </Box>
  );
}
