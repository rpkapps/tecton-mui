# Range pickers — support matrix

Tecton range pickers are an independent implementation built only on public MUI X Community APIs
(`DateCalendar` with custom `day` / `calendarHeader` slots, `PickerDay`, `PickersCalendarHeader`,
`MultiSectionDigitalClock`, `TimeClock`, `DateField` / `TimeField` / `DateTimeField`, the public
validators, `usePickerAdapter`, `usePickerTranslations`) and MUI Material (`Popper`, `Dialog`,
`Paper`, `TextField`, `Tabs`, `Chip`). Component and prop names follow the commercial MUI X range
pickers so that consumers can migrate, but no commercial code, package or documentation is used.
Behavior was verified with this library's own tests, not against the commercial package.

Status: **Supported** — works as documented here. **Partial** — works with the limitation noted.
**Not supported** — the prop is not implemented (TypeScript rejects it).

## Components

| Component                                                                                 | Status        | Notes                                                                                              |
| ----------------------------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------- |
| `DateRangePicker`, `TimeRangePicker`, `DateTimeRangePicker`                               | Supported     | Desktop when `desktopModeMediaQuery` (default `@media (pointer: fine)`) matches, mobile otherwise. |
| `Desktop*RangePicker`                                                                     | Supported     | Field + `Popper` (`role="dialog"`).                                                                |
| `Mobile*RangePicker`                                                                      | Supported     | Read-only field + modal `Dialog` with Cancel / OK.                                                 |
| `Static*RangePicker`                                                                      | Supported     | Inline, no field; `displayStaticWrapperAs` `'mobile'` (default) or `'desktop'`; Cancel / OK.       |
| `DateRangeCalendar`                                                                       | Supported     | One Community `DateCalendar` per month.                                                            |
| `SingleInputDateRangeField`, `SingleInputTimeRangeField`, `SingleInputDateTimeRangeField` | Partial       | Plain text input parsed with the adapter (`start – end`); no per-section keyboard editing.         |
| `MultiInputDateRangeField`                                                                | Supported     | Two Community `DateField`s (section editing included).                                             |
| `MultiInputTimeRangeField`, `MultiInputDateTimeRangeField`                                | Not supported | The internal factory supports them; not exported yet.                                              |
| `DateRangePickerDay`                                                                      | Partial       | Use `slots.day`; the component receives `PickerDayProps` plus `rangeState`.                        |

## Value and events

| Prop                                                                            | Status        | Notes                                                                                                        |
| ------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------ |
| `value`, `defaultValue` (`DateRange<TDate>` = `[TDate \| null, TDate \| null]`) | Supported     | Any adapter from `LocalizationProvider`; native `Date` by default.                                           |
| `onChange(value, { validationError, shortcut })`                                | Supported     | Fired for field typing, view selection, shortcuts, clear and cancel.                                         |
| `onAccept(value, context)`                                                      | Supported     | Fired when a value is committed and differs from the last committed one. Field typing alone does not commit. |
| `onError(error, value)`                                                         | Supported     | Per-endpoint errors, plus `invalidRange` on both when start > end.                                           |
| `open`, `onOpen`, `onClose`                                                     | Supported     |                                                                                                              |
| `closeOnSelect`                                                                 | Supported     | Default `true` desktop, `false` mobile and static (commit with OK, as in the Community pickers).             |
| `rangePosition`, `defaultRangePosition`, `onRangePositionChange`                | Supported     |                                                                                                              |
| `referenceDate`                                                                 | Supported     | Initial month and default time of new endpoints.                                                             |
| `timezone`                                                                      | Not supported | Values use the adapter's default timezone.                                                                   |
| `onSelectedSectionsChange`, `selectedSections`                                  | Not supported |                                                                                                              |
| `disableDragEditing` / drag to move an endpoint                                 | Not supported | Endpoints change by clicking.                                                                                |
| `availableRangePositions`                                                       | Not supported |                                                                                                              |

## Calendar (date and date-time ranges)

| Prop                                                                                                                                                   | Status        | Notes                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `calendars` (1–3)                                                                                                                                      | Supported     | Default 2 on desktop date ranges, 1 on mobile and on date-time ranges.                                                                |
| `currentMonthCalendarPosition`                                                                                                                         | Supported     | Used when there is no value.                                                                                                          |
| `disableAutoMonthSwitching`                                                                                                                            | Supported     | Without it the months follow a value changed from outside.                                                                            |
| `minDate`, `maxDate`, `disablePast`, `disableFuture`                                                                                                   | Supported     |                                                                                                                                       |
| `shouldDisableDate(day, position)`                                                                                                                     | Supported     | `position` is the endpoint being edited (calendar) or validated (value).                                                              |
| `shouldDisableMonth`, `shouldDisableYear`                                                                                                              | Not supported |                                                                                                                                       |
| `disableHighlightToday`, `displayWeekNumber`, `fixedWeekNumber`, `dayOfWeekFormatter`, `reduceAnimations`, `loading`, `renderLoading`, `onMonthChange` | Supported     | Passed to every `DateCalendar`.                                                                                                       |
| `showDaysOutsideCurrentMonth`                                                                                                                          | Partial       | Only with `calendars={1}`.                                                                                                            |
| Hover / focus preview of the resulting range                                                                                                           | Supported     | Dashed outline.                                                                                                                       |
| Keyboard navigation                                                                                                                                    | Partial       | Inherited from `DateCalendar`; moving past the last day of a month shifts all calendars instead of moving focus to the next calendar. |
| Month / year views, `views`, `openTo`                                                                                                                  | Not supported | Day view only.                                                                                                                        |

## Time (time and date-time ranges)

| Prop                                                                                                         | Status        | Notes                                              |
| ------------------------------------------------------------------------------------------------------------ | ------------- | -------------------------------------------------- |
| `ampm`                                                                                                       | Supported     | Defaults to the locale's hour cycle.               |
| `ampmInClock`                                                                                                | Supported     | Mobile analog clock.                               |
| `views` (`hours`, `minutes`, `seconds`)                                                                      | Supported     |                                                    |
| `timeSteps`, `minutesStep`, `skipDisabled`                                                                   | Supported     |                                                    |
| `minTime`, `maxTime`, `shouldDisableTime(value, view, position)`, `disableIgnoringDatePartForTimeValidation` | Supported     |                                                    |
| `minDateTime`, `maxDateTime`                                                                                 | Supported     | Date-time ranges.                                  |
| `thresholdToRenderTimeInASingleColumn`, `timeStep` (single-column digital clock)                             | Not supported | Always the multi-section digital clock on desktop. |

## Field and presentation

| Prop                                                                                                                                                                          | Status        | Notes                                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`, `format`, `name`, `disabled`, `readOnly`, `className`, `sx`, `inputRef`, `autoFocus`                                                                                 | Supported     |                                                                                                                                                                               |
| `localeText={{ start, end, toolbarTitle, okButtonLabel, cancelButtonLabel, clearButtonLabel, todayButtonLabel }}`                                                             | Supported     | Other texts come from the `LocalizationProvider` locale.                                                                                                                      |
| `slots.field`                                                                                                                                                                 | Supported     | Single input by default; `MultiInputDateRangeField` or a custom field.                                                                                                        |
| `slots.openPickerIcon`, `slots.day`                                                                                                                                           | Supported     | Open icon defaults to the theme's `MuiDatePicker` / `MuiTimePicker` icon.                                                                                                     |
| `slotProps.field`, `slotProps.textField`, `slotProps.openPickerButton`, `slotProps.popper`, `slotProps.desktopPaper`, `slotProps.dialog`, `slotProps.day`, `slotProps.layout` | Supported     |                                                                                                                                                                               |
| `slotProps.actionBar.actions` (`clear`, `cancel`, `accept`, `today`)                                                                                                          | Supported     | `nextOrAccept` is not supported.                                                                                                                                              |
| `slotProps.shortcuts.items`                                                                                                                                                   | Supported     | Chips; items whose range fails validation are disabled. `changeImportance` is not supported (shortcuts always commit).                                                        |
| `slotProps.toolbar.hidden`, `slotProps.toolbar.toolbarFormat`                                                                                                                 | Supported     | Toolbar shown on mobile/static and on desktop date-time ranges. `toolbarFormat` defaults to `shortDate` for date ranges, the field format otherwise.                          |
| Other slots (`layout`, `toolbar`, `actionBar`, `shortcuts`, `tabs`, `previousIconButton`, …)                                                                                  | Not supported | Customize through `slotProps`.                                                                                                                                                |
| Theme `defaultProps` under `Mui<ComponentName>`                                                                                                                               | Supported     | Not in the theme TypeScript augmentation.                                                                                                                                     |
| Theme `styleOverrides` for `MuiDateRangePickerDay` etc.                                                                                                                       | Not supported | Style with the `Tecton*` classes below; Community overrides (`MuiPickerDay`, `MuiPickersCalendarHeader`, `MuiDayCalendar`, `MuiMultiSectionDigitalClock`, …) apply unchanged. |

CSS classes: `TectonDateRangeCalendar-root|calendar|divider`, `TectonDateRangePickerDay-root|rangeStart|rangeEnd|inRange|startBand|endBand|previewStart|previewEnd|inPreview|rowStart|rowEnd`, `TectonRangePickerLayout-root|toolbar|contentWrapper|shortcuts|actionBar`.

## Accessibility

- Day cells keep the Community grid semantics; range endpoints and in-range days have `aria-selected="true"`.
- Desktop popup: `role="dialog"` labelled by the field label; focus moves into the view on open, Escape
  closes and returns focus to the open button.
- Mobile: modal `Dialog` labelled by the toolbar title; Escape or the backdrop cancels.
- Toolbar endpoint buttons use `aria-pressed`; mobile time and date-time views use tabs.

## Performance

Range highlight lives in a small external store read with `useSyncExternalStore`; each day cell
selects a primitive bit mask, so hovering re-renders only the cells whose highlight changes.
Calendar slots are module-level constants and day cells are memoized. Tests lock this in
(`DateRangeCalendar/tests`, "re-render budget").
