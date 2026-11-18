import ScopedCssBaseline from '@tecton-mui/ui/ScopedCssBaseline';
import { ThemeProvider, type ThemeOptions } from '@tecton-mui/ui/styles';

// Module-level options: ThemeProvider rebuilds the theme only when the shared mode changes.
const themeOptions: ThemeOptions = {
  components: {
    MuiScopedCssBaseline: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: theme.spacing(2),
          '& a': { color: theme.palette.primary.main, textUnderlineOffset: 3 },
          '& code': {
            ...theme.typography.caption,
            fontFamily: 'monospace',
            padding: theme.spacing(0.25, 0.5),
            borderRadius: theme.shape.borderRadius,
            backgroundColor: theme.palette.action.hover,
          },
        }),
      },
    },
  },
};

export default function BaselineThemeOverrides() {
  return (
    <ThemeProvider themeOptions={themeOptions}>
      <ScopedCssBaseline sx={{ maxWidth: 480, border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <p style={{ marginTop: 0 }}>
          Markdown rendered by a hosted feature: run <code>pnpm build</code>, then read the{' '}
          <a href="#theme-overrides">deployment notes</a>.
        </p>
        <p style={{ marginBottom: 0 }}>
          The link and code styles come from <code>MuiScopedCssBaseline.styleOverrides</code>.
        </p>
      </ScopedCssBaseline>
    </ThemeProvider>
  );
}
