import * as React from 'react';
import AppBar, { AppBarActions, AppBarBrand, AppBarTab, AppBarTabs } from '@tecton-mui/ui/AppBar';
import Box from '@tecton-mui/ui/Box';
import Icon from '@tecton-mui/ui/Icon';
import IconButton from '@tecton-mui/ui/IconButton';
import Paper from '@tecton-mui/ui/Paper';
import Typography from '@tecton-mui/ui/Typography';

const SECTIONS = [
  { id: 'summary', label: 'Summary' },
  { id: 'logs', label: 'Logs' },
  { id: 'history', label: 'History' },
];

/** A shell: the primary bar opens projects, the secondary bar switches sections of one. */
export default function AppShellAppBar() {
  const [projects, setProjects] = React.useState([
    { id: 'well-a12', name: 'Well A-12' },
    { id: 'well-b04', name: 'Well B-04' },
  ]);
  const [project, setProject] = React.useState('well-a12');
  // Each project remembers its own section.
  const [sections, setSections] = React.useState<Record<string, string>>({});
  const count = React.useRef(0);
  const current = projects.find((p) => p.id === project);
  const section = sections[project] ?? 'summary';

  const addProject = () => {
    count.current += 1;
    const id = `new-${count.current}`;
    setProjects((list) => [...list, { id, name: `New well ${count.current}` }]);
    setProject(id);
  };
  const closeProject = (id: string) => {
    const index = projects.findIndex((p) => p.id === id);
    const remaining = projects.filter((p) => p.id !== id);
    setProjects(remaining);
    if (project === id) setProject(remaining[Math.max(0, index - 1)]?.id ?? 'home');
  };

  return (
    <Box sx={{ border: 1, borderColor: 'divider' }}>
      <AppBar>
        <AppBarBrand logo={<Icon name="map" variant="filled" />}>Field Planner</AppBarBrand>
        <AppBarTabs
          value={project}
          onChange={(_event, value) => setProject(String(value))}
          onAdd={projects.length < 5 ? addProject : undefined}
        >
          <AppBarTab value="home" icon={<Icon name="home" />} aria-label="Home" />
          {projects.map((p) => (
            <AppBarTab
              key={p.id}
              value={p.id}
              icon={<Icon name="project" />}
              label={p.name}
              onClose={() => closeProject(p.id)}
            />
          ))}
        </AppBarTabs>
        <AppBarActions>
          <IconButton aria-label="Settings">
            <Icon name="settings" />
          </IconButton>
        </AppBarActions>
      </AppBar>
      {current && (
        <AppBar tier="secondary" aria-label="Project sections">
          <AppBarTabs
            value={section}
            onChange={(_event, value) => setSections((s) => ({ ...s, [project]: String(value) }))}
          >
            {SECTIONS.map((s) => (
              <AppBarTab key={s.id} value={s.id} label={s.label} />
            ))}
          </AppBarTabs>
        </AppBar>
      )}
      <Paper square elevation={0} sx={{ p: 3, minHeight: 160 }}>
        <Typography variant="h6" component="h2">
          {current ? `${current.name}: ${SECTIONS.find((s) => s.id === section)?.label}` : 'Home'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {current
            ? 'The page owns both bars: it decides which project and section are open.'
            : 'Open a project with + or select one of its tabs.'}
        </Typography>
      </Paper>
    </Box>
  );
}
