import type { SxProps, Theme } from '@mui/material/styles';

/** A consumer's `sx` as a list, to follow a part's own styles in an `sx` array (MUI's pattern). */
export function sxList(sx: SxProps<Theme> | undefined) {
  return sx === undefined ? [] : Array.isArray(sx) ? sx : [sx];
}
