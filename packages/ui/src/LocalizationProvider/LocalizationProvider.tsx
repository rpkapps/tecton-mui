'use client';
import * as React from 'react';
import {
  LocalizationProvider as MuiLocalizationProvider,
  type LocalizationProviderProps as MuiLocalizationProviderProps,
} from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enUS } from 'date-fns/locale/en-US';

export type LocalizationProviderProps<TLocale = unknown> = Omit<
  MuiLocalizationProviderProps<TLocale>,
  'dateAdapter'
> & {
  /**
   * Date library adapter class. Defaults to `AdapterDateFns` (native `Date` values). Import other
   * adapters explicitly, e.g. `@tecton-mui/ui/AdapterDayjs`; they are never bundled by default.
   */
  dateAdapter?: MuiLocalizationProviderProps<TLocale>['dateAdapter'];
};

/** True below a Tecton LocalizationProvider, which always provides an adapter. */
const HasAdapterContext = React.createContext(false);

/**
 * MUI X LocalizationProvider defaulting to date-fns with the `en-US` locale. It stays separate
 * from ThemeProvider (MUI's model); render it wherever pickers are used. Nested without
 * `dateAdapter` (e.g. only to override `localeText`), it keeps the parent's adapter, as MUI does.
 */
export function LocalizationProvider<TLocale = unknown>(props: LocalizationProviderProps<TLocale>) {
  const { dateAdapter, adapterLocale, children, ...other } = props;
  const nested = React.useContext(HasAdapterContext);
  let provider: React.ReactNode;
  if (dateAdapter || nested) {
    provider = (
      <MuiLocalizationProvider dateAdapter={dateAdapter} adapterLocale={adapterLocale} {...other}>
        {children}
      </MuiLocalizationProvider>
    );
  } else {
    provider = (
      <MuiLocalizationProvider
        dateAdapter={AdapterDateFns}
        adapterLocale={(adapterLocale as typeof enUS | undefined) ?? enUS}
        {...(other as Omit<MuiLocalizationProviderProps<typeof enUS>, 'dateAdapter'>)}
      >
        {children}
      </MuiLocalizationProvider>
    );
  }
  return nested ? (
    provider
  ) : (
    <HasAdapterContext.Provider value>{provider}</HasAdapterContext.Provider>
  );
}

export default LocalizationProvider;
