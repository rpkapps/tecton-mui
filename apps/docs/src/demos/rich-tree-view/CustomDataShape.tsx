import Box from '@tecton-mui/ui/Box';
import RichTreeView from '@tecton-mui/ui/RichTreeView';

// Data as returned by an asset API: other property names than id/label/children.
interface Asset {
  assetCode: string;
  name: string;
  kind: 'field' | 'platform' | 'well';
  status?: 'producing' | 'shut-in';
  parts?: Asset[];
}

const assets: Asset[] = [
  {
    assetCode: 'FLD-01',
    name: 'Volve',
    kind: 'field',
    parts: [
      {
        assetCode: 'PLT-01',
        name: 'Mærsk Inspirer',
        kind: 'platform',
        parts: [
          { assetCode: 'WEL-11', name: '15/9-F-11', kind: 'well', status: 'producing' },
          { assetCode: 'WEL-14', name: '15/9-F-14', kind: 'well', status: 'shut-in' },
        ],
      },
    ],
  },
];

const getItemId = (asset: Asset) => asset.assetCode;
const getItemLabel = (asset: Asset) =>
  asset.status ? `${asset.name} (${asset.status})` : asset.name;
const getItemChildren = (asset: Asset) => asset.parts;
const isItemDisabled = (asset: Asset) => asset.status === 'shut-in';

export default function CustomDataShape() {
  return (
    <Box sx={{ width: 340, maxWidth: '100%' }}>
      <RichTreeView
        aria-label="Asset register"
        items={assets}
        getItemId={getItemId}
        getItemLabel={getItemLabel}
        getItemChildren={getItemChildren}
        isItemDisabled={isItemDisabled}
        defaultExpandedItems={['FLD-01', 'PLT-01']}
        defaultSelectedItems="WEL-11"
      />
    </Box>
  );
}
