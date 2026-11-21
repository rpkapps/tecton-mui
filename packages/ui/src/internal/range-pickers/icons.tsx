// Tecton icons for the range pickers' open-picker button and date/time tabs (in place of MUI X's
// Material CalendarIcon / ClockIcon). Tecton has no clock glyph; `history` is its clock face.
import * as React from 'react';
import Icon from '../../Icon/Icon.js';

type IconSlotProps = { className?: string; fontSize?: string; ownerState?: unknown };

function makeIcon(name: 'calendar' | 'history', displayName: string) {
  const Comp = ({ className }: IconSlotProps) => <Icon name={name} className={className} />;
  Comp.displayName = displayName;
  return Comp;
}

export const CalendarIcon = makeIcon('calendar', 'CalendarIcon');
export const ClockIcon = makeIcon('history', 'ClockIcon');
