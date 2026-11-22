// Matcher types (the docs tsconfig type-checks tests; the setup file registers the matchers).
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@tecton-mui/ui/styles';
import { CopyToken, RadiusTable, SpacingTable } from '../TokenTables';

const rowOf = (variable: string) =>
  screen.getByRole('button', { name: `Copy ${variable}` }).closest('tr') as HTMLElement;

describe('CopyToken', () => {
  it('copies the CSS variable name', async () => {
    const user = userEvent.setup();
    render(<CopyToken text="--tecton-color-text-primary" />);
    await user.click(screen.getByRole('button', { name: 'Copy --tecton-color-text-primary' }));
    await expect(navigator.clipboard.readText()).resolves.toBe('--tecton-color-text-primary');
  });
});

describe('scale tables', () => {
  it('lists each spacing token with its value and sx multiplier', () => {
    render(
      <ThemeProvider>
        <SpacingTable />
      </ThemeProvider>,
    );
    const row = rowOf('--tecton-space-200');
    expect(within(row).getByText('16px')).toBeInTheDocument();
    expect(within(row).getByText('2')).toBeInTheDocument();
    expect(within(rowOf('--tecton-space-25')).getByText('0.25')).toBeInTheDocument();
  });

  it('lists each radius token with its sx borderRadius multiplier', () => {
    render(
      <ThemeProvider>
        <RadiusTable />
      </ThemeProvider>,
    );
    expect(within(rowOf('--tecton-radius-100')).getByText('2')).toBeInTheDocument();
    expect(within(rowOf('--tecton-radius-round')).getByText('—')).toBeInTheDocument();
  });
});
