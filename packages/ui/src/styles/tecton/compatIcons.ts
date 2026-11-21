// Tecton icons for the MUI icon slots that Tecton 0.11.2 leaves on Material SVG icons. Every
// MUI and MUI X component that draws its own icon gets a Tecton icon from the theme, so no
// Material icon renders anywhere. Part of the documented compat layer (see compat.ts).
import * as React from 'react';
import { useTheme, type ThemeOptions } from '@mui/material/styles';
import StepIcon, { type StepIconProps } from '@mui/material/StepIcon';

type Slot = React.FC<Record<string, unknown>>;

// Strips the SvgIcon / MUI X slot props that must not reach a <span>.
function spanProps({
  ownerState: _ownerState,
  fontSize: _fontSize,
  titleAccess: _titleAccess,
  htmlColor: _htmlColor,
  ...props
}: Record<string, unknown>) {
  return props;
}

/**
 * A Tecton glyph as an icon slot. Unlike Tecton's own `slotIcon`, SvgIcon props do not reach the
 * DOM, and `titleAccess` (e.g. the DataGrid's "yes" / "no" on boolean cells) becomes the accessible
 * name instead of being dropped.
 */
function tectonIcon(glyph: string): Slot {
  const Comp: Slot = (props) => {
    const title = props.titleAccess as string | undefined;
    return React.createElement('span', {
      ...spanProps(props),
      className: [glyph, props.className].filter(Boolean).join(' '),
      ...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true }),
      ...(props.htmlColor
        ? { style: { color: props.htmlColor as string, ...(props.style as object | undefined) } }
        : null),
    });
  };
  Comp.displayName = 'TectonSlotIcon';
  return Comp;
}

/** Two Tecton chevrons (« / »): first / last page. Tecton has no first/last page glyph. */
function doubleChevron(direction: 'left' | 'right'): Slot {
  const Comp: Slot = (props) =>
    React.createElement(
      'span',
      {
        ...spanProps(props),
        'aria-hidden': true,
        style: {
          display: 'inline-flex',
          width: '1em',
          height: '1em',
          ...(props.style as object | undefined),
        },
      },
      React.createElement('span', {
        className: `tecton-chevron-${direction}-small-outline`,
        style: { marginInlineEnd: '-0.5em' },
      }),
      React.createElement('span', { className: `tecton-chevron-${direction}-small-outline` }),
    );
  Comp.displayName = 'TectonSlotIcon';
  return Comp;
}

/** Tecton's vertical "more" glyph turned on its side (Tecton has no horizontal one). */
const MoreHorizIcon: Slot = (props) =>
  React.createElement('span', {
    ...spanProps(props),
    className: ['tecton-more-vert-outline', props.className].filter(Boolean).join(' '),
    'aria-hidden': true,
    style: { transform: 'rotate(90deg)', ...(props.style as object | undefined) },
  });
MoreHorizIcon.displayName = 'TectonSlotIcon';

/** Avatar fallback: Tecton person glyph at MUI's 75% of the avatar. */
const AvatarFallbackIcon: Slot = (props) =>
  React.createElement('span', {
    ...spanProps(props),
    className: ['tecton-person-outline', props.className].filter(Boolean).join(' '),
    'aria-hidden': true,
    style: { width: '75%', height: '75%', ...(props.style as object | undefined) },
  });
AvatarFallbackIcon.displayName = 'TectonSlotIcon';

/**
 * DataGrid column separator, drawn as MUI X 9 draws it without the Material SVG: a 1px bar the
 * height of the 24px icon box, which widens to a 3px rounded bar on hover, while resizing and on
 * touch devices (CSS in compat.ts, `.TectonDataGrid-separatorBar`).
 */
const ColumnSeparatorIcon: Slot = (props) =>
  React.createElement(
    'span',
    {
      ...spanProps(props),
      'aria-hidden': true,
      style: {
        display: 'inline-flex',
        justifyContent: 'center',
        flexShrink: 0,
        width: '1.5rem',
        height: '1.5rem',
        ...(props.style as object | undefined),
      },
    },
    React.createElement('span', { className: 'TectonDataGrid-separatorBar' }),
  );
ColumnSeparatorIcon.displayName = 'TectonSlotIcon';

/**
 * Step icon: Tecton check / warning glyphs for completed and error steps (Tecton has no Stepper
 * styles; MUI draws Material's CheckCircle and Warning). Other steps keep MUI's numbered circle.
 */
function TectonStepIcon(props: StepIconProps) {
  const theme = useTheme();
  const { completed, error, className, active: _active, icon: _icon, ...other } = props;
  if (!completed && !error) return React.createElement(StepIcon, props);
  return React.createElement('span', {
    ...other,
    'aria-hidden': true,
    className: [
      'MuiStepIcon-root',
      error ? 'Mui-error tecton-warning-filled' : 'Mui-completed tecton-check-circle-filled',
      className,
    ]
      .filter(Boolean)
      .join(' '),
    style: {
      // MUI's StepIcon: 24px, primary when completed, error.main on error.
      fontSize: '1.5rem',
      color: error ? theme.palette.error.main : theme.palette.primary.main,
    },
  });
}

const CALENDAR = tectonIcon('tecton-calendar-outline');
// Tecton has no clock glyph; `history` is its clock face.
const CLOCK = tectonIcon('tecton-history-outline');
const CLEAR = tectonIcon('tecton-close-small-outline');
const CHEVRON_DOWN = tectonIcon('tecton-chevron-down-outline');
const CHEVRON_LEFT = tectonIcon('tecton-chevron-left-outline');
const CHEVRON_RIGHT = tectonIcon('tecton-chevron-right-outline');

const datePickers = [
  'MuiDatePicker',
  'MuiDesktopDatePicker',
  'MuiMobileDatePicker',
  'MuiDateTimePicker',
  'MuiDesktopDateTimePicker',
  'MuiMobileDateTimePicker',
];
const timePickers = ['MuiTimePicker', 'MuiDesktopTimePicker', 'MuiMobileTimePicker'];
const fields = ['MuiDateField', 'MuiTimeField', 'MuiDateTimeField'];

const pickerSlots = Object.fromEntries([
  ...datePickers.map((name) => [
    name,
    { defaultProps: { slots: { openPickerIcon: CALENDAR, clearIcon: CLEAR } } },
  ]),
  ...timePickers.map((name) => [
    name,
    { defaultProps: { slots: { openPickerIcon: CLOCK, clearIcon: CLEAR } } },
  ]),
  ...fields.map((name) => [name, { defaultProps: { slots: { clearIcon: CLEAR } } }]),
]);

/** Exported for the range pickers, which render the same open-picker icons. */
export const tectonPickerIcons = { calendar: CALENDAR, clock: CLOCK } as const;

export const iconCompatOverrides: NonNullable<ThemeOptions['components']> = {
  ...(pickerSlots as NonNullable<ThemeOptions['components']>),
  MuiPickersCalendarHeader: { defaultProps: { slots: { switchViewIcon: CHEVRON_DOWN } } },
  MuiPickersArrowSwitcher: {
    defaultProps: { slots: { leftArrowIcon: CHEVRON_LEFT, rightArrowIcon: CHEVRON_RIGHT } },
  },
  MuiDateTimePickerTabs: {
    defaultProps: {
      dateIcon: React.createElement(CALENDAR),
      timeIcon: React.createElement(CLOCK),
    },
  },
  MuiPaginationItem: {
    defaultProps: {
      slots: {
        first: doubleChevron('left'),
        last: doubleChevron('right'),
        previous: CHEVRON_LEFT,
        next: CHEVRON_RIGHT,
      },
    },
  },
  MuiTabs: {
    defaultProps: {
      slots: { startScrollButtonIcon: CHEVRON_LEFT, endScrollButtonIcon: CHEVRON_RIGHT },
    },
  },
  MuiBreadcrumbs: { defaultProps: { slots: { CollapsedIcon: MoreHorizIcon } } },
  MuiAvatar: { defaultProps: { slots: { fallback: AvatarFallbackIcon } } },
  MuiStepLabel: { defaultProps: { slots: { stepIcon: TectonStepIcon } } },
  MuiAlert: { defaultProps: { slots: { closeIcon: tectonIcon('tecton-close-outline') } } },
  MuiSpeedDialIcon: {
    defaultProps: {
      // SpeedDialIcon clones the icon with its own className, which would replace a plain span's
      // glyph class; the slot component merges the classes.
      icon: React.createElement(tectonIcon('tecton-add-outline')),
    },
    styleOverrides: {
      // MUI's SpeedDialIcon box is 24px; Tecton's Fab rule drew the glyph at 20px at the top of it
      // (2px above the button's centre). Fill the box, as MUI's 24px icon does.
      root: {
        '& [class*="tecton-"]': {
          display: 'block',
          fontSize: 'var(--tecton-icon-size-200)',
          width: 'var(--tecton-icon-size-200)',
          height: 'var(--tecton-icon-size-200)',
        },
      },
    },
  },
} as NonNullable<ThemeOptions['components']>;

/** DataGrid icon slots Tecton leaves on Material icons (merged into the grid's slots). */
export const gridIconSlots = {
  booleanCellTrueIcon: tectonIcon('tecton-check-outline'),
  booleanCellFalseIcon: tectonIcon('tecton-close-outline'),
  columnResizeIcon: ColumnSeparatorIcon,
};

/** TablePagination first / last page icons (Tecton maps only previous / next). */
export const tablePaginationFirstLast = {
  firstButtonIcon: doubleChevron('left'),
  lastButtonIcon: doubleChevron('right'),
};
