import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import Button from '@tecton-mui/ui/Button';
import Typography from '@tecton-mui/ui/Typography';
import ToggleButton from '@tecton-mui/ui/ToggleButton';
import ToggleButtonGroup from '@tecton-mui/ui/ToggleButtonGroup';
import Icon from '@tecton-mui/ui/Icon';
import { useTectonMode, type ThemeModePreference } from '@tecton-mui/ui/styles';

/** Live view of the shared mode; it controls this portal as well. */
export function ModeDemo() {
  const { mode, preference, setMode, clearPreference } = useTectonMode();
  return (
    <Paper variant="outlined" sx={{ p: 3, my: 3 }}>
      <Stack spacing={2}>
        <Typography variant="body2" aria-live="polite">
          Resolved mode: <strong>{mode}</strong> · preference: <strong>{preference}</strong>
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          useFlexGap
          sx={{ flexWrap: 'wrap', alignItems: 'center' }}
        >
          <ToggleButtonGroup
            exclusive
            size="small"
            value={preference}
            onChange={(_, value: ThemeModePreference | null) => value && setMode(value)}
            aria-label="Theme mode preference"
          >
            <ToggleButton value="light">
              <Icon name="light-mode" size="small" />
              &nbsp;Light
            </ToggleButton>
            <ToggleButton value="dark">
              <Icon name="dark-mode" size="small" />
              &nbsp;Dark
            </ToggleButton>
            <ToggleButton value="system">
              <Icon name="system-theme" size="small" />
              &nbsp;System
            </ToggleButton>
          </ToggleButtonGroup>
          <Button size="small" onClick={clearPreference}>
            Clear preference
          </Button>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          This control uses the same shared manager as the portal header, so both stay in sync.
        </Typography>
      </Stack>
    </Paper>
  );
}
