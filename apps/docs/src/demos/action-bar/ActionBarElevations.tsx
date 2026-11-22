import Box from '@tecton-mui/ui/Box';
import Icon from '@tecton-mui/ui/Icon';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import ActionBar, {
  ActionBarButton,
  ActionBarGroup,
  type ActionBarElevation,
} from '@tecton-mui/ui/ActionBar';

const elevations: { elevation: ActionBarElevation; caption: string }[] = [
  { elevation: 0, caption: 'elevation={0}' },
  { elevation: 1, caption: 'elevation={1} (default)' },
  { elevation: 2, caption: 'elevation={2}' },
];

export default function ActionBarElevations() {
  return (
    <Box
      sx={{
        width: '100%',
        p: 2,
        borderRadius: 1,
        bgcolor: 'background.default',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" spacing={4} useFlexGap sx={{ flexWrap: 'wrap' }}>
        {elevations.map(({ elevation, caption }) => (
          <Stack key={elevation} spacing={1} sx={{ alignItems: 'flex-start' }}>
            <ActionBar
              aria-label={`Elevation ${elevation} tools`}
              elevation={elevation}
              defaultValue="select"
            >
              <ActionBarGroup>
                <ActionBarButton
                  value="select"
                  label="Select"
                  icon={<Icon name="select-cursor" />}
                />
                <ActionBarButton value="pan" label="Pan" icon={<Icon name="pan-tool" />} />
                <ActionBarButton value="measure" label="Measure" icon={<Icon name="ruler" />} />
              </ActionBarGroup>
              <ActionBarGroup>
                <ActionBarButton label="Undo" icon={<Icon name="undo" />} />
              </ActionBarGroup>
            </ActionBar>
            <Typography variant="caption" color="text.secondary" component="code">
              {caption}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
