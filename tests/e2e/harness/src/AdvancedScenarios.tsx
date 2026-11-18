import * as React from 'react';
import { Box, Paper, Typography } from '@tecton-mui/ui';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import StaticDateRangePicker from '@tecton-mui/ui/StaticDateRangePicker';
import DateRangePicker from '@tecton-mui/ui/DateRangePicker';
import DateTimeRangePicker from '@tecton-mui/ui/DateTimeRangePicker';
import RichTreeView from '@tecton-mui/ui/RichTreeView';
import SimpleTreeView from '@tecton-mui/ui/SimpleTreeView';
import TreeItem from '@tecton-mui/ui/TreeItem';

const range: [Date, Date] = [new Date(2026, 10, 9), new Date(2026, 10, 18)];
const dateTimeRange: [Date, Date] = [new Date(2026, 10, 9, 8, 30), new Date(2026, 10, 12, 17, 0)];

const treeItems = [
  {
    id: 'assets',
    label: 'Assets',
    children: [
      {
        id: 'north-sea',
        label: 'North Sea',
        children: [
          { id: 'alpha-7', label: 'Alpha-7' },
          { id: 'bravo-2', label: 'Bravo-2' },
        ],
      },
      { id: 'gulf', label: 'Gulf of Mexico', children: [{ id: 'delta-1', label: 'Delta-1' }] },
    ],
  },
  { id: 'reports', label: 'Reports', children: [{ id: 'q3', label: 'Q3 production' }] },
  { id: 'settings', label: 'Settings' },
];
const expanded = ['assets', 'north-sea'];

export function PickerScenarios() {
  return (
    <LocalizationProvider>
      <Box sx={{ p: 3, display: 'grid', gap: 3 }}>
        <Paper variant="outlined" sx={{ p: 2 }} data-testid="static-range">
          <Typography variant="h5" gutterBottom>
            StaticDateRangePicker (two calendars)
          </Typography>
          <StaticDateRangePicker defaultValue={range} displayStaticWrapperAs="desktop" />
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ minWidth: 320 }}>
            <Typography variant="h6" gutterBottom>
              DateRangePicker
            </Typography>
            <DateRangePicker defaultValue={range} localeText={{ start: 'Start', end: 'End' }} />
          </Box>
          <Box sx={{ minWidth: 420 }}>
            <Typography variant="h6" gutterBottom>
              DateTimeRangePicker
            </Typography>
            <DateTimeRangePicker defaultValue={dateTimeRange} />
          </Box>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}

export function TreeScenarios() {
  return (
    <Box sx={{ p: 3, display: 'grid', gap: 3, gridTemplateColumns: '1fr 1fr' }}>
      <Paper variant="outlined" sx={{ p: 2 }} data-testid="rich-tree">
        <Typography variant="h5" gutterBottom>
          RichTreeView (reordering + checkbox selection)
        </Typography>
        <RichTreeView
          items={treeItems}
          defaultExpandedItems={expanded}
          itemsReordering
          checkboxSelection
          multiSelect
        />
      </Paper>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          SimpleTreeView
        </Typography>
        <SimpleTreeView defaultExpandedItems={['a']}>
          <TreeItem itemId="a" label="Logs">
            <TreeItem itemId="a1" label="Gamma ray" />
            <TreeItem itemId="a2" label="Resistivity" />
          </TreeItem>
          <TreeItem itemId="b" label="Surfaces" />
        </SimpleTreeView>
      </Paper>
    </Box>
  );
}
