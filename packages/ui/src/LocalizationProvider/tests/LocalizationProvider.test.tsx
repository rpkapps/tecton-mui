import { render, screen } from '@testing-library/react';
import { usePickerAdapter } from '@mui/x-date-pickers/hooks';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale/fr';
import { LocalizationProvider } from '../index.js';

function AdapterProbe() {
  const utils = usePickerAdapter();
  return <span data-testid="p">{`${utils.lib}|${(utils.locale as { code?: string })?.code}`}</span>;
}

describe('LocalizationProvider', () => {
  it('defaults to date-fns with en-US', () => {
    render(
      <LocalizationProvider>
        <AdapterProbe />
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('p')).toHaveTextContent('date-fns|en-US');
  });

  it('accepts an explicit adapter and locale', () => {
    render(
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
        <AdapterProbe />
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('p')).toHaveTextContent('date-fns|fr');
  });

  it('keeps the parent adapter and locale when nested without dateAdapter (MUI semantics)', () => {
    render(
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
        <LocalizationProvider localeText={{ okButtonLabel: 'Valider' }}>
          <AdapterProbe />
        </LocalizationProvider>
      </LocalizationProvider>,
    );
    expect(screen.getByTestId('p')).toHaveTextContent('date-fns|fr');
  });
});
