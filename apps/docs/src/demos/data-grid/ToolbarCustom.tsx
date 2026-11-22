import * as React from 'react';
import Badge from '@tecton-mui/ui/Badge';
import Box from '@tecton-mui/ui/Box';
import Divider from '@tecton-mui/ui/Divider';
import Icon from '@tecton-mui/ui/Icon';
import InputAdornment from '@tecton-mui/ui/InputAdornment';
import TextField from '@tecton-mui/ui/TextField';
import Tooltip from '@tecton-mui/ui/Tooltip';
import Typography from '@tecton-mui/ui/Typography';
import DataGrid, {
  ColumnsPanelTrigger,
  ExportCsv,
  FilterPanelTrigger,
  QuickFilter,
  QuickFilterClear,
  QuickFilterControl,
  Toolbar,
  ToolbarButton,
  type GridColDef,
} from '@tecton-mui/ui/DataGrid';

// Keep the toolbar at module level: a component created during render remounts on every render.
function WellsToolbar() {
  return (
    <Toolbar>
      <Typography variant="subtitle1" component="h3" sx={{ flex: 1, mx: 0.5 }}>
        Wells
      </Typography>
      <Tooltip title="Columns">
        <ColumnsPanelTrigger render={<ToolbarButton />}>
          <Icon name="view-column" />
        </ColumnsPanelTrigger>
      </Tooltip>
      <Tooltip title="Filters">
        <FilterPanelTrigger
          render={(props, state) => (
            <ToolbarButton {...props} color="default">
              <Badge badgeContent={state.filterCount} color="primary" variant="dot">
                <Icon name="filter" />
              </Badge>
            </ToolbarButton>
          )}
        />
      </Tooltip>
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />
      <Tooltip title="Download as CSV">
        <ExportCsv render={<ToolbarButton />}>
          <Icon name="download" />
        </ExportCsv>
      </Tooltip>
      <QuickFilter>
        <QuickFilterControl
          render={({ ref, ...other }) => (
            <TextField
              {...other}
              inputRef={ref}
              aria-label="Search wells"
              placeholder="Search…"
              sx={{ width: 220, ml: 0.5 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon name="search" size="medium" />
                    </InputAdornment>
                  ),
                  endAdornment: other.value ? (
                    <InputAdornment position="end">
                      <QuickFilterClear edge="end" size="small" aria-label="Clear search">
                        <Icon name="close-small" size="small" />
                      </QuickFilterClear>
                    </InputAdornment>
                  ) : null,
                  ...other.slotProps?.input,
                },
                ...other.slotProps,
              }}
            />
          )}
        />
      </QuickFilter>
    </Toolbar>
  );
}

const fields = ['Heimdal', 'Brage', 'Gullfaks', 'Troll'];
const rows = Array.from({ length: 60 }, (_, i) => ({
  id: i + 1,
  well: `W-${String(i + 1).padStart(3, '0')}`,
  field: fields[i % fields.length],
  depth: 2400 + ((i * 137) % 1800),
  oil: 400 + ((i * 53) % 900),
}));

const columns: GridColDef[] = [
  { field: 'well', headerName: 'Well', width: 120 },
  { field: 'field', headerName: 'Field', width: 140 },
  { field: 'depth', headerName: 'Depth (m)', type: 'number', width: 130 },
  { field: 'oil', headerName: 'Oil (bbl/d)', type: 'number', width: 130 },
];

export default function ToolbarCustom() {
  return (
    <Box sx={{ height: 460, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        slots={{ toolbar: WellsToolbar }}
        showToolbar
        initialState={{ pagination: { paginationModel: { page: 0, pageSize: 25 } } }}
      />
    </Box>
  );
}
