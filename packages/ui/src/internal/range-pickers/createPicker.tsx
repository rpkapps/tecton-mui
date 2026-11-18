'use client';
import * as React from 'react';
import { useThemeProps } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { DEFAULT_DESKTOP_MODE_MEDIA_QUERY } from '@mui/x-date-pickers';
import type { RangeValueType } from './models.js';
import type { ResponsiveProps } from './pickerTypes.js';
import { RangePicker, type RangePickerEngineProps } from './RangePicker.js';

/**
 * Builds a public range picker bound to a value type and variant. Theme `defaultProps` are read
 * under `Mui<name>` so existing theme configuration keeps working after a migration.
 */
export function createRangePicker<TProps extends object>(
  name: string,
  valueType: RangeValueType,
  variant: 'desktop' | 'mobile' | 'static',
) {
  const Component = React.forwardRef<HTMLDivElement, TProps>(
    function RangePickerVariant(inProps, ref) {
      const props = useThemeProps({ props: inProps, name: `Mui${name}` });
      return (
        <RangePicker
          {...(props as unknown as RangePickerEngineProps)}
          ref={ref}
          valueType={valueType}
          variant={variant}
        />
      );
    },
  );
  Component.displayName = name;
  return Component;
}

/** Builds a picker that renders its desktop or mobile variant based on a media query. */
export function createResponsiveRangePicker<TProps extends ResponsiveProps>(
  name: string,
  Desktop: React.ElementType,
  Mobile: React.ElementType,
) {
  const Component = React.forwardRef<HTMLDivElement, TProps>(
    function ResponsiveRangePicker(inProps, ref) {
      const props = useThemeProps({ props: inProps, name: `Mui${name}` }) as TProps;
      const { desktopModeMediaQuery = DEFAULT_DESKTOP_MODE_MEDIA_QUERY, ...other } = props;
      const isDesktop = useMediaQuery(desktopModeMediaQuery, { defaultMatches: true });
      const Variant = isDesktop ? Desktop : Mobile;
      return <Variant ref={ref} {...other} />;
    },
  );
  Component.displayName = name;
  return Component;
}
