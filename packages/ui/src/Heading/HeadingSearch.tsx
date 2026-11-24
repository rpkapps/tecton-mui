'use client';
// The heading's search: a Search icon button that opens into a search field in place. Neither the
// Tecton Storybook nor Figma draws the open field, so it is composed from the heading's own parts:
// the filled input of its selects, the Tecton search glyph and a clear button.
//
// - The field only closes empty (on Escape or when focus leaves it), so a search in progress
//   stays on show. Escape clears the field first, then closes it and gives the focus back to the
//   button.
// - In a `HeadingActions` row, an open field keeps its place: the other actions collapse around it.
//   In the overflow tray, it opens in the tray.
import * as React from 'react';
import clsx from 'clsx';
import FilledInput, { type FilledInputProps } from '@mui/material/FilledInput';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { keyframes, styled, type SxProps, type Theme } from '@mui/material/styles';
import useControlled from '@mui/utils/useControlled';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import useForkRef from '@mui/utils/useForkRef';
import { cssVar } from '../styles/tecton/index.js';
import { headingClasses } from './Heading.js';
import { GROWING_ATTRIBUTE } from '../internal/overflow/growth.js';
import {
  OverflowItemContext,
  type OverflowPriorityMarker,
} from '../internal/overflow/useCollapsingItems.js';

export type HeadingSearchCloseReason = 'escapeKeyDown' | 'blur';

export interface HeadingSearchProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue' | 'children'
> {
  /** The search text (controlled). */
  value?: string;
  /** The search text at first (uncontrolled). */
  defaultValue?: string;
  /** Called with the new text as the user types or clears the field. */
  onChange?: (event: React.SyntheticEvent, value: string) => void;
  /**
   * The accessible name of the button, the field and its search landmark.
   * @default 'Search'
   */
  label?: string;
  /**
   * The field's placeholder.
   * @default the `label`
   */
  placeholder?: string;
  /**
   * The size of the Search button and of the field, as for the buttons and inputs next to it.
   * @default 'medium'
   */
  size?: 'small' | 'medium';
  /** The field is open (controlled). */
  open?: boolean;
  /**
   * The field is open at first (uncontrolled).
   * @default `true` when there is text to show, else `false`
   */
  defaultOpen?: boolean;
  /** Called when the button opens the field. */
  onOpen?: (event: React.SyntheticEvent) => void;
  /** Called when the empty field closes: on Escape or when the focus leaves it. */
  onClose?: (event: React.SyntheticEvent, reason: HeadingSearchCloseReason) => void;
  /** Props for the search's own parts. */
  slotProps?: {
    /** Props of the Search button, an `IconButton`. */
    button?: Partial<IconButtonProps>;
    /** Props of the field, a `FilledInput`. */
    input?: Partial<FilledInputProps>;
    /** Props of the clear button, an `IconButton`: its `aria-label` (default "Clear search"). */
    clearButton?: Partial<IconButtonProps>;
  };
  /** The system prop that allows defining system overrides as well as additional CSS styles. */
  sx?: SxProps<Theme>;
}

const SearchRoot = styled('div', { name: 'TectonHeading', slot: 'Search' })({
  display: 'flex',
  alignItems: 'center',
});

// The field grows out of the Search button: it starts at the button's width, in its place, and widens
// toward the start of the row (the actions keep the end of the heading's row), so what sits before
// it moves over smoothly instead of jumping. It animates its width, not a clip, for the row to make
// room as it grows. The row measures it at its full size before it starts (`[data-measuring]`) and
// holds its next measure until it has grown (internal/overflow/growth.ts).
const buttonWidth = (size: FilledInputProps['size']) =>
  `calc(${cssVar(size === 'small' ? 'icon-size-100' : 'icon-size-150')} + 2 * ${cssVar('space-75')})`;
const grow = (from: string, to: string) => keyframes`from { width: ${from}; } to { width: ${to}; }`;

const Field = styled(FilledInput, { name: 'TectonHeading', slot: 'SearchField' })(({
  theme,
  size,
}) => {
  const width = theme.spacing(30);
  return {
    width,
    // The adornments of a field still narrow are cut off, not spilled over its neighbours.
    overflow: 'hidden',
    [`&[${GROWING_ATTRIBUTE}]`]: {
      animation: `${grow(buttonWidth(size), width)} ${theme.transitions.duration.shorter}ms ${
        theme.transitions.easing.easeInOut
      }`,
    },
    [`[data-measuring] &[${GROWING_ATTRIBUTE}]`]: { animation: 'none' },
  };
});

const SearchIcon = styled('span', { name: 'TectonHeading', slot: 'SearchIcon' })({
  fontSize: cssVar('icon-size-100'),
});

/**
 * The heading's search: a Search icon button that opens into a search field in place. Put it in
 * `HeadingActions`, usually first. It collapses into the overflow tray after the other secondary
 * actions, and never while open.
 */
const HeadingSearch = React.forwardRef<HTMLDivElement, HeadingSearchProps>(
  function HeadingSearch(props, ref) {
    const {
      value: valueProp,
      defaultValue = '',
      onChange,
      label = 'Search',
      placeholder,
      size = 'medium',
      open: openProp,
      defaultOpen,
      onOpen,
      onClose,
      slotProps,
      className,
      onBlur,
      ...other
    } = props;
    const [value, setValue] = useControlled({
      controlled: valueProp,
      default: defaultValue,
      name: 'HeadingSearch',
      state: 'value',
    });
    // Open at first when there is text to show (computed once: `default` must not change).
    const [initialOpen] = React.useState(() => defaultOpen ?? (valueProp ?? defaultValue) !== '');
    const [open, setOpen] = useControlled({
      controlled: openProp,
      default: initialOpen,
      name: 'HeadingSearch',
      state: 'open',
    });

    // The field grows out of the button when it opens (not when it starts open), unless the user
    // asks for reduced motion.
    const [growing, setGrowing] = React.useState(false);
    const wasOpen = React.useRef(open);
    useEnhancedEffect(() => {
      if (open && !wasOpen.current) {
        setGrowing(!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
      }
      if (!open) setGrowing(false);
      wasOpen.current = open;
    }, [open]);
    // Grown: the field's own animation has ended (not one inside it, such as the input's autofill
    // detection). A native listener: React does not see animation events everywhere it runs.
    const fieldRef = React.useRef<HTMLDivElement>(null);
    const handleFieldRef = useForkRef(
      fieldRef,
      (slotProps?.input as { ref?: React.Ref<HTMLDivElement> } | undefined)?.ref,
    );
    React.useEffect(() => {
      const field = fieldRef.current;
      if (!growing || !field) return undefined;
      const grown = (event: Event) => {
        if (event.target === field) setGrowing(false);
      };
      field.addEventListener('animationend', grown);
      field.addEventListener('animationcancel', grown);
      return () => {
        field.removeEventListener('animationend', grown);
        field.removeEventListener('animationcancel', grown);
      };
    }, [growing]);

    const inputRef = React.useRef<HTMLInputElement>(null);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    // Where the focus goes once the field has opened or closed.
    const pendingFocus = React.useRef<'input' | 'button' | null>(null);
    useEnhancedEffect(() => {
      const target = pendingFocus.current === 'input' ? inputRef.current : buttonRef.current;
      if (!pendingFocus.current || !target) return;
      pendingFocus.current = null;
      target.focus();
    });

    // An open field keeps its place in the heading's row; in the tray it stays in the tray. (The
    // closed Search button collapses after the other secondary actions: see `overflowPriority`
    // below.)
    const action = React.useContext(OverflowItemContext);
    const setPinned = action?.setPinned;
    // Picked in the heading's overflow menu: back in the row, it opens there (and stays pinned
    // meanwhile).
    const activation = action?.activation ?? null;
    const pin = (open || activation != null) && !action?.inTray;
    useEnhancedEffect(() => {
      if (!setPinned) return undefined;
      setPinned(pin);
      return () => setPinned(false);
    }, [setPinned, pin]);
    const acknowledge = action?.acknowledge;
    useEnhancedEffect(() => {
      if (!activation) return;
      acknowledge?.();
      if (open) return;
      pendingFocus.current = 'input';
      setOpen(true);
      onOpen?.(activation);
      // Only a new activation acts.
    }, [activation]);

    const change = (event: React.SyntheticEvent, next: string) => {
      setValue(next);
      onChange?.(event, next);
    };
    const close = (event: React.SyntheticEvent, reason: HeadingSearchCloseReason) => {
      setOpen(false);
      onClose?.(event, reason);
    };

    const { onClick: onButtonClick, ...buttonProps } = slotProps?.button ?? {};
    const {
      onKeyDown: onInputKeyDown,
      inputProps,
      className: inputClassName,
      ...inputProps2
    } = slotProps?.input ?? {};
    const { onClick: onClearClick, ...clearProps } = slotProps?.clearButton ?? {};

    if (!open) {
      return (
        <SearchRoot ref={ref} className={clsx(headingClasses.search, className)} {...other}>
          <IconButton
            ref={buttonRef}
            size={size}
            aria-label={label}
            aria-expanded={false}
            {...buttonProps}
            className={clsx(headingClasses.searchButton, buttonProps.className)}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              onButtonClick?.(event);
              pendingFocus.current = 'input';
              setOpen(true);
              onOpen?.(event);
            }}
          >
            <span className="tecton-search-outline" aria-hidden />
          </IconButton>
        </SearchRoot>
      );
    }

    return (
      <SearchRoot
        ref={ref}
        role="search"
        aria-label={label}
        className={clsx(headingClasses.search, className)}
        onBlur={(event: React.FocusEvent<HTMLDivElement>) => {
          onBlur?.(event);
          const next = event.relatedTarget as Node | null;
          if (value === '' && !(next && event.currentTarget.contains(next))) close(event, 'blur');
        }}
        {...other}
      >
        <Field
          inputRef={inputRef}
          size={size}
          hiddenLabel
          value={value}
          placeholder={placeholder ?? label}
          onChange={(event) => change(event, event.target.value)}
          onKeyDown={(event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            onInputKeyDown?.(event);
            if (event.key !== 'Escape' || event.defaultPrevented) return;
            // Inside a menu, a dialog or the overflow tray, Escape stops here.
            event.stopPropagation();
            if (value !== '') {
              change(event, '');
            } else {
              pendingFocus.current = 'button';
              close(event, 'escapeKeyDown');
            }
          }}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon className="tecton-search-outline" aria-hidden />
            </InputAdornment>
          }
          endAdornment={
            value !== '' ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  aria-label="Clear search"
                  {...clearProps}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                    onClearClick?.(event);
                    change(event, '');
                    inputRef.current?.focus();
                  }}
                >
                  <span className="tecton-close-outline" aria-hidden />
                </IconButton>
              </InputAdornment>
            ) : null
          }
          {...inputProps2}
          ref={handleFieldRef}
          {...{ [GROWING_ATTRIBUTE]: growing ? '' : undefined }}
          className={clsx(headingClasses.searchField, inputClassName)}
          inputProps={{ 'aria-label': label, enterKeyHint: 'search', ...inputProps }}
        />
      </SearchRoot>
    );
  },
);

// A row of collapsing actions knows the search from its type (as MUI knows its own parts by
// `muiName`) and collapses it after the other secondary actions.
(HeadingSearch as typeof HeadingSearch & OverflowPriorityMarker).overflowPriority = 'late';

export default HeadingSearch;
