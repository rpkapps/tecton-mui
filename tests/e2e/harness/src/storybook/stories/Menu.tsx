// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import {
  Box,
  Checkbox,
  Divider,
  ListItemIcon,
  ListItemText as ListItemText_a,
  Menu,
  MenuItem,
  MenuList as Menu_b,
  Stack,
  Typography,
} from '@tecton-mui/ui';

function MenuIcon({ name: t }) {
  return (
    <ListItemIcon>
      <span className={`tecton-${t} tecton-icon-md`} aria-hidden />
    </ListItemIcon>
  );
}
function MenuStage({ label: t, width: n, height: s, children: i }) {
  return (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {t}
      </Typography>
      <Box sx={{ position: 'relative', contain: 'layout', width: n, height: s }}>
        {i({ top: 8, left: 8 })}
      </Box>
    </Stack>
  );
}
function T({ state: t, type: n, dense: s, disableGutters: i }) {
  return (
    <Menu_b disablePadding dense={s}>
      <MenuItem
        dense={s}
        size={s ? 'small' : 'medium'}
        disableGutters={i}
        heading={n === 'header'}
        selected={t === 'selected'}
        disabled={t === 'disabled'}
        className={t === 'hovered' ? 'Mui-focusVisible' : undefined}
      >
        <MenuIcon name="cube-outline" />
        {n === 'header' ? 'Menu Header' : 'Menu Item'}
      </MenuItem>
    </Menu_b>
  );
}
const z = [
  { state: 'enabled', type: 'item', label: 'Selectable option' },
  { state: 'hovered', type: 'item', label: 'Option: hovered' },
  { state: 'selected', type: 'item', label: 'Option: selected' },
  { state: 'disabled', type: 'item', label: 'Option: disabled' },
];
const D = [
  { state: 'enabled', type: 'header', label: 'Section heading' },
  { state: 'disabled', type: 'header', label: 'Heading: disabled' },
];
const re = [
  { key: 'n-g', dense: false, disableGutters: false, label: 'Regular · With gutters' },
  { key: 'n-ng', dense: false, disableGutters: true, label: 'Regular · Edge-to-edge' },
];
const le = [
  { key: 'd-g', dense: true, disableGutters: false, label: 'Compact · With gutters' },
  { key: 'd-ng', dense: true, disableGutters: true, label: 'Compact · Edge-to-edge' },
];
const ue = [...re, ...le];
function StandardCanvas() {
  const t = [
    {
      label: 'Fixed 128px width · Grows with content',
      width: 160,
      height: 200,
      paperSx: { width: 128, maxHeight: 'none' },
      itemsCount: 3,
    },
    {
      label: 'Fit to content · Grows with content',
      width: 210,
      height: 200,
      paperSx: { maxHeight: 'none' },
      itemsCount: 3,
    },
    {
      label: 'Fixed 128px width · Caps at 180px',
      width: 160,
      height: 210,
      paperSx: { width: 128, maxHeight: 180 },
      itemsCount: 10,
    },
    {
      label: 'Fit to content · Caps at 180px',
      width: 210,
      height: 210,
      paperSx: { maxHeight: 180 },
      itemsCount: 10,
    },
  ];
  return (
    <Stack spacing={2}>
      <Typography variant="h6">Container: all 4 sizing modes</Typography>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        Width behaviour (fixed vs. fit-to-content) × overflow behaviour (grows vs. scrolls at 180px)
      </Typography>
      <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap' }}>
        {t.map((n) => (
          <MenuStage key={n.label} label={n.label} width={n.width} height={n.height}>
            {(s) => (
              <Menu
                open
                disablePortal
                hideBackdrop
                disableScrollLock
                anchorReference="anchorPosition"
                anchorPosition={s}
                slotProps={{ paper: { sx: n.paperSx }, list: { dense: true } }}
              >
                {Array.from({ length: n.itemsCount }).map((i, u) => (
                  <MenuItem key={u} size="small">
                    <MenuIcon name="cube-outline" />
                    Menu Item
                  </MenuItem>
                ))}
              </Menu>
            )}
          </MenuStage>
        ))}
      </Stack>
    </Stack>
  );
}
function CHe({ autoWidth: t, dense: n, disableGutters: s, header: i }) {
  return (
    <Box sx={{ width: t ? 'fit-content' : 128 }}>
      <Menu_b disablePadding dense={n}>
        {i && (
          <MenuItem dense={n} size={n ? 'small' : 'medium'} disableGutters={s} heading>
            <MenuIcon name="cube-outline" />
            Menu Header
          </MenuItem>
        )}
        <MenuItem dense={n} size={n ? 'small' : 'medium'} disableGutters={s}>
          <MenuIcon name="cube-outline" />
          Menu Item
        </MenuItem>
        <MenuItem dense={n} size={n ? 'small' : 'medium'} disableGutters={s}>
          <MenuIcon name="cube-outline" />
          Menu Item
        </MenuItem>
        <MenuItem dense={n} size={n ? 'small' : 'medium'} disableGutters={s}>
          <MenuIcon name="cube-outline" />
          Menu Item
        </MenuItem>
      </Menu_b>
    </Box>
  );
}
const xe = ['Options only', 'With section heading'];
const be = [
  {
    key: 'aw-t/d-f/g',
    autoWidth: true,
    dense: false,
    disableGutters: false,
    label: 'Fit to content · Regular · With gutters',
  },
  {
    key: 'aw-t/d-f/ng',
    autoWidth: true,
    dense: false,
    disableGutters: true,
    label: 'Fit to content · Regular · Edge-to-edge',
  },
  {
    key: 'aw-t/d-t/g',
    autoWidth: true,
    dense: true,
    disableGutters: false,
    label: 'Fit to content · Compact · With gutters',
  },
  {
    key: 'aw-t/d-t/ng',
    autoWidth: true,
    dense: true,
    disableGutters: true,
    label: 'Fit to content · Compact · Edge-to-edge',
  },
  {
    key: 'aw-f/d-f/g',
    autoWidth: false,
    dense: false,
    disableGutters: false,
    label: 'Fixed 128px · Regular · With gutters',
  },
  {
    key: 'aw-f/d-f/ng',
    autoWidth: false,
    dense: false,
    disableGutters: true,
    label: 'Fixed 128px · Regular · Edge-to-edge',
  },
  {
    key: 'aw-f/d-t/g',
    autoWidth: false,
    dense: true,
    disableGutters: false,
    label: 'Fixed 128px · Compact · With gutters',
  },
  {
    key: 'aw-f/d-t/ng',
    autoWidth: false,
    dense: true,
    disableGutters: true,
    label: 'Fixed 128px · Compact · Edge-to-edge',
  },
];
function NestedCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">Menu list: all 16 layouts</Typography>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        Row = width × density × gutter combination · Column = with or without a section heading row
      </Typography>
      <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
        <Box sx={{ minWidth: 300 }} />
        {xe.map((t) => (
          <Typography key={t} variant="caption" sx={{ minWidth: 180, fontWeight: 600 }}>
            {t}
          </Typography>
        ))}
      </Stack>
      {be.map((t) => (
        <Stack key={t.key} direction="row" spacing={3} sx={{ alignItems: 'flex-start' }}>
          <Typography sx={{ minWidth: 300, pt: 1 }} variant="body2">
            {t.label}
          </Typography>
          {[false, true].map((n) => (
            <Box key={String(n)} sx={{ minWidth: 180 }}>
              <CHe
                autoWidth={t.autoWidth}
                dense={t.dense}
                disableGutters={t.disableGutters}
                header={n}
              />
            </Box>
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
function ShortcutCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">Menu item: regular density states</Typography>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        Row = regular density gutter combination · Column = interaction state
      </Typography>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Box sx={{ minWidth: 160 }} />
        {z.map((t) => (
          <Typography key={t.label} variant="caption" sx={{ minWidth: 140, fontWeight: 600 }}>
            {t.label}
          </Typography>
        ))}
      </Stack>
      {re.map((t) => (
        <Stack key={t.key} direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Typography sx={{ minWidth: 160, pt: 1 }} variant="body2">
            {t.label}
          </Typography>
          {z.map((n) => (
            <Box key={n.label} sx={{ minWidth: 140 }}>
              <T state={n.state} type={n.type} dense={t.dense} disableGutters={t.disableGutters} />
            </Box>
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
function DenseCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">Menu item: compact density states</Typography>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        Row = compact density gutter combination · Column = interaction state
      </Typography>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Box sx={{ minWidth: 160 }} />
        {z.map((t) => (
          <Typography key={t.label} variant="caption" sx={{ minWidth: 140, fontWeight: 600 }}>
            {t.label}
          </Typography>
        ))}
      </Stack>
      {le.map((t) => (
        <Stack key={t.key} direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Typography sx={{ minWidth: 160, pt: 1 }} variant="body2">
            {t.label}
          </Typography>
          {z.map((n) => (
            <Box key={n.label} sx={{ minWidth: 140 }}>
              <T state={n.state} type={n.type} dense={t.dense} disableGutters={t.disableGutters} />
            </Box>
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
function DividersCanvas() {
  return (
    <Stack spacing={4}>
      <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap' }}>
        <MenuStage label="Grouped items (regular)" width={170} height={180}>
          {(t) => (
            <Menu
              open
              disablePortal
              hideBackdrop
              disableScrollLock
              anchorReference="anchorPosition"
              anchorPosition={t}
              slotProps={{ paper: { sx: { width: 150 } } }}
            >
              <MenuItem>
                <ListItemIcon>
                  <span className="tecton-cube-outline tecton-icon-md" aria-hidden />
                </ListItemIcon>
                Menu Item
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <span className="tecton-cube-outline tecton-icon-md" aria-hidden />
                </ListItemIcon>
                Menu Item
              </MenuItem>
              <Divider />
              <MenuItem>
                <ListItemIcon>
                  <span className="tecton-cube-outline tecton-icon-md" aria-hidden />
                </ListItemIcon>
                Menu Item
              </MenuItem>
              <Divider />
              <MenuItem>
                <ListItemIcon>
                  <span className="tecton-cube-outline tecton-icon-md" aria-hidden />
                </ListItemIcon>
                Menu Item
              </MenuItem>
            </Menu>
          )}
        </MenuStage>
        <MenuStage label="Grouped items (dense)" width={150} height={160}>
          {(t) => (
            <Menu
              open
              disablePortal
              hideBackdrop
              disableScrollLock
              anchorReference="anchorPosition"
              anchorPosition={t}
              slotProps={{ paper: { sx: { width: 128 } }, list: { dense: true } }}
            >
              <MenuItem dense size="small">
                Object 1
              </MenuItem>
              <MenuItem dense size="small">
                Object 2
              </MenuItem>
              <Divider />
              <MenuItem dense size="small">
                Object 3
              </MenuItem>
              <MenuItem dense size="small" disabled>
                Object 4
              </MenuItem>
            </Menu>
          )}
        </MenuStage>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">Menu item: section heading rows</Typography>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          Row = density x gutter combination, column = heading state
        </Typography>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Box sx={{ minWidth: 160 }} />
          {D.map((t) => (
            <Typography key={t.label} variant="caption" sx={{ minWidth: 140, fontWeight: 600 }}>
              {t.label}
            </Typography>
          ))}
        </Stack>
        {ue.map((t) => (
          <Stack key={t.key} direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Typography sx={{ minWidth: 160, pt: 1 }} variant="body2">
              {t.label}
            </Typography>
            {D.map((n) => (
              <Box key={n.label} sx={{ minWidth: 140 }}>
                <T
                  state={n.state}
                  type={n.type}
                  dense={t.dense}
                  disableGutters={t.disableGutters}
                />
              </Box>
            ))}
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
function ExamplesCanvas() {
  return (
    <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap' }}>
      <MenuStage label="Grouped options with dividers" width={170} height={260}>
        {(t) => (
          <Menu
            open
            disablePortal
            hideBackdrop
            disableScrollLock
            anchorReference="anchorPosition"
            anchorPosition={t}
            slotProps={{ paper: { sx: { width: 150 } } }}
          >
            <MenuItem>
              <MenuIcon name="cube-outline" />
              Menu Item
            </MenuItem>
            <Divider />
            <MenuItem>
              <MenuIcon name="cube-outline" />
              Menu Item
            </MenuItem>
            <Divider />
            <MenuItem>
              <MenuIcon name="cube-outline" />
              Menu Item
            </MenuItem>
            <MenuItem>
              <MenuIcon name="cube-outline" />
              Menu Item
            </MenuItem>
            <MenuItem>
              <MenuIcon name="cube-outline" />
              Menu Item
            </MenuItem>
            <MenuItem>
              <MenuIcon name="cube-outline" />
              Menu Item
            </MenuItem>
          </Menu>
        )}
      </MenuStage>
      <MenuStage
        label="Action menu with icons, shortcut, and disabled row"
        width={260}
        height={220}
      >
        {(t) => (
          <Menu
            open
            disablePortal
            hideBackdrop
            disableScrollLock
            anchorReference="anchorPosition"
            anchorPosition={t}
          >
            <MenuItem>
              <MenuIcon name="open-in-new-outline" />
              <ListItemText_a>Open</ListItemText_a>
              <span className="tecton-menu-shortcut">Cmd+O</span>
            </MenuItem>
            <MenuItem>
              <MenuIcon name="edit-square-outline" />
              Rename
            </MenuItem>
            <MenuItem>
              <MenuIcon name="export-upload-outline" />
              Export
            </MenuItem>
            <MenuItem disabled>
              <MenuIcon name="delete-outline" />
              Delete
            </MenuItem>
          </Menu>
        )}
      </MenuStage>
      <MenuStage label="Compact option list" width={148} height={180}>
        {(t) => (
          <Menu
            open
            disablePortal
            hideBackdrop
            disableScrollLock
            anchorReference="anchorPosition"
            anchorPosition={t}
            slotProps={{ paper: { sx: { width: 128 } }, list: { dense: true } }}
          >
            <MenuItem size="small">
              <MenuIcon name="cube-outline" />
              Menu Item
            </MenuItem>
            <MenuItem size="small">
              <MenuIcon name="cube-outline" />
              Menu Item
            </MenuItem>
            <MenuItem size="small">
              <MenuIcon name="cube-outline" />
              Menu Item
            </MenuItem>
            <MenuItem size="small">
              <MenuIcon name="cube-outline" />
              Menu Item
            </MenuItem>
          </Menu>
        )}
      </MenuStage>
      <MenuStage label="Multi-select with checkboxes" width={148} height={160}>
        {(t) => (
          <Menu
            open
            disablePortal
            hideBackdrop
            disableScrollLock
            anchorReference="anchorPosition"
            anchorPosition={t}
            slotProps={{ paper: { sx: { width: 128 } }, list: { dense: true } }}
          >
            <MenuItem size="small">
              <Checkbox checked size="small" />
              Object 1
            </MenuItem>
            <MenuItem size="small">
              <Checkbox size="small" />
              Object 2
            </MenuItem>
            <MenuItem size="small">
              <Checkbox checked size="small" />
              Object 3
            </MenuItem>
          </Menu>
        )}
      </MenuStage>
      <MenuStage label="Text-only compact list" width={148} height={140}>
        {(t) => (
          <Menu
            open
            disablePortal
            hideBackdrop
            disableScrollLock
            anchorReference="anchorPosition"
            anchorPosition={t}
            slotProps={{
              paper: { sx: { width: 128 } },
              list: { dense: true, disablePadding: true },
            }}
          >
            <MenuItem size="small">Menu Item</MenuItem>
            <MenuItem size="small">Menu Item</MenuItem>
            <MenuItem size="small">Menu Item</MenuItem>
          </Menu>
        )}
      </MenuStage>
      <MenuStage label="Long list with scrolling" width={170} height={210}>
        {(t) => (
          <Menu
            open
            disablePortal
            hideBackdrop
            disableScrollLock
            anchorReference="anchorPosition"
            anchorPosition={t}
            slotProps={{ paper: { sx: { width: 150, maxHeight: 180 } }, list: { dense: true } }}
          >
            {Array.from({ length: 10 }).map((n, s) => (
              <MenuItem key={s} size="small">
                <MenuIcon name="cube-outline" />
                Menu Item
              </MenuItem>
            ))}
          </Menu>
        )}
      </MenuStage>
    </Stack>
  );
}
const It = { title: 'Molecules/Menu', component: Menu };
const Story_Standard = { name: 'Standard', render: () => <StandardCanvas /> };
const Story_Dense = { name: 'Dense', render: () => <DenseCanvas /> };
const Story_Shortcut = { name: 'Shortcut', render: () => <ShortcutCanvas /> };
const Story_Dividers = { name: 'Dividers', render: () => <DividersCanvas /> };
const Story_Nested = { name: 'Nested', render: () => <NestedCanvas /> };
const Story_Examples = { render: () => <ExamplesCanvas /> };
function DividerDisabledCanvas() {
  return (
    <MenuStage label="Divider around disabled item" width={200} height={200}>
      {(t) => (
        <Menu
          open
          disablePortal
          hideBackdrop
          disableScrollLock
          anchorReference="anchorPosition"
          anchorPosition={t}
          slotProps={{ paper: { sx: { width: 150 } } }}
        >
          <MenuItem>Item A</MenuItem>
          <Divider />
          <MenuItem disabled>Disabled Item</MenuItem>
          <Divider />
          <MenuItem>Item C</MenuItem>
        </Menu>
      )}
    </MenuStage>
  );
}
const Story_DividerDisabled = {
  name: 'Divider / Disabled',
  render: () => <DividerDisabledCanvas />,
};
const Story_Playground = {
  name: 'Playground',
  args: { size: 'medium', disableGutters: false, itemCount: 3, autoWidth: false, maxHeight: false },
  render: function StoryRender(t) {
    const n = t.size === 'small',
      s = { maxHeight: t.maxHeight ? 180 : 'none' };
    return (
      t.autoWidth || (s.width = 150),
      (
        <MenuStage label="Playground" width={220} height={240}>
          {(i) => (
            <Menu
              open
              disablePortal
              hideBackdrop
              disableScrollLock
              anchorReference="anchorPosition"
              anchorPosition={i}
              slotProps={{ paper: { sx: s }, list: { dense: n } }}
            >
              {Array.from({ length: t.itemCount }).map((u, d) => (
                <MenuItem key={d} dense={n} size={t.size} disableGutters={t.disableGutters}>
                  <MenuIcon name="cube-outline" />
                  {'Menu Item '}
                  {d + 1}
                </MenuItem>
              ))}
            </Menu>
          )}
        </MenuStage>
      )
    );
  },
};

export const meta = It;
export const stories = {
  'molecules-menu--dense': Story_Dense,
  'molecules-menu--divider-disabled': Story_DividerDisabled,
  'molecules-menu--dividers': Story_Dividers,
  'molecules-menu--examples': Story_Examples,
  'molecules-menu--nested': Story_Nested,
  'molecules-menu--playground': Story_Playground,
  'molecules-menu--shortcut': Story_Shortcut,
  'molecules-menu--standard': Story_Standard,
};
