import Box from '@tecton-mui/ui/Box';
import GlobalStyles from '@tecton-mui/ui/GlobalStyles';
import type { Theme } from '@tecton-mui/ui/styles';

// A function receives the theme, so the rules follow the shared Tecton light/dark mode.
const styles = (theme: Theme) => ({
  '[data-themed-markup] mark': {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.getContrastText(theme.palette.warning.light),
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0, 0.5),
  },
  '[data-themed-markup] kbd': {
    ...theme.typography.caption,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0, 0.75),
  },
});

export default function ThemedGlobalStyles() {
  return (
    <>
      <GlobalStyles styles={styles} />
      <Box data-themed-markup="" sx={{ typography: 'body1', maxWidth: 480 }}>
        Search results highlight <mark>matched terms</mark>. Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to
        search again. Switch the portal mode to see the rules follow the theme.
      </Box>
    </>
  );
}
