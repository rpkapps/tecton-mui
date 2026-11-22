'use client';
import * as React from 'react';
import clsx from 'clsx';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tab, { type TabProps } from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Icon from '../Icon/Icon.js';
import { cssVar } from '../styles/tecton/index.js';
import { sxList } from './sxList.js';
import { CLOSE_SLOT_ATTRIBUTE, TabCloseContext } from './TabCloseButton.js';

export interface AppBarTabProps extends Omit<
  TabProps,
  'value' | 'label' | 'icon' | 'iconPosition' | 'wrapped' | 'children'
> {
  /** Identifies the tab: matched against the `AppBarTabs` `value` and passed to `onChange`. */
  value: string | number;
  /**
   * The tab's text. Without it the tab is an icon-only cell, such as Home: give it an
   * `aria-label`.
   */
  label?: React.ReactNode;
  /**
   * The icon before the label: a Tecton `Icon`, an MUI `SvgIcon` or any element. A Tecton `Icon`
   * without its own `variant` shows filled on the selected tab and outlined on the others.
   */
  icon?: React.ReactElement;
  /**
   * Closes the tab. With it, the selected tab shows a close button, and Delete or Backspace on the
   * tab closes it too. The page removes the tab and picks the next selected one.
   */
  onClose?: (event: React.SyntheticEvent) => void;
  /** Small chips after the label. */
  tags?: readonly React.ReactNode[];
}

/** Room the close button takes on the selected tab; other closeable tabs keep it empty. */
const CLOSE_SLOT_SIZE = `calc(${cssVar('icon-size-100')} + 2 * ${cssVar('space-50')})`;
const iconOnlySx = { minWidth: 48, width: 48 } as const;
const labelledSx = { flexDirection: 'row' } as const;
const labelSx = {
  display: 'flex',
  alignItems: 'center',
  gap: cssVar('space-100'),
  paddingRight: cssVar('space-100'),
} as const;
const closeSlotSx = { flexShrink: 0, width: CLOSE_SLOT_SIZE, height: CLOSE_SLOT_SIZE } as const;
const closeSlotProps = { [CLOSE_SLOT_ATTRIBUTE]: '' };

/**
 * The theme sizes and colours `.tecton-appbar-icon` glyphs. A Tecton `Icon` without its own
 * `variant` shows filled on the selected tab and outlined on the others, as in the Tecton design.
 */
function decorateIcon(icon: React.ReactNode, selected: boolean) {
  if (!React.isValidElement<{ className?: string; variant?: string }>(icon)) return icon;
  const props: { className: string; variant?: string } = {
    className: clsx('tecton-appbar-icon', icon.props.className),
  };
  if (icon.type === Icon && icon.props.variant === undefined) {
    props.variant = selected ? 'filled' : 'outline';
  }
  return React.cloneElement(icon, props);
}

/**
 * A tab of `AppBarTabs`: the MUI `Tab` props, plus `onClose` and `tags`. Without a `label` it is an
 * icon-only cell, such as Home; give it an `aria-label`.
 */
const AppBarTab = React.forwardRef<HTMLDivElement, AppBarTabProps>(function AppBarTab(props, ref) {
  // `selected` is set by MUI's Tabs on its children.
  const { value, label, icon, onClose, tags, disabled, sx, onKeyDown, ...other } =
    props as AppBarTabProps & { selected?: boolean };
  const selected = Boolean((props as { selected?: boolean }).selected);
  const { onClose: close } = React.useContext(TabCloseContext);
  const canClose = Boolean(onClose) && selected && !disabled;

  if (label == null) {
    return (
      <Tab
        ref={ref}
        component="div"
        value={value}
        disabled={disabled}
        icon={decorateIcon(icon, selected) as TabProps['icon']}
        sx={[iconOnlySx, ...sxList(sx)]}
        onKeyDown={onKeyDown}
        {...other}
      />
    );
  }
  return (
    <Tab
      ref={ref}
      component="div"
      value={value}
      disabled={disabled}
      sx={[labelledSx, ...sxList(sx)]}
      aria-keyshortcuts={canClose ? 'Delete' : undefined}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (
          canClose &&
          !event.defaultPrevented &&
          (event.key === 'Delete' || event.key === 'Backspace') &&
          event.target === event.currentTarget
        ) {
          event.preventDefault();
          close(event, String(value));
        }
      }}
      label={
        <>
          <Box data-region="tab-label" sx={labelSx}>
            {icon != null && decorateIcon(icon, selected)}
            <Typography variant="caption">{label}</Typography>
          </Box>
          {tags?.map((tag, index) => (
            <Chip key={index} label={tag} size="small" clickable={false} />
          ))}
          {onClose && <Box aria-hidden sx={closeSlotSx} {...(selected && closeSlotProps)} />}
        </>
      }
      {...other}
    />
  );
});

export default AppBarTab;
