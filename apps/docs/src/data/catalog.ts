// Portal catalog: component taxonomy, authored component pages and generated "auto" pages.
// The taxonomy follows the familiar MUI grouping; the text is written for this portal.
import apiIndex from '../generated/api-index.json';
import { toSlug } from '../lib/slug';

export type CategoryId =
  | 'inputs'
  | 'data-display'
  | 'feedback'
  | 'surfaces'
  | 'navigation'
  | 'layout'
  | 'utilities'
  | 'lab'
  | 'data-grid'
  | 'date-time-pickers'
  | 'tree-view'
  | 'chat';

export interface Category {
  id: CategoryId;
  title: string;
  description: string;
}

export const categories: Category[] = [
  {
    id: 'inputs',
    title: 'Inputs',
    description: 'Controls that collect values or trigger actions: buttons, fields and selectors.',
  },
  {
    id: 'data-display',
    title: 'Data Display',
    description: 'Components that present information: text, lists, tables, icons and chips.',
  },
  {
    id: 'feedback',
    title: 'Feedback',
    description: 'Status messages, dialogs and progress indicators.',
  },
  {
    id: 'surfaces',
    title: 'Surfaces',
    description: 'Containers that group content: cards, accordions, paper and app bars.',
  },
  {
    id: 'navigation',
    title: 'Navigation',
    description: 'Moving between views: tabs, menus, breadcrumbs, drawers and steppers.',
  },
  {
    id: 'layout',
    title: 'Layout',
    description: 'Spacing and arrangement primitives: Box, Stack, Grid and Container.',
  },
  {
    id: 'utilities',
    title: 'Utilities',
    description: 'Behavioural building blocks: baselines, portals, popups and transitions.',
  },
  {
    id: 'lab',
    title: 'Lab',
    description: 'Components from @mui/lab. Their upstream APIs are not yet considered stable.',
  },
  {
    id: 'data-grid',
    title: 'Data Grid',
    description: 'The unified DataGrid: Community foundation plus independently built features.',
  },
  {
    id: 'date-time-pickers',
    title: 'Date & Time Pickers',
    description: 'Date, time and date-time pickers, calendars, clocks and fields.',
  },
  {
    id: 'tree-view',
    title: 'Tree View',
    description: 'Hierarchical lists: SimpleTreeView and the unified RichTreeView.',
  },
  {
    id: 'chat',
    title: 'Chat',
    description:
      'Conversational UI from MUI X Chat: ChatBox and its parts. The upstream API is alpha.',
  },
];

const group = (id: CategoryId, names: string) =>
  Object.fromEntries(names.split(/\s+/).map((n) => [n, id])) as Record<string, CategoryId>;

/** Category of every exported component (unlisted components fall back to Utilities). */
export const componentCategory: Record<string, CategoryId> = {
  ...group(
    'inputs',
    'ActionBar Autocomplete Button ButtonBase ButtonGroup Checkbox ColorSwatchControl Fab FilledInput FormControl FormControlLabel FormGroup FormHelperText FormLabel IconButton Input InputAdornment InputBase InputLabel NativeSelect NumberField NumberRangeSlider NumberSlider NumberSpinner OutlinedInput Radio RadioGroup Rating Select Slider Switch TextField TextareaAutosize ToggleButton ToggleButtonGroup',
  ),
  ...group(
    'data-display',
    'Avatar AvatarGroup Badge Chip Divider Icon SvgIcon List ListItem ListItemAvatar ListItemButton ListItemIcon ListItemSecondaryAction ListItemText ListSubheader Table TableBody TableCell TableContainer TableFooter TableHead TablePagination TablePaginationActions TableRow TableSortLabel Tooltip Typography',
  ),
  ...group(
    'feedback',
    'Alert AlertTitle Backdrop CircularProgress Dialog DialogActions DialogContent DialogContentText DialogTitle LinearProgress Skeleton Snackbar SnackbarContent',
  ),
  ...group(
    'surfaces',
    'Accordion AccordionActions AccordionDetails AccordionSummary AppBar Toolbar Card CardActionArea CardActions CardContent CardHeader CardMedia Paper',
  ),
  ...group(
    'navigation',
    'BottomNavigation BottomNavigationAction Breadcrumbs Drawer SwipeableDrawer Link Menu MenuItem MenuList Menubar MobileStepper Pagination PaginationItem SpeedDial SpeedDialAction SpeedDialIcon Stepper Step StepButton StepConnector StepContent StepIcon StepLabel Tabs Tab TabScrollButton',
  ),
  ...group('layout', 'Box Container Grid Stack ImageList ImageListItem ImageListItemBar'),
  ...group(
    'utilities',
    'ClickAwayListener CssBaseline ScopedCssBaseline GlobalStyles InitColorSchemeScript Modal NoSsr Popover Popper Portal Unstable_TrapFocus Fade Grow Slide Zoom Collapse',
  ),
  ...group(
    'lab',
    'Masonry TabContext TabList TabPanel Timeline TimelineConnector TimelineContent TimelineDot TimelineItem TimelineOppositeContent TimelineSeparator',
  ),
  ...group(
    'date-time-pickers',
    'LocalizationProvider DateRangePicker DesktopDateRangePicker MobileDateRangePicker StaticDateRangePicker DateRangeCalendar TimeRangePicker DesktopTimeRangePicker MobileTimeRangePicker StaticTimeRangePicker DateTimeRangePicker DesktopDateTimeRangePicker MobileDateTimeRangePicker StaticDateTimeRangePicker SingleInputDateRangeField MultiInputDateRangeField SingleInputTimeRangeField SingleInputDateTimeRangeField DateCalendar DateField DatePicker DateTimeField DateTimePicker DayCalendarSkeleton DesktopDatePicker DesktopDateTimePicker DesktopTimePicker DigitalClock MobileDatePicker MobileDateTimePicker MobileTimePicker MonthCalendar MultiSectionDigitalClock PickerDay PickersActionBar PickersCalendarHeader PickersLayout PickersSectionList PickersShortcuts PickersTextField StaticDatePicker StaticDateTimePicker StaticTimePicker TimeClock TimeField TimePicker YearCalendar',
  ),
  ...group(
    'tree-view',
    'SimpleTreeView RichTreeView TreeItem TreeItemDragAndDropOverlay TreeItemIcon TreeItemLabelInput TreeItemLoader TreeItemProvider',
  ),
  ...group(
    'chat',
    'ChatBox ChatCodeBlock ChatComposer ChatConfirmation ChatConversation ChatConversationList ChatMessage ChatMessageError ChatMessageList ChatMessageSkeleton ChatMessageSources ChatSuggestions',
  ),
  DataGrid: 'data-grid',
};

export interface AuthoredPage {
  slug: string;
  title: string;
  category: CategoryId;
  /** Exports documented on the page; their API tables are rendered from generated data. */
  components: string[];
  summary: string;
  /**
   * Section anchor (heading id) that shows a documented export, used when the export's own URL
   * (`/components/<export-slug>`) redirects to this page. Defaults to the export's API section.
   */
  anchors?: Record<string, string>;
  /** Skeleton pages for features still being integrated (no live imports yet). */
  status?: 'integration-pending';
}

/** Hand-written component pages (`src/content/components/<slug>.mdx`). */
export const authoredPages: AuthoredPage[] = [
  // Inputs
  {
    slug: 'button',
    title: 'Button',
    category: 'inputs',
    components: ['Button', 'ButtonGroup'],
    summary: 'Triggers an action or event, such as submitting a form or opening a dialog.',
  },
  {
    slug: 'icon-button',
    title: 'Icon Button',
    category: 'inputs',
    components: ['IconButton'],
    summary: 'A compact button that shows only an icon, for toolbars and dense layouts.',
  },
  {
    slug: 'action-bar',
    title: 'Action Bar',
    category: 'inputs',
    components: [
      'ActionBar',
      'ActionBarGroup',
      'ActionBarButton',
      'ActionBarToolMenu',
      'ActionBarTool',
      'ActionBarSelect',
    ],
    summary:
      'A vertical tool palette for canvases and viewers: tools, tool sets and quick settings.',
  },
  {
    slug: 'text-field',
    title: 'Text Field',
    category: 'inputs',
    components: [
      'TextField',
      'OutlinedInput',
      'FilledInput',
      'InputBase',
      'InputAdornment',
      'FormHelperText',
    ],
    anchors: {
      OutlinedInput: 'components',
      FilledInput: 'components',
      InputBase: 'customization',
      InputAdornment: 'input-adornments',
      FormHelperText: 'components',
    },
    summary: 'Single- and multi-line text entry with label, helper text and validation state.',
  },
  {
    slug: 'input',
    title: 'Input',
    category: 'inputs',
    components: ['Input'],
    summary: 'The underlined text input that TextField composes for its standard variant.',
  },
  {
    slug: 'number-field',
    title: 'Number Field',
    category: 'inputs',
    components: ['NumberField', 'NumberSpinner', 'NumberSlider', 'NumberRangeSlider'],
    summary:
      'Numeric entry with stepper buttons or a drag bar, keyboard stepping, limits and locale formatting.',
  },
  {
    slug: 'color-swatch',
    title: 'Color Swatch',
    category: 'inputs',
    components: ['ColorSwatchControl'],
    summary: 'Shows a color beside its hex value and opens the color picker to change it.',
  },
  {
    slug: 'select',
    title: 'Select',
    category: 'inputs',
    components: ['Select', 'MenuItem', 'FormControl', 'InputLabel'],
    summary: 'Choose one or several values from a list presented in a popup menu.',
  },
  {
    slug: 'native-select',
    title: 'Native Select',
    category: 'inputs',
    components: ['NativeSelect'],
    summary: "A styled native <select> that opens the platform's own option picker.",
  },
  {
    slug: 'checkbox',
    title: 'Checkbox',
    category: 'inputs',
    components: ['Checkbox', 'FormControlLabel', 'FormGroup'],
    summary: 'Toggle an option on or off, or select several options from a set.',
  },
  {
    slug: 'radio',
    title: 'Radio Group',
    category: 'inputs',
    components: ['Radio', 'RadioGroup', 'FormLabel'],
    anchors: { FormLabel: 'radio-group' },
    summary: 'Select exactly one option from a small, visible set.',
  },
  {
    slug: 'switch',
    title: 'Switch',
    category: 'inputs',
    components: ['Switch'],
    summary: 'Turn a single setting on or off with an immediate effect.',
  },
  {
    slug: 'slider',
    title: 'Slider',
    category: 'inputs',
    components: ['Slider'],
    summary: 'Pick a number or a range from a continuous or stepped scale.',
  },
  {
    slug: 'autocomplete',
    title: 'Autocomplete',
    category: 'inputs',
    components: ['Autocomplete'],
    summary: 'A text input that suggests and filters options as the user types.',
  },
  {
    slug: 'toggle-button',
    title: 'Toggle Button',
    category: 'inputs',
    components: ['ToggleButton', 'ToggleButtonGroup'],
    anchors: { ToggleButtonGroup: 'exclusive-selection' },
    summary: 'Group related options and show which of them are on.',
  },
  {
    slug: 'transfer-list',
    title: 'Transfer List',
    category: 'inputs',
    // A pattern built from List, Checkbox and Button; their API is on their own pages.
    components: [],
    summary: 'Move items between two lists, for example to choose the columns of a report.',
  },
  {
    slug: 'button-base',
    title: 'Button Base',
    category: 'inputs',
    components: ['ButtonBase'],
    summary: 'The unstyled, accessible base of every button: focus, ripple and keyboard handling.',
  },
  // Data display
  {
    slug: 'chip',
    title: 'Chip',
    category: 'data-display',
    components: ['Chip'],
    summary: 'Compact elements that represent an attribute, filter, entity or action.',
  },
  {
    slug: 'avatar',
    title: 'Avatar',
    category: 'data-display',
    components: ['Avatar', 'AvatarGroup'],
    summary: 'A picture, initials or icon that represents a person or entity.',
  },
  {
    slug: 'badge',
    title: 'Badge',
    category: 'data-display',
    components: ['Badge'],
    summary: 'A small count or status dot attached to another element.',
  },
  {
    slug: 'tooltip',
    title: 'Tooltip',
    category: 'data-display',
    components: ['Tooltip'],
    summary: 'A short text label that appears when an element is hovered or focused.',
  },
  {
    slug: 'typography',
    title: 'Typography',
    category: 'data-display',
    components: ['Typography'],
    summary: 'Renders text using the Tecton type scale (Figtree and IBM Plex Mono).',
  },
  {
    slug: 'icon',
    title: 'Icon',
    category: 'data-display',
    components: ['Icon'],
    summary: 'Tecton icons with a typed name, two variants and the Tecton size steps.',
  },
  {
    slug: 'list',
    title: 'List',
    category: 'data-display',
    components: [
      'List',
      'ListItem',
      'ListItemButton',
      'ListItemIcon',
      'ListItemText',
      'ListItemAvatar',
      'ListSubheader',
      'ListItemSecondaryAction',
    ],
    anchors: {
      ListItemAvatar: 'folder-list',
      ListSubheader: 'sticky-subheader',
      ListItemSecondaryAction: 'secondary-action-wrapper',
    },
    summary: 'Vertical collections of text, icons and actions.',
  },
  {
    slug: 'table',
    title: 'Table',
    category: 'data-display',
    components: [
      'Table',
      'TableContainer',
      'TableHead',
      'TableBody',
      'TableRow',
      'TableCell',
      'TableFooter',
      'TablePagination',
      'TablePaginationActions',
      'TableSortLabel',
    ],
    anchors: {
      TableFooter: 'custom-pagination-actions',
      TablePagination: 'pagination',
      TablePaginationActions: 'composing-the-pagination-actions',
      TableSortLabel: 'sorting-selecting',
    },
    summary: 'Static tabular data. For sorting, filtering and large data sets use the Data Grid.',
  },
  // Feedback
  {
    slug: 'alert',
    title: 'Alert',
    category: 'feedback',
    components: ['Alert', 'AlertTitle'],
    summary: 'A prominent message that communicates a status without interrupting the task.',
  },
  {
    slug: 'snackbar',
    title: 'Snackbar',
    category: 'feedback',
    components: ['Snackbar', 'SnackbarContent'],
    anchors: { SnackbarContent: 'content' },
    summary: 'A brief, temporary notification about an operation that just happened.',
  },
  {
    slug: 'dialog',
    title: 'Dialog',
    category: 'feedback',
    components: ['Dialog', 'DialogTitle', 'DialogContent', 'DialogContentText', 'DialogActions'],
    summary: 'A modal window for decisions or focused tasks that require attention.',
  },
  {
    slug: 'progress',
    title: 'Progress',
    category: 'feedback',
    components: ['CircularProgress', 'LinearProgress'],
    summary: 'Indicators for loading and for operations with known or unknown duration.',
  },
  {
    slug: 'backdrop',
    title: 'Backdrop',
    category: 'feedback',
    components: ['Backdrop'],
    summary: 'A dimmed layer that covers the page or a region to signal a blocking state.',
  },
  // Surfaces
  {
    slug: 'card',
    title: 'Card',
    category: 'surfaces',
    components: ['Card', 'CardHeader', 'CardContent', 'CardActions', 'CardMedia', 'CardActionArea'],
    anchors: { CardMedia: 'media', CardActionArea: 'primary-action' },
    summary: 'A self-contained surface for content and actions about a single subject.',
  },
  {
    slug: 'accordion',
    title: 'Accordion',
    category: 'surfaces',
    components: ['Accordion', 'AccordionSummary', 'AccordionDetails', 'AccordionActions'],
    anchors: { AccordionActions: 'introduction' },
    summary: 'Collapsible sections that let users show and hide related content.',
  },
  {
    slug: 'app-bar',
    title: 'App Bar',
    category: 'surfaces',
    components: ['AppBar', 'AppBarBrand', 'AppBarTabs', 'AppBarTab', 'AppBarActions'],
    summary: 'The Tecton App Bar: branding, the tabs people switch between and your actions.',
  },
  {
    slug: 'heading',
    title: 'Heading',
    category: 'surfaces',
    components: ['Heading', 'HeadingTitle', 'HeadingTabs', 'HeadingActions'],
    summary: "The Tecton page heading: the page's title, its section tabs and its actions.",
  },
  // Navigation
  {
    slug: 'tabs',
    title: 'Tabs',
    category: 'navigation',
    components: ['Tabs', 'Tab', 'TabScrollButton'],
    anchors: { TabScrollButton: 'scroll-buttons' },
    summary: 'Switch between related views at the same level of hierarchy.',
  },
  {
    slug: 'bottom-navigation',
    title: 'Bottom Navigation',
    category: 'navigation',
    components: ['BottomNavigation', 'BottomNavigationAction'],
    anchors: { BottomNavigationAction: 'bottom-navigation-with-no-label' },
    summary: 'Switch between three to five top-level destinations on a small screen.',
  },
  {
    slug: 'drawer',
    title: 'Drawer',
    category: 'navigation',
    components: ['Drawer', 'SwipeableDrawer'],
    anchors: { SwipeableDrawer: 'swipeable' },
    summary: 'A panel that slides in from a screen edge for navigation or supplementary content.',
  },
  {
    slug: 'speed-dial',
    title: 'Speed Dial',
    category: 'navigation',
    components: ['SpeedDial', 'SpeedDialAction', 'SpeedDialIcon'],
    anchors: { SpeedDialAction: 'basic-speed-dial', SpeedDialIcon: 'custom-close-icon' },
    summary: 'A floating action button that reveals up to six related actions.',
  },
  {
    slug: 'stepper',
    title: 'Stepper',
    category: 'navigation',
    components: [
      'Stepper',
      'Step',
      'StepLabel',
      'StepButton',
      'StepContent',
      'StepIcon',
      'StepConnector',
    ],
    anchors: {
      Step: 'horizontal-stepper',
      StepLabel: 'linear',
      StepButton: 'non-linear',
      StepContent: 'vertical-stepper',
      StepIcon: 'customized-horizontal-stepper',
      StepConnector: 'customized-horizontal-stepper',
    },
    summary: 'Show progress through a numbered sequence of logical steps.',
  },
  {
    slug: 'breadcrumbs',
    title: 'Breadcrumbs',
    category: 'navigation',
    components: ['Breadcrumbs'],
    summary: 'Show the location of the current page within a hierarchy.',
  },
  {
    slug: 'menu',
    title: 'Menu',
    category: 'navigation',
    components: ['Menu', 'MenuList'],
    summary: 'A temporary list of choices anchored to the element that opened it.',
  },
  {
    slug: 'menubar',
    title: 'Menubar',
    category: 'navigation',
    components: [
      'Menubar',
      'MenubarMenu',
      'MenubarTrigger',
      'MenubarPortal',
      'MenubarPositioner',
      'MenubarPopup',
      'MenubarItem',
      'MenubarSubmenu',
      'MenubarSubmenuTrigger',
      'MenubarCheckboxItem',
      'MenubarRadioGroup',
      'MenubarRadioItem',
      'MenubarGroup',
      'MenubarGroupLabel',
      'MenubarSeparator',
    ],
    summary: 'A persistent row of application menus, as in desktop software (File, Edit, View).',
  },
  {
    slug: 'pagination',
    title: 'Pagination',
    category: 'navigation',
    components: ['Pagination', 'PaginationItem'],
    anchors: { PaginationItem: 'custom-icons' },
    summary: 'Move between pages of a long, divided result set.',
  },
  // Layout
  {
    slug: 'box',
    title: 'Box',
    category: 'layout',
    components: ['Box'],
    summary: 'A generic container with access to theme spacing and the `sx` prop.',
  },
  {
    slug: 'stack',
    title: 'Stack',
    category: 'layout',
    components: ['Stack'],
    summary: 'One-dimensional layout with consistent spacing between children.',
  },
  {
    slug: 'grid',
    title: 'Grid',
    category: 'layout',
    components: ['Grid'],
    summary: 'A responsive 12-column layout grid based on CSS flexbox.',
  },
  {
    slug: 'image-list',
    title: 'Image List',
    category: 'layout',
    components: ['ImageList', 'ImageListItem', 'ImageListItemBar'],
    anchors: {
      ImageListItem: 'standard-image-list',
      ImageListItemBar: 'image-list-with-title-bars',
    },
    summary: 'Display a collection of images in an organized grid.',
  },
  // Utilities
  {
    slug: 'css-baseline',
    title: 'CSS Baseline',
    category: 'utilities',
    components: ['CssBaseline', 'ScopedCssBaseline'],
    summary: 'The global (or scoped) CSS reset aligned with the Tecton theme.',
  },
  {
    slug: 'global-styles',
    title: 'Global Styles',
    category: 'utilities',
    components: ['GlobalStyles'],
    summary: 'Inject global CSS rules that are added on mount and removed on unmount.',
  },
  {
    slug: 'init-color-scheme-script',
    title: 'Init Color Scheme Script',
    category: 'utilities',
    components: ['InitColorSchemeScript'],
    summary: "Material UI's pre-paint color-scheme script, and Tecton's shared-mode equivalent.",
  },
  {
    slug: 'portal',
    title: 'Portal',
    category: 'utilities',
    components: ['Portal'],
    summary: 'Render children into another part of the DOM while keeping them in the React tree.',
  },
  {
    slug: 'unstable-trap-focus',
    title: 'Trap Focus',
    category: 'utilities',
    components: ['Unstable_TrapFocus'],
    summary: 'Keep keyboard focus inside a region while it is open, then restore it.',
  },
  {
    slug: 'transitions',
    title: 'Transitions',
    category: 'utilities',
    components: ['Collapse', 'Fade', 'Grow', 'Slide', 'Zoom'],
    anchors: {
      Collapse: 'collapse',
      Fade: 'fade',
      Grow: 'grow',
      Slide: 'slide',
      Zoom: 'zoom',
    },
    summary: 'Animate components in and out with the theme durations and easing curves.',
  },
  {
    slug: 'use-media-query',
    title: 'useMediaQuery',
    category: 'utilities',
    // A hook, not a component: no API table.
    components: [],
    summary: 'Read a CSS media query (breakpoint, color scheme, reduced motion) from React.',
  },
  // Lab
  {
    slug: 'timeline',
    title: 'Timeline',
    category: 'lab',
    components: [
      'Timeline',
      'TimelineItem',
      'TimelineSeparator',
      'TimelineConnector',
      'TimelineContent',
      'TimelineDot',
      'TimelineOppositeContent',
    ],
    summary: 'A vertical sequence of events, optionally with timestamps on the opposite side.',
  },
  {
    slug: 'masonry',
    title: 'Masonry',
    category: 'lab',
    components: ['Masonry'],
    summary: 'Arranges items of varying height into columns with minimal gaps.',
  },
  {
    slug: 'tab-context',
    title: 'Tab Context',
    category: 'lab',
    components: ['TabContext', 'TabList', 'TabPanel'],
    summary: 'Wires Tabs and their panels together with accessible ids automatically.',
  },
  // Data Grid
  {
    slug: 'data-grid',
    title: 'Data Grid',
    category: 'data-grid',
    components: ['DataGrid'],
    summary:
      'One DataGrid for tabular data, from simple lists to grouped, pinned and editable grids.',
  },
  // Date & Time Pickers
  {
    slug: 'date-picker',
    title: 'Date Picker',
    category: 'date-time-pickers',
    components: [
      'DatePicker',
      'DesktopDatePicker',
      'MobileDatePicker',
      'StaticDatePicker',
      'LocalizationProvider',
    ],
    anchors: {
      DesktopDatePicker: 'variants',
      MobileDatePicker: 'mobile-dialog',
      StaticDatePicker: 'static-calendar',
    },
    summary: 'Enter a date by typing or by choosing it from a calendar popup.',
  },
  {
    slug: 'time-picker',
    title: 'Time Picker',
    category: 'date-time-pickers',
    components: ['TimePicker', 'DesktopTimePicker', 'MobileTimePicker', 'StaticTimePicker'],
    anchors: {
      DesktopTimePicker: 'variants',
      MobileTimePicker: 'mobile-clock',
      StaticTimePicker: 'static-picker',
    },
    summary: 'Enter a time of day by typing or by choosing it from a clock or list.',
  },
  {
    slug: 'date-time-picker',
    title: 'Date Time Picker',
    category: 'date-time-pickers',
    components: [
      'DateTimePicker',
      'DesktopDateTimePicker',
      'MobileDateTimePicker',
      'StaticDateTimePicker',
    ],
    anchors: {
      DesktopDateTimePicker: 'variants',
      MobileDateTimePicker: 'mobile-dialog',
      StaticDateTimePicker: 'static-picker',
    },
    summary: 'Enter a date and a time of day in one field.',
  },
  {
    slug: 'date-calendar',
    title: 'Calendars',
    category: 'date-time-pickers',
    components: ['DateCalendar', 'MonthCalendar', 'YearCalendar', 'DayCalendarSkeleton'],
    anchors: { DayCalendarSkeleton: 'loading-data' },
    summary: 'Inline calendars for choosing a day, month or year without a text field.',
  },
  {
    slug: 'time-clock',
    title: 'Clocks',
    category: 'date-time-pickers',
    components: ['TimeClock', 'DigitalClock', 'MultiSectionDigitalClock'],
    summary: 'Inline time selection as an analog clock face or digital lists.',
  },
  {
    slug: 'date-field',
    title: 'Fields',
    category: 'date-time-pickers',
    components: [
      'DateField',
      'TimeField',
      'DateTimeField',
      'PickersTextField',
      'PickersSectionList',
    ],
    anchors: { PickersTextField: 'customizing-the-input', PickersSectionList: 'styling-sections' },
    summary: 'Keyboard-first date and time inputs without a popup.',
  },
  {
    slug: 'date-range-pickers',
    title: 'Range Pickers',
    category: 'date-time-pickers',
    components: [
      'DateRangePicker',
      'TimeRangePicker',
      'DateTimeRangePicker',
      'DesktopDateRangePicker',
      'MobileDateRangePicker',
      'StaticDateRangePicker',
      'DesktopTimeRangePicker',
      'MobileTimeRangePicker',
      'StaticTimeRangePicker',
      'DesktopDateTimeRangePicker',
      'MobileDateTimeRangePicker',
      'StaticDateTimeRangePicker',
      'DateRangeCalendar',
      'SingleInputDateRangeField',
      'MultiInputDateRangeField',
      'SingleInputTimeRangeField',
      'SingleInputDateTimeRangeField',
    ],
    anchors: {
      DesktopDateRangePicker: 'variants',
      MobileDateRangePicker: 'variants',
      StaticDateRangePicker: 'static-picker-with-shortcuts',
      DesktopTimeRangePicker: 'time-range-variants',
      MobileTimeRangePicker: 'time-range-variants',
      StaticTimeRangePicker: 'time-range-variants',
      DesktopDateTimeRangePicker: 'date-time-range-variants',
      MobileDateTimeRangePicker: 'date-time-range-variants',
      StaticDateTimeRangePicker: 'date-time-range-variants',
      SingleInputTimeRangeField: 'time-and-date-time-range-fields',
      SingleInputDateTimeRangeField: 'time-and-date-time-range-fields',
    },
    summary: 'Pick a start and end date, time or date-time in one component.',
  },
  {
    slug: 'picker-customization',
    title: 'Picker Customization',
    category: 'date-time-pickers',
    components: [
      'PickersActionBar',
      'PickersShortcuts',
      'PickersLayout',
      'PickersCalendarHeader',
      'PickerDay',
    ],
    anchors: {
      PickersActionBar: 'action-bar',
      PickersShortcuts: 'shortcuts',
      PickersLayout: 'layout',
      PickersCalendarHeader: 'calendar-header',
      PickerDay: 'days',
    },
    summary: 'Building blocks of the picker popup: action bar, shortcuts, layout, header and days.',
  },
  // Tree View
  {
    slug: 'simple-tree-view',
    title: 'Simple Tree View',
    category: 'tree-view',
    components: ['SimpleTreeView', 'TreeItem', 'TreeItemProvider', 'TreeItemIcon'],
    anchors: { TreeItemProvider: 'custom-tree-items', TreeItemIcon: 'custom-tree-items' },
    summary: 'A hierarchy declared with JSX children: folders, outlines and nested navigation.',
  },
  {
    slug: 'rich-tree-view',
    title: 'Rich Tree View',
    category: 'tree-view',
    components: [
      'RichTreeView',
      'TreeItemLabelInput',
      'TreeItemLoader',
      'TreeItemDragAndDropOverlay',
    ],
    anchors: {
      TreeItemLabelInput: 'custom-label-input',
      TreeItemLoader: 'custom-loading-rows',
      TreeItemDragAndDropOverlay: 'custom-drop-indicator',
    },
    summary: 'A data-driven tree for large hierarchies, with selection, editing and reordering.',
  },
  // Chat
  {
    slug: 'chat',
    title: 'Chat',
    category: 'chat',
    components: ['ChatBox', 'ChatMessageList', 'ChatSuggestions'],
    anchors: {
      ChatMessageList: 'building-your-own-layout',
      ChatSuggestions: 'suggestions-and-empty-state',
    },
    summary: 'A complete chat surface: message thread, composer, conversations and suggestions.',
  },
  {
    slug: 'chat-composer',
    title: 'Chat Composer',
    category: 'chat',
    components: ['ChatComposer'],
    summary: 'The text area, attachments and send button, alone or inside a chat.',
  },
  {
    slug: 'chat-conversations',
    title: 'Chat Conversations',
    category: 'chat',
    components: ['ChatConversationList', 'ChatConversation'],
    anchors: { ChatConversation: 'header-actions' },
    summary: 'The list of conversations, unread counts and the header of the open conversation.',
  },
  {
    slug: 'chat-ai-agents',
    title: 'AI and Agents',
    category: 'chat',
    components: [],
    summary:
      'Streaming answers, reasoning, tool calls, tool approval and steps of an AI agent in a chat.',
  },
  {
    slug: 'chat-message',
    title: 'Chat Message',
    category: 'chat',
    components: ['ChatMessage'],
    summary: 'One message in the thread: text, reasoning, tool calls, files, actions and status.',
  },
  {
    slug: 'chat-message-error',
    title: 'Chat Message Error',
    category: 'chat',
    components: ['ChatMessageError'],
    summary: 'The error and Retry button under a message that could not be sent.',
  },
  {
    slug: 'chat-message-skeleton',
    title: 'Chat Message Skeleton',
    category: 'chat',
    components: ['ChatMessageSkeleton'],
    summary: 'Placeholder rows while messages load.',
  },
  {
    slug: 'chat-message-sources',
    title: 'Chat Message Sources',
    category: 'chat',
    components: ['ChatMessageSources'],
    summary: 'A numbered list of the sources an answer is based on.',
  },
  {
    slug: 'chat-code-block',
    title: 'Chat Code Block',
    category: 'chat',
    components: ['ChatCodeBlock'],
    summary: 'Code with a language label and a copy button, as messages render it.',
  },
  {
    slug: 'chat-confirmation',
    title: 'Chat Confirmation',
    category: 'chat',
    components: ['ChatConfirmation'],
    summary: 'A question with confirm and cancel buttons, for actions that need consent.',
  },
];

export interface ApiEntry {
  name: string;
  package: string;
  exportName: string;
  hasDefault: boolean;
  rootExport: boolean;
  propCount: number;
}

export const apiEntries: ApiEntry[] = apiIndex.components;
export const muiVersions: Record<string, string> = apiIndex.versions;

const apiByName = new Map(apiEntries.map((e) => [e.name, e]));
export const getApiEntry = (name: string) => apiByName.get(name);
export const getApiEntryBySlug = (slug: string) => apiEntries.find((e) => toSlug(e.name) === slug);

export interface ComponentPageRef {
  slug: string;
  title: string;
  category: CategoryId;
  summary: string;
  components: string[];
  kind: 'authored' | 'auto';
  anchors?: Record<string, string>;
  status?: 'integration-pending';
}

const covered = new Set(authoredPages.flatMap((p) => p.components));
const authoredSlugs = new Set(authoredPages.map((p) => p.slug));

/** One lightweight generated page per exported component that has no authored page. */
export const autoPages: ComponentPageRef[] = apiEntries
  .filter((e) => !covered.has(e.name) && !authoredSlugs.has(toSlug(e.name)))
  .map((e) => ({
    slug: toSlug(e.name),
    title: e.name,
    category: componentCategory[e.name] ?? 'utilities',
    summary: '',
    components: [e.name],
    kind: 'auto' as const,
  }));

export const componentPages: ComponentPageRef[] = [
  ...authoredPages.map((p) => ({ ...p, kind: 'authored' as const })),
  ...autoPages,
];

const pageBySlug = new Map(componentPages.map((p) => [p.slug, p]));
export const getComponentPage = (slug: string) => pageBySlug.get(slug);

/** The component page that documents an export (authored page first). */
export function pageForComponent(name: string): ComponentPageRef | undefined {
  const authored = componentPages.filter((p) => p.kind === 'authored');
  return (
    authored.find((p) => p.components[0] === name) ??
    authored.find((p) => p.components.includes(name)) ??
    pageBySlug.get(toSlug(name))
  );
}

export function pagesInCategory(id: CategoryId): ComponentPageRef[] {
  return componentPages.filter((p) => p.category === id);
}
