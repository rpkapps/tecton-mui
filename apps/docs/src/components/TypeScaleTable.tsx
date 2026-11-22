import Typography from '@tecton-mui/ui/Typography';
import TableBody from '@tecton-mui/ui/TableBody';
import TableCell from '@tecton-mui/ui/TableCell';
import TableHead from '@tecton-mui/ui/TableHead';
import TableRow from '@tecton-mui/ui/TableRow';
import { tectonTextStyles, useTheme } from '@tecton-mui/ui/styles';
import { DocsTable, InlineCode } from './mdx';

const VARIANTS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'subtitle1',
  'subtitle2',
  'body1',
  'body2',
  'button',
  'caption',
  'overline',
  'data',
] as const;

type TextStyleName = keyof typeof tectonTextStyles;

/**
 * The Tecton text style a theme variant is bound to, read from its font size variable:
 * `var(--tecton-font-size-display-1)` -> `display1`.
 */
function textStyleOf(fontSize: unknown): TextStyleName | undefined {
  const name = /--tecton-font-size-([\w-]+)/
    .exec(String(fontSize))?.[1]
    .replace(/-(\w)/g, (_, c: string) => c.toUpperCase());
  return name && name in tectonTextStyles ? (name as TextStyleName) : undefined;
}

/**
 * Reference table of the `Typography` variants: a live sample, the Tecton text style behind each
 * variant and its font, size, weight and line height. Generated from the theme bindings and the
 * exported Tecton tokens, so it follows the installed Tecton version.
 */
export function TypeScaleTable() {
  const theme = useTheme();
  return (
    <DocsTable label="Typography variants and their Tecton text styles">
      <TableHead>
        <TableRow>
          <TableCell>Variant</TableCell>
          <TableCell>Sample</TableCell>
          <TableCell>Tecton text style</TableCell>
          <TableCell>Font</TableCell>
          <TableCell>Size</TableCell>
          <TableCell>Weight</TableCell>
          <TableCell>Line height</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {VARIANTS.map((variant) => {
          const name = textStyleOf(theme.typography[variant].fontSize);
          const style = name
            ? (tectonTextStyles[name] as {
                size: number;
                weight?: number;
                lineHeight: number;
                fontFamily: string;
              })
            : undefined;
          return (
            <TableRow key={variant}>
              <TableCell>
                <InlineCode>{variant}</InlineCode>
              </TableCell>
              <TableCell sx={{ verticalAlign: 'middle !important' }}>
                <Typography variant={variant} component="div" noWrap>
                  {variant === 'data' ? '1,280.45' : 'Aa'}
                </Typography>
              </TableCell>
              <TableCell>{name ? <InlineCode>{name}</InlineCode> : '—'}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{style?.fontFamily ?? '—'}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{style ? `${style.size}px` : '—'}</TableCell>
              <TableCell>{style?.weight ?? '—'}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                {style ? `${style.lineHeight}px` : '—'}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </DocsTable>
  );
}
