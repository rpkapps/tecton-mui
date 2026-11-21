import * as React from 'react';
import AppBar, { type AppBarTab } from '@tecton-mui/ui/AppBar';
import Box from '@tecton-mui/ui/Box';
import Icon from '@tecton-mui/ui/Icon';
import IconButton from '@tecton-mui/ui/IconButton';
import Paper from '@tecton-mui/ui/Paper';
import Typography from '@tecton-mui/ui/Typography';

const FIXED_TABS = [{ id: 'home', icon: 'home', label: 'Home' }];
const SECTIONS: AppBarTab[] = [
  { id: 'summary', label: 'Summary', closeable: false },
  { id: 'logs', label: 'Logs', closeable: false },
  { id: 'history', label: 'History', closeable: false },
];

/** A shell: the primary bar opens projects, the secondary bar switches sections of one. */
export default function AppShellAppBar() {
  const [projects, setProjects] = React.useState<AppBarTab[]>([
    { id: 'well-a12', label: 'Well A-12', icon: 'project' },
    { id: 'well-b04', label: 'Well B-04', icon: 'project' },
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
    setProjects((list) => [...list, { id, label: `New well ${count.current}`, icon: 'project' }]);
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
      <AppBar
        appName="Field Planner"
        logo="map-filled"
        fixedTabs={FIXED_TABS}
        tabs={projects}
        activeTab={project}
        maxTabs={5}
        onTabSelect={setProject}
        onTabAdd={addProject}
        onTabClose={closeProject}
      >
        <IconButton aria-label="Settings">
          <Icon name="settings" />
        </IconButton>
      </AppBar>
      {current && (
        <AppBar
          tier="secondary"
          aria-label="Project sections"
          tabs={SECTIONS}
          activeTab={section}
          disableTabAdd
          onTabSelect={(id) => setSections((s) => ({ ...s, [project]: id }))}
        />
      )}
      <Paper square elevation={0} sx={{ p: 3, minHeight: 160 }}>
        <Typography variant="h6" component="h2">
          {current ? `${current.label}: ${SECTIONS.find((s) => s.id === section)?.label}` : 'Home'}
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
