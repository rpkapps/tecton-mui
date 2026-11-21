import * as React from 'react';
import { render } from '@testing-library/react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Pagination from '@mui/material/Pagination';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TablePagination from '@mui/material/TablePagination';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { DesktopTimePicker } from '@mui/x-date-pickers/DesktopTimePicker';
import { LocalizationProvider } from '../../LocalizationProvider/index.js';
import { ThemeProvider } from '../index.js';

// Every MUI / MUI X icon slot that Tecton 0.11.2 leaves on a Material SVG icon gets a Tecton icon
// from the theme (styles/tecton/compatIcons.ts): no Material icon renders.
const materialIcons = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('svg.MuiSvgIcon-root')).map(
    (svg) => svg.getAttribute('data-testid') ?? svg.outerHTML.slice(0, 60),
  );

const renderTecton = (ui: React.ReactElement) =>
  render(
    <ThemeProvider>
      <LocalizationProvider>{ui}</LocalizationProvider>
    </ThemeProvider>,
  );

describe('Tecton icons in MUI components', () => {
  it('pagination, table pagination, tabs scroll buttons and collapsed breadcrumbs', () => {
    const { container } = renderTecton(
      <>
        <Pagination count={10} showFirstButton showLastButton />
        <TablePagination
          component="div"
          count={100}
          page={1}
          rowsPerPage={10}
          onPageChange={() => {}}
          showFirstButton
          showLastButton
        />
        <Tabs value={0} variant="scrollable" scrollButtons allowScrollButtonsMobile>
          {Array.from({ length: 12 }, (_, i) => (
            <Tab key={i} label={`Tab ${i}`} />
          ))}
        </Tabs>
        <Breadcrumbs maxItems={2}>
          <Link href="#">One</Link>
          <Link href="#">Two</Link>
          <Link href="#">Three</Link>
          <Link href="#">Four</Link>
        </Breadcrumbs>
      </>,
    );
    expect(materialIcons(container)).toEqual([]);
    expect(
      container.querySelectorAll('.MuiPaginationItem-root [class*="tecton-chevron"]').length,
    ).toBeGreaterThan(0);
  });

  it('avatar fallback, alert close, speed dial and completed / error steps', () => {
    const { container } = renderTecton(
      <>
        <Avatar />
        <Alert onClose={() => {}}>Saved</Alert>
        <SpeedDial ariaLabel="Actions" icon={<SpeedDialIcon />} open={false} />
        <Stepper activeStep={2}>
          <Step completed>
            <StepLabel>Done</StepLabel>
          </Step>
          <Step>
            <StepLabel error>Failed</StepLabel>
          </Step>
          <Step>
            <StepLabel>Next</StepLabel>
          </Step>
        </Stepper>
      </>,
    );
    // The numbered circle of a step that is neither completed nor failed stays MUI's StepIcon.
    const icons = materialIcons(container).filter((id) => !id.includes('MuiSte'));
    expect(icons).toEqual([]);
    expect(container.querySelector('.MuiAvatar-root .tecton-person-outline')).not.toBeNull();
    expect(container.querySelector('.tecton-check-circle-filled.Mui-completed')).not.toBeNull();
    expect(container.querySelector('.tecton-warning-filled.Mui-error')).not.toBeNull();
  });

  it('date and time pickers: open, clear, view switch and month arrows', () => {
    const { container } = renderTecton(
      <>
        <DateCalendar />
        <DesktopDatePicker label="Date" slotProps={{ field: { clearable: true } }} />
        <DesktopTimePicker label="Time" />
      </>,
    );
    expect(materialIcons(container)).toEqual([]);
    expect(container.querySelector('.tecton-calendar-outline')).not.toBeNull();
    expect(container.querySelector('.tecton-history-outline')).not.toBeNull();
  });
});
