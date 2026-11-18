import * as React from 'react';

export type Direction = 'ltr' | 'rtl';
const STORAGE_KEY = 'tecton-docs-direction';

interface DocsSettings {
  direction: Direction;
  toggleDirection: () => void;
}

const SettingsContext = React.createContext<DocsSettings>({
  direction: 'ltr',
  toggleDirection: () => {},
});

function readStoredDirection(): Direction {
  if (typeof window === 'undefined') return 'ltr';
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'rtl' ? 'rtl' : 'ltr';
  } catch {
    return 'ltr';
  }
}

/** Portal-only preference: text direction of the whole portal (demos included). */
export function DocsSettingsProvider({ children }: { children: React.ReactNode }) {
  const [direction, setDirection] = React.useState<Direction>(readStoredDirection);

  React.useEffect(() => {
    document.documentElement.dir = direction;
    try {
      window.localStorage.setItem(STORAGE_KEY, direction);
    } catch {
      // Storage may be unavailable (private mode); the preference then lasts for this page only.
    }
  }, [direction]);

  const value = React.useMemo(
    () => ({
      direction,
      toggleDirection: () => setDirection((d) => (d === 'rtl' ? 'ltr' : 'rtl')),
    }),
    [direction],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useDocsSettings = () => React.useContext(SettingsContext);
