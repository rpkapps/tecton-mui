import * as React from 'react';
import { ThemeProvider } from '@tecton-mui/ui/styles';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CssBaseline,
  FormControlLabel,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Radio,
  Slider,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  StaticDatePicker,
} from '@tecton-mui/ui';
import Icon from '@tecton-mui/ui/Icon';
import NumberField from '@tecton-mui/ui/NumberField';
import NumberSpinner from '@tecton-mui/ui/NumberSpinner';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DataGrid from '@tecton-mui/ui/DataGrid';
import { GridScenarios } from './GridScenarios.js';
import { PickerScenarios, TreeScenarios } from './AdvancedScenarios.js';
import { StorybookScenario } from './storybook/StorybookScenario.js';
import { MenubarScenario } from './MenubarScenario.js';
import { ActionBarScenario } from './ActionBarScenario.js';
import { AppBarAttachedScenario } from './AppBarAttachedScenario.js';
import { HeadingScenario } from './HeadingScenario.js';
import { ColorSwatchScenario } from './ColorSwatchScenario.js';
import { NumberFieldScenario } from './NumberFieldScenario.js';
import { NumberSliderScenario } from './NumberSliderScenario.js';
import { InputFocusScenario } from './InputFocusScenario.js';
import { ButtonFocusScenario } from './ButtonFocusScenario.js';
import { ChatScenario } from './ChatScenario.js';

const rows = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: ['Ada', 'Grace', 'Linus', 'Margaret', 'Ken', 'Barbara', 'Dennis', 'Frances'][i],
  department: [
    'Engineering',
    'Research',
    'Engineering',
    'Space',
    'Research',
    'Engineering',
    'Space',
    'Research',
  ][i],
  salary: 90000 + i * 7500,
}));
const columns = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'name', headerName: 'Name', width: 160 },
  { field: 'department', headerName: 'Department', width: 160 },
  { field: 'salary', headerName: 'Salary', type: 'number' as const, width: 140 },
];

export function Showcase() {
  const [tab, setTab] = React.useState(0);
  return (
    <Box
      sx={{
        p: 3,
        display: 'grid',
        gap: 3,
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(420px, 100%), 1fr))',
      }}
    >
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Buttons
        </Typography>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Button variant="contained">Primary</Button>
          <Button variant="contained" color="secondary">
            Secondary
          </Button>
          <Button variant="outlined">Outlined</Button>
          <Button variant="text" color="tertiary">
            Tertiary
          </Button>
          <Button variant="contained" startIcon={<Icon name="add" />}>
            With icon
          </Button>
          <Button variant="contained" disabled>
            Disabled
          </Button>
          <IconButton aria-label="settings">
            <Icon name="settings" />
          </IconButton>
        </Stack>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Inputs
        </Typography>
        <Stack spacing={2}>
          <TextField label="Well name" defaultValue="Alpha-7" />
          <TextField select label="Basin" defaultValue="north">
            <MenuItem value="north">North Sea</MenuItem>
            <MenuItem value="gulf">Gulf of Mexico</MenuItem>
          </TextField>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
            <NumberField
              label="Pump rate"
              defaultValue={120}
              min={0}
              step={10}
              locale="en-US"
              format={{ style: 'unit', unit: 'liter-per-minute' }}
            />
            <NumberSpinner label="Crew" defaultValue={4} min={0} max={12} locale="en-US" />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <FormControlLabel control={<Checkbox defaultChecked />} label="Checkbox" />
            <FormControlLabel control={<Radio checked />} label="Radio" />
            <FormControlLabel control={<Switch defaultChecked />} label="Switch" />
          </Stack>
          <Slider defaultValue={40} aria-label="Depth" />
        </Stack>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Data display &amp; feedback
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
          <Chip label="Default" />
          <Chip label="Primary" color="primary" />
          <Chip label="Outlined" variant="outlined" />
          <Badge badgeContent={4} color="primary">
            <Icon name="notifications" size="large" />
          </Badge>
          <Avatar>AL</Avatar>
        </Stack>
        <Stack spacing={1}>
          <Alert severity="success">Survey import completed.</Alert>
          <Alert severity="warning" variant="outlined">
            Pressure above threshold.
          </Alert>
          <LinearProgress variant="determinate" value={60} aria-label="Upload progress" />
        </Stack>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Navigation &amp; surfaces
        </Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Overview" />
          <Tab label="Logs" />
          <Tab label="Settings" />
        </Tabs>
        <Card>
          <CardContent>
            <Typography variant="h6">Card title</Typography>
            <Typography variant="body2" color="text.secondary">
              Tecton surfaces, typography and spacing tokens.
            </Typography>
          </CardContent>
        </Card>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          {(
            ['home', 'search', 'filter', 'download', 'calendar', 'well', 'map', 'layers'] as const
          ).map((n) => (
            <Icon key={n} name={n} size="large" title={n} />
          ))}
        </Stack>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Date picker
        </Typography>
        <LocalizationProvider>
          <StaticDatePicker defaultValue={new Date(2026, 10, 18)} />
        </LocalizationProvider>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Data Grid (no advanced props)
        </Typography>
        <Box sx={{ height: 420 }}>
          <DataGrid rows={rows} columns={columns} checkboxSelection />
        </Box>
      </Paper>
    </Box>
  );
}

export function App({ scenario, rtl }: { scenario: string; rtl: boolean }) {
  return (
    <ThemeProvider direction={rtl ? 'rtl' : 'ltr'}>
      <CssBaseline />
      <div dir={rtl ? 'rtl' : 'ltr'}>
        {scenario === 'showcase' ? (
          <Showcase />
        ) : scenario.startsWith('grid') ? (
          <GridScenarios which={scenario.split(':')[1] ?? 'all'} />
        ) : scenario === 'pickers' ? (
          <PickerScenarios />
        ) : scenario === 'tree' ? (
          <TreeScenarios />
        ) : scenario === 'menubar' ? (
          <MenubarScenario />
        ) : scenario === 'action-bar' ? (
          <ActionBarScenario />
        ) : scenario === 'app-bar-attached' ? (
          <AppBarAttachedScenario />
        ) : scenario === 'heading' ? (
          <HeadingScenario />
        ) : scenario === 'color-swatch' ? (
          <ColorSwatchScenario />
        ) : scenario === 'number-field' ? (
          <NumberFieldScenario />
        ) : scenario === 'number-slider' ? (
          <NumberSliderScenario />
        ) : scenario === 'input-focus' ? (
          <InputFocusScenario />
        ) : scenario === 'button-focus' ? (
          <ButtonFocusScenario />
        ) : scenario === 'chat' ? (
          <ChatScenario />
        ) : scenario.startsWith('sb:') ? (
          <StorybookScenario id={scenario.slice(3)} />
        ) : null}
      </div>
    </ThemeProvider>
  );
}
