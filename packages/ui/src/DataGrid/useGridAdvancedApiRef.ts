import * as React from 'react';
import type { GridValidRowModel } from '@mui/x-data-grid';
import type { GridAdvancedApi } from './public-types.js';

/** Creates a ref for `<DataGrid advancedApiRef={...} />` (multi-model, pinning, history, ...). */
export function useGridAdvancedApiRef<R extends GridValidRowModel = GridValidRowModel>() {
  return React.useRef<GridAdvancedApi<R> | null>(null);
}
