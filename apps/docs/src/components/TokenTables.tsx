import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import ButtonBase from '@tecton-mui/ui/ButtonBase';
import Icon from '@tecton-mui/ui/Icon';
import TableBody from '@tecton-mui/ui/TableBody';
import TableCell from '@tecton-mui/ui/TableCell';
import TableHead from '@tecton-mui/ui/TableHead';
import TableRow from '@tecton-mui/ui/TableRow';
import Tooltip from '@tecton-mui/ui/Tooltip';
import Typography from '@tecton-mui/ui/Typography';
import {
  getDefaultTheme,
  tectonBorderRadius,
  tectonBorderWidth,
  tectonIconSize,
  tectonSpacing,
  useTheme,
  type Theme,
} from '@tecton-mui/ui/styles';
import { DocsTable, InlineCode, SectionHeading } from './mdx';
import { copyText } from './icons/iconSnippets';
import { colorGroups } from '../lib/tokenData';
import { formatFactor, scaleEntries, type ColorGroupId, type ColorRow } from '../lib/tectonTokens';

// ---------------------------------------------------------------------------------------------
// Building blocks

const mono = 'var(--tecton-font-family-mono), monospace';

/**
 * Every cell of a token row sits in the middle of the row.
 * `!important` because DocsTable top-aligns every cell from its container.
 */
const middle = { verticalAlign: 'middle !important' } as const;
const middleNoWrap = { ...middle, whiteSpace: 'nowrap' } as const;

/** A CSS variable name that copies itself to the clipboard. */
export function CopyToken({ text, size = 'medium' }: { text: string; size?: 'small' | 'medium' }) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(id);
  }, [copied]);
  return (
    <Tooltip title={copied ? 'Copied' : 'Copy'} placement="top">
      <ButtonBase
        aria-label={`Copy ${text}`}
        onClick={() => void copyText(text).then((ok) => ok && setCopied(true))}
        sx={{
          gap: 0.75,
          maxWidth: '100%',
          px: 0.75,
          py: 0.25,
          borderRadius: 0.75,
          justifyContent: 'flex-start',
          textAlign: 'start',
          fontFamily: mono,
          fontSize: size === 'small' ? 12 : 13,
          lineHeight: 1.5,
          color: size === 'small' ? 'text.secondary' : 'text.primary',
          bgcolor: 'var(--tecton-color-content-bg-hover)',
          border: '1px solid var(--tecton-color-divider-subtle)',
          '& .copy-token-icon': { color: 'text.secondary', flexShrink: 0 },
          '&:hover': { borderColor: 'var(--tecton-color-divider-strong)' },
          '&:hover .copy-token-icon, &.Mui-focusVisible .copy-token-icon': {
            color: 'text.primary',
          },
        }}
      >
        {/* Long names wrap at their hyphens only. */}
        <Box component="code" sx={{ font: 'inherit', minWidth: 0 }}>
          {text}
        </Box>
        <Icon name={copied ? 'check' : 'copy'} size="xsmall" className="copy-token-icon" />
      </ButtonBase>
    </Tooltip>
  );
}

const checkerboard = {
  backgroundColor: 'var(--tecton-color-bg-paper)',
  backgroundImage:
    'linear-gradient(45deg, var(--tecton-color-divider-subtle) 25%, transparent 25%, transparent 75%, var(--tecton-color-divider-subtle) 75%), linear-gradient(45deg, var(--tecton-color-divider-subtle) 25%, transparent 25%, transparent 75%, var(--tecton-color-divider-subtle) 75%)',
  backgroundSize: '8px 8px',
  backgroundPosition: '0 0, 4px 4px',
} as const;

/** Color sample over a checkerboard, so transparent and translucent values stay visible. */
function Swatch({ color, size }: { color: string; size: number }) {
  return (
    <Box
      aria-hidden
      sx={{
        ...checkerboard,
        position: 'relative',
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: size > 20 ? 1.5 : 0.75,
        overflow: 'hidden',
        border: '1px solid var(--tecton-color-divider)',
      }}
    >
      {/* Inline style: one Emotion class per distinct color would bloat the page stylesheet. */}
      <Box sx={{ position: 'absolute', inset: 0 }} style={{ background: color }} />
    </Box>
  );
}

/** The value in light and in dark mode, one line each. */
function ModeValues({ light, dark }: { light: string; dark: string }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto auto auto',
        justifyContent: 'start',
        alignItems: 'center',
        columnGap: 1,
        rowGap: 0.75,
        whiteSpace: 'nowrap',
      }}
    >
      {(
        [
          ['Light', light],
          ['Dark', dark],
        ] as const
      ).map(([mode, value]) => (
        <React.Fragment key={mode}>
          <Typography variant="caption" color="text.secondary" component="span">
            {mode}
          </Typography>
          <Swatch color={value} size={16} />
          <Box component="span" sx={{ fontFamily: mono, fontSize: 13 }}>
            {value}
          </Box>
        </React.Fragment>
      ))}
    </Box>
  );
}

/** Token column: optional swatch, name or role, and guidance. */
function TokenCell({
  title,
  description,
  swatch,
}: {
  title: React.ReactNode;
  description?: string;
  swatch?: string;
}) {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
      {swatch && <Swatch color={swatch} size={32} />}
      <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="caption" component="span" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/** CSS variable column: the copyable name, then any aliases with the same value. */
function VariableCell({ name, aliases }: { name: string; aliases?: string[] }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.75 }}>
      <CopyToken text={name} />
      {aliases?.map((alias) => (
        <Box
          key={alias}
          sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, maxWidth: '100%' }}
        >
          <Typography variant="caption" color="text.secondary" component="span">
            Alias
          </Typography>
          <CopyToken text={alias} size="small" />
        </Box>
      ))}
    </Box>
  );
}

// ---------------------------------------------------------------------------------------------
// Colors

function ColorTable({ rows, label }: { rows: ColorRow[]; label: string }) {
  return (
    <DocsTable label={label}>
      <TableHead>
        <TableRow>
          <TableCell sx={{ width: '38%' }}>Token</TableCell>
          <TableCell sx={{ width: '22%' }}>Value</TableCell>
          <TableCell>CSS variable</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.name}>
            <TableCell sx={middle}>
              <TokenCell
                title={row.label}
                description={row.description}
                swatch={`var(${row.name})`}
              />
            </TableCell>
            <TableCell sx={middle}>
              <ModeValues light={row.light} dark={row.dark} />
            </TableCell>
            <TableCell sx={middle}>
              <VariableCell name={row.name} aliases={row.aliases} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </DocsTable>
  );
}

/**
 * The `--tecton-color-*` variables of one group, generated from the installed token stylesheet.
 * The large swatch uses the variable itself and follows the current mode.
 */
export function ColorTokenTable({ group, label }: { group: ColorGroupId; label: string }) {
  const rows = colorGroups[group];
  if (rows.length === 0) return null;
  return <ColorTable rows={rows} label={`${label} color tokens`} />;
}

/** Color variables that no section of the page claims yet (empty for the pinned Tecton version). */
export function OtherColorTokens() {
  if (colorGroups.other.length === 0) return null;
  return (
    <>
      <SectionHeading level={2}>Other colors</SectionHeading>
      <ColorTable rows={colorGroups.other} label="Other color tokens" />
    </>
  );
}

const PALETTE_KEYS = [
  ...['primary', 'secondary', 'error', 'warning', 'info', 'success'].flatMap((c) => [
    `${c}.main`,
    `${c}.contrastText`,
  ]),
  'text.primary',
  'text.secondary',
  'text.disabled',
  'background.default',
  'background.paper',
  'divider',
];

function paletteValue(theme: Theme, key: string): string {
  let value: unknown = theme.palette;
  for (const part of key.split('.')) value = (value as Record<string, unknown> | undefined)?.[part];
  return typeof value === 'string' ? value : '—';
}

/** MUI palette keys of the Tecton theme with their value in each mode. */
export function MuiPaletteTable() {
  const light = getDefaultTheme('light');
  const dark = getDefaultTheme('dark');
  return (
    <DocsTable label="MUI palette of the Tecton theme">
      <TableHead>
        <TableRow>
          <TableCell sx={{ width: '38%' }}>Palette key</TableCell>
          <TableCell>Value</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {PALETTE_KEYS.map((key) => (
          <TableRow key={key}>
            <TableCell sx={middle}>
              <InlineCode>{key}</InlineCode>
            </TableCell>
            <TableCell sx={middle}>
              <ModeValues light={paletteValue(light, key)} dark={paletteValue(dark, key)} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </DocsTable>
  );
}

// ---------------------------------------------------------------------------------------------
// Spacing, radius, border width, icon size

interface ScaleTableProps {
  label: string;
  scale: Record<string, number>;
  /** Design token name prefix, e.g. `space` for `space.200`. */
  tokenPrefix: string;
  /** CSS variable prefix, e.g. `--tecton-space-`. */
  cssPrefix: string;
  descriptions: Record<string, string>;
  extra?: { header: React.ReactNode; render: (key: string, value: number) => React.ReactNode };
  preview: (cssVariable: string, value: number) => React.ReactNode;
}

function ScaleTable({
  label,
  scale,
  tokenPrefix,
  cssPrefix,
  descriptions,
  extra,
  preview,
}: ScaleTableProps) {
  return (
    <DocsTable label={label}>
      <TableHead>
        <TableRow>
          <TableCell>Token</TableCell>
          <TableCell>Value</TableCell>
          <TableCell>Preview</TableCell>
          {extra && <TableCell>{extra.header}</TableCell>}
          <TableCell>CSS variable</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {scaleEntries(scale).map(([key, value]) => (
          <TableRow key={key}>
            <TableCell sx={middle}>
              <TokenCell title={`${tokenPrefix}.${key}`} description={descriptions[key]} />
            </TableCell>
            <TableCell sx={middleNoWrap}>{value}px</TableCell>
            <TableCell sx={middle}>{preview(`var(${cssPrefix}${key})`, value)}</TableCell>
            {extra && <TableCell sx={middleNoWrap}>{extra.render(key, value)}</TableCell>}
            {/* Scale variable names are short: keep each on one line. */}
            <TableCell sx={middleNoWrap}>
              <VariableCell name={`${cssPrefix}${key}`} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </DocsTable>
  );
}

const SPACING_DESCRIPTIONS: Record<string, string> = {
  '0': 'No gap.',
  '25': 'Hairline offsets and icon-to-text nudges.',
  '50': 'Tight inline gaps inside compact controls.',
  '75': 'Dense layouts where 4px is too tight and 8px too loose.',
  '100': 'Base unit: theme.spacing(1). Small groups.',
  '150': 'Padding inside grouped controls and labels.',
  '200': 'Standard component padding and layout gap.',
  '250': 'Gap between related groups.',
  '300': 'Large component padding and section interiors.',
  '400': 'Small gap between page sections.',
  '500': 'Medium gap between page sections.',
  '600': 'Large gap between page sections.',
  '700': 'Wide page spacing.',
  '800': 'Spacious layouts.',
  '900': 'Extra-large page spacing.',
  '1000': 'Separation of major page regions.',
  '1200': 'Full-page layouts with generous empty space.',
  '1400': 'Extra-large region separation.',
  '1600': 'Display-scale page spacing.',
  '1800': 'Largest documented spacing.',
};

/** Spacing scale with the matching `theme.spacing()` / `sx` multiplier. */
export function SpacingTable() {
  const theme = useTheme();
  const scale = tectonSpacing as Record<string, number>;
  // The theme's spacing unit is a Tecton space token: `calc(var(--tecton-space-100) * n)`.
  const unitKey = /--tecton-space-([\w-]+)/.exec(String(theme.spacing(1)))?.[1];
  const unit = (unitKey && scale[unitKey]) || 8;
  return (
    <ScaleTable
      label="Tecton spacing tokens"
      scale={scale}
      tokenPrefix="space"
      cssPrefix="--tecton-space-"
      descriptions={SPACING_DESCRIPTIONS}
      extra={{
        header: <InlineCode>sx</InlineCode>,
        render: (_, value) => <InlineCode>{formatFactor(value, unit)}</InlineCode>,
      }}
      preview={(variable) => (
        <Box
          sx={{ height: 12, bgcolor: 'primary.main', borderRadius: 0.5 }}
          style={{ width: variable }}
        />
      )}
    />
  );
}

const RADIUS_DESCRIPTIONS: Record<string, string> = {
  '0': 'Square corners and flush seams.',
  '25': 'Subtle rounding on dense elements.',
  '50': 'Default corner radius.',
  '100': 'Grouped controls and medium surfaces.',
  '150': 'Large surfaces.',
  '200': 'Extra-large surfaces.',
  round: 'Pills and circles.',
};

/** Corner radius scale with the matching `sx` `borderRadius` multiplier. */
export function RadiusTable() {
  const theme = useTheme();
  const unit = Number(theme.shape.borderRadius) || 4;
  return (
    <ScaleTable
      label="Tecton corner radius tokens"
      scale={tectonBorderRadius as Record<string, number>}
      tokenPrefix="radius"
      cssPrefix="--tecton-radius-"
      descriptions={RADIUS_DESCRIPTIONS}
      extra={{
        header: (
          <>
            <InlineCode>sx</InlineCode> borderRadius
          </>
        ),
        render: (key, value) =>
          /^\d+$/.test(key) ? <InlineCode>{formatFactor(value, unit)}</InlineCode> : '—',
      }}
      preview={(variable) => (
        <Box
          sx={{
            width: 48,
            height: 32,
            bgcolor: 'var(--tecton-color-action-secondary-bg)',
            border: '1px solid var(--tecton-color-action-outlined-border)',
          }}
          style={{ borderRadius: variable }}
        />
      )}
    />
  );
}

const BORDER_DESCRIPTIONS: Record<string, string> = {
  '0': 'No border.',
  '100': 'Default border of controls and surfaces.',
  '200': 'Emphasis: focus rings and active states.',
  '400': 'Heavy separators and callouts.',
};

/** Border width scale. */
export function BorderWidthTable() {
  return (
    <ScaleTable
      label="Tecton border width tokens"
      scale={tectonBorderWidth as Record<string, number>}
      tokenPrefix="border"
      cssPrefix="--tecton-border-width-"
      descriptions={BORDER_DESCRIPTIONS}
      preview={(variable) => (
        <Box
          sx={{
            width: 48,
            height: 32,
            borderRadius: 1,
            borderStyle: 'solid',
            borderColor: 'var(--tecton-color-divider-strong)',
          }}
          style={{ borderWidth: variable }}
        />
      )}
    />
  );
}

const ICON_DESCRIPTIONS: Record<string, string> = {
  '50': 'Dense chips and badges.',
  '100': 'Compact controls and adornments.',
  '150': 'Standard buttons and menu items.',
  '200': 'Default size inside controls.',
  '300': 'Headings and prominent actions.',
  '350': 'Hero controls.',
  '400': 'Feature illustrations.',
};

/** `Icon` `size` values (see the Icon component's `size` prop). */
const ICON_SIZE_PROP: Record<number, string> = {
  12: 'xsmall',
  16: 'small',
  20: 'medium',
  24: 'large',
};

/** Icon size scale with the matching `Icon` `size` prop. */
export function IconSizeTable() {
  return (
    <ScaleTable
      label="Tecton icon size tokens"
      scale={tectonIconSize as Record<string, number>}
      tokenPrefix="icon"
      cssPrefix="--tecton-icon-size-"
      descriptions={ICON_DESCRIPTIONS}
      extra={{
        header: (
          <>
            <InlineCode>Icon</InlineCode> size
          </>
        ),
        render: (_, value) =>
          ICON_SIZE_PROP[value] ? <InlineCode>{`"${ICON_SIZE_PROP[value]}"`}</InlineCode> : '—',
      }}
      preview={(variable) => (
        <Icon name="settings" style={{ fontSize: variable, display: 'block' }} />
      )}
    />
  );
}
