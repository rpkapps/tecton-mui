// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import { Box, Chip, Divider, SimpleTreeView, Stack, TreeItem, Typography } from '@tecton-mui/ui';

export function TreeLabel({ icon: t, colorTag: e, label: n, tag: o, tagColor: s, hidden: r }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      {t}
      {e}
      <Box
        component="span"
        sx={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          ...(r && { color: 'var(--tecton-color-text-disabled)' }),
        }}
      >
        {n}
      </Box>
      {o ? (
        <Chip
          label={o}
          size="xsmall"
          sx={{
            opacity: r ? 0.4 : 1,
            borderRadius: 'var(--tecton-radius-50, 4px)',
            '& .MuiChip-label': { px: '4px' },
            ...(s && { backgroundColor: s }),
          }}
        />
      ) : null}
      <Box
        sx={{
          width: 16,
          height: 16,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {r ? <span className="tecton-visibility-off-outline" aria-hidden /> : null}
      </Box>
    </Box>
  );
}
export function FolderIcon() {
  return (
    <Box
      className="folder-state-icon"
      sx={{ position: 'relative', width: 16, height: 16, flexShrink: 0 }}
    >
      <Box
        className="folder-closed"
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span className="tecton-folder-outline" aria-hidden />
      </Box>
      <Box
        className="folder-open"
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span className="tecton-folder-open-outline" aria-hidden />
      </Box>
    </Box>
  );
}
export function ColorTag({
  color: t = 'var(--tecton-color-accent-saffron-fill)',
  dimmed: e = false,
}) {
  return (
    <Box
      sx={{
        width: 12,
        height: 12,
        borderRadius: '2px',
        backgroundColor: t,
        flexShrink: 0,
        opacity: e ? 0.4 : 1,
      }}
    />
  );
}
function FolderColorTag({ color: t, inherited: e = false }) {
  return (
    <Box
      sx={{
        width: 12,
        height: 12,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{ width: e ? 6 : 12, height: e ? 6 : 12, borderRadius: '2px', backgroundColor: t }}
      />
    </Box>
  );
}
const pe = 'var(--tecton-color-status-success-filled-bg)';
const Ot = 'var(--tecton-color-accent-saffron-fill)';
function CanonicalTree({ colorTags: t = false }) {
  const e = (n, o = false) => (t ? <FolderColorTag color={n} inherited={o} /> : undefined);
  return (
    <SimpleTreeView
      defaultExpandedItems={['folder-root', 'k70-1', 'local-survey-2']}
      defaultSelectedItems="item-1"
      aria-label="Inventory"
      sx={{ width: 369, ...(t ? { pt: 1.5, px: 1.5, pb: 0 } : { p: 0 }) }}
    >
      <TreeItem
        itemId="folder-root"
        label={<TreeLabel icon={<FolderIcon />} colorTag={e(pe)} label="Folder" />}
      >
        <TreeItem
          itemId="k70-1"
          label={
            <TreeLabel icon={<FolderIcon />} colorTag={e(pe, true)} label="K70: Spekk fm top" />
          }
        >
          <TreeItem
            itemId="regional"
            label={
              <TreeLabel
                icon={<FolderIcon />}
                colorTag={e(Ot, true)}
                label="Regional"
                tag="Person"
              />
            }
          />
          <TreeItem
            itemId="local-survey-2"
            label={
              <TreeLabel
                icon={<FolderIcon />}
                colorTag={e(Ot, true)}
                label="Local - Survey 2"
                tag="Person"
              />
            }
          >
            <TreeItem
              itemId="item-1"
              label={<TreeLabel icon={<ColorTag />} label="Item" tag="Person" />}
            />
            <TreeItem
              itemId="item-2"
              label={<TreeLabel icon={<ColorTag />} label="Item" tag="Person" />}
            />
            <TreeItem
              itemId="item-3"
              label={<TreeLabel icon={<ColorTag dimmed />} label="Item" tag="Person" hidden />}
            />
            <TreeItem
              itemId="item-4"
              label={<TreeLabel icon={<ColorTag dimmed />} label="Item" tag="Person" hidden />}
            />
            <TreeItem
              itemId="item-5"
              label={<TreeLabel icon={<ColorTag dimmed />} label="Item" tag="Person" hidden />}
            />
          </TreeItem>
        </TreeItem>
      </TreeItem>
      <TreeItem
        itemId="k70-hidden"
        label={
          <TreeLabel
            icon={<FolderIcon />}
            colorTag={e(pe, true)}
            label="K70: Spekk fm top"
            hidden
          />
        }
      />
    </SimpleTreeView>
  );
}
function CollapsedTree() {
  return (
    <SimpleTreeView aria-label="Inventory, collapsed" sx={{ width: 369, pr: 1.5 }}>
      <TreeItem
        itemId="folder-root"
        label={
          <TreeLabel
            icon={<FolderIcon />}
            colorTag={<FolderColorTag color={pe} />}
            label="Folder"
          />
        }
      >
        <TreeItem
          itemId="k70-1"
          label={<TreeLabel icon={<FolderIcon />} label="K70: Spekk fm top" />}
        />
      </TreeItem>
    </SimpleTreeView>
  );
}
function Ln() {
  return (
    <SimpleTreeView aria-label="Inventory item primitive" sx={{ width: 436 }}>
      <TreeItem
        itemId="inv-item"
        label={
          <TreeLabel
            icon={<ColorTag color="var(--tecton-color-status-success-filled-bg)" />}
            label="Item"
            tag="Person"
          />
        }
      />
    </SimpleTreeView>
  );
}
function Pn() {
  return (
    <SimpleTreeView
      defaultExpandedItems={['folder-expanded']}
      aria-label="Expanded folder primitive"
      sx={{ width: 369 }}
    >
      <TreeItem
        itemId="folder-expanded"
        label={<TreeLabel icon={<FolderIcon />} label="Folder" tag="Person" />}
      />
    </SimpleTreeView>
  );
}
function StandardCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        Canonical Figma tree with Folder root, one expanded folder with 5 leaf items (first two
        visible, remaining three hidden), and a hidden variant of the same K70 folder below.
        Selection shows on the first “Item.”
      </Typography>
      <CanonicalTree />
    </Stack>
  );
}
function MultiSelectCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        Multi select tree with two items pre selected. Users can add or remove selections with
        click, Space, or Ctrl+click.
      </Typography>
      <SimpleTreeView
        multiSelect
        defaultExpandedItems={['folder-root', 'local-survey']}
        defaultSelectedItems={['item-1', 'item-3']}
        aria-label="Multi select inventory"
        sx={{ width: 369, p: 2 }}
      >
        <TreeItem itemId="folder-root" label={<TreeLabel icon={<FolderIcon />} label="Folder" />}>
          <TreeItem
            itemId="local-survey"
            label={<TreeLabel icon={<FolderIcon />} label="Local - Survey" tag="Person" />}
          >
            <TreeItem
              itemId="item-1"
              label={<TreeLabel icon={<ColorTag />} label="Item 1" tag="Person" />}
            />
            <TreeItem
              itemId="item-2"
              label={<TreeLabel icon={<ColorTag />} label="Item 2" tag="Person" />}
            />
            <TreeItem
              itemId="item-3"
              label={<TreeLabel icon={<ColorTag />} label="Item 3" tag="Person" />}
            />
            <TreeItem
              itemId="item-4"
              label={<TreeLabel icon={<ColorTag />} label="Item 4" tag="Person" />}
            />
          </TreeItem>
        </TreeItem>
      </SimpleTreeView>
    </Stack>
  );
}
function IconsCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        Folder icon cross fades between closed and open when the row expands (global CSS from the
        Tecton theme). Leaf items use a small colored tag whose fill is a Tecton token.
      </Typography>
      <Pn />
      <Ln />
    </Stack>
  );
}
function ActionsCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        Trailing chip and reserved 16px visibility slot per row. The slot stays reserved for hidden
        and visible rows so the chip column lines up across the tree.
      </Typography>
      <SimpleTreeView
        defaultExpandedItems={['folder-root']}
        aria-label="Row actions and states"
        sx={{ width: 436, p: 2 }}
      >
        <TreeItem
          itemId="folder-root"
          label={<TreeLabel icon={<FolderIcon />} label="Folder" tag="Person" />}
        >
          <TreeItem
            itemId="item-visible"
            label={<TreeLabel icon={<ColorTag />} label="Visible item" tag="Person" />}
          />
          <TreeItem
            itemId="item-plain"
            label={<TreeLabel icon={<ColorTag />} label="No trailing chip" />}
          />
          <TreeItem
            itemId="item-hidden"
            label={<TreeLabel icon={<ColorTag />} label="Hidden item" tag="Person" hidden />}
          />
        </TreeItem>
      </SimpleTreeView>
    </Stack>
  );
}
const Nr = { title: 'Organisms/Tree View', component: SimpleTreeView };
function CEt({ label: t, children: e }) {
  return (
    <Stack spacing={1}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {t}
      </Typography>
      {e}
    </Stack>
  );
}
function ExamplesCanvas() {
  return (
    <Stack spacing={4} divider={<Divider flexItem />}>
      <CEt label="Tree View · canonical composition (369 × 360)">
        <CanonicalTree />
      </CEt>
      <CEt label="Inventory Item · leaf primitive (436 × 36)">
        <Ln />
      </CEt>
      <CEt label="Folder Expanded · folder primitive (369 × 36)">
        <Pn />
      </CEt>
    </Stack>
  );
}
const Story_Standard = { name: 'Standard', render: () => <StandardCanvas /> };
const Story_ColorTags = { name: 'Color tags', render: () => <CanonicalTree colorTags /> };
const Story_Collapsed = { name: 'Collapsed', render: () => <CollapsedTree /> };
const Story_MultiSelect = { name: 'Multi select', render: () => <MultiSelectCanvas /> };
const Story_Icons = { name: 'Icons', render: () => <IconsCanvas /> };
const Story_Actions = { name: 'Actions', render: () => <ActionsCanvas /> };
const Story_Examples = { render: () => <ExamplesCanvas /> };
const Fn = 'root';
const or = 'folder-a';
const sr = 'folder-b';
const rr = [Fn];
const Story_Playground = {
  name: 'Playground',
  args: { multiSelect: false, checkboxSelection: false, colorTags: false, collapsed: false },
  render: function StoryRender(t) {
    const e = t.colorTags || t.collapsed,
      n = (o) => (e ? <FolderColorTag color={pe} inherited={o} /> : undefined);
    return (
      <Stack sx={{ p: 3, alignItems: 'flex-start' }}>
        <SimpleTreeView
          multiSelect={t.multiSelect}
          checkboxSelection={t.checkboxSelection}
          defaultExpandedItems={t.collapsed ? [] : rr}
          aria-label={t.collapsed ? 'Inventory, collapsed' : 'Playground tree'}
          sx={{ width: 369 }}
        >
          <TreeItem
            itemId={Fn}
            label={<TreeLabel icon={<FolderIcon />} colorTag={n(false)} label="Folder root" />}
          >
            <TreeItem
              itemId={or}
              label={<TreeLabel icon={<FolderIcon />} colorTag={n(true)} label="Folder A" />}
            >
              <TreeItem itemId="item-1" label={<TreeLabel icon={<ColorTag />} label="Item 1" />} />
              <TreeItem itemId="item-2" label={<TreeLabel icon={<ColorTag />} label="Item 2" />} />
            </TreeItem>
            <TreeItem
              itemId={sr}
              label={<TreeLabel icon={<FolderIcon />} colorTag={n(true)} label="Folder B" />}
            >
              <TreeItem itemId="item-3" label={<TreeLabel icon={<ColorTag />} label="Item 3" />} />
              <TreeItem itemId="item-4" label={<TreeLabel icon={<ColorTag />} label="Item 4" />} />
            </TreeItem>
          </TreeItem>
        </SimpleTreeView>
      </Stack>
    );
  },
};

export const meta = Nr;
export const stories = {
  'organisms-tree-view--actions': Story_Actions,
  'organisms-tree-view--collapsed': Story_Collapsed,
  'organisms-tree-view--color-tags': Story_ColorTags,
  'organisms-tree-view--examples': Story_Examples,
  'organisms-tree-view--icons': Story_Icons,
  'organisms-tree-view--multi-select': Story_MultiSelect,
  'organisms-tree-view--playground': Story_Playground,
  'organisms-tree-view--standard': Story_Standard,
};
