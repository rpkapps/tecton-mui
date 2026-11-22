import Box from '@tecton-mui/ui/Box';
import Button from '@tecton-mui/ui/Button';
import Typography from '@tecton-mui/ui/Typography';

const variants = ['contained', 'outlined', 'text'] as const;

const colors = [
  { color: 'primary', label: 'Primary' },
  { color: 'secondary', label: 'Secondary' },
  { color: 'tertiary', label: 'Tertiary' },
  { color: 'textOnly', label: 'Text only' },
  { color: 'success', label: 'Success' },
  { color: 'warning', label: 'Warning' },
  { color: 'error', label: 'Error' },
  { color: 'info', label: 'Info' },
] as const;

// Tertiary and Text only are text buttons: Tecton has no contained style for them.
const unstyled = new Set(['contained:tertiary', 'contained:textOnly']);

export default function ButtonVariantGrid() {
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto repeat(3, max-content)',
          columnGap: 3,
          rowGap: 1.5,
          alignItems: 'center',
          justifyItems: 'start',
        }}
      >
        <span />
        {variants.map((variant) => (
          <Typography key={variant} variant="body2" component="code" sx={{ fontWeight: 600 }}>
            {variant}
          </Typography>
        ))}
        {colors.map(({ color, label }) => [
          <Typography key={color} variant="body2" component="code" sx={{ fontWeight: 600 }}>
            {color}
          </Typography>,
          ...variants.map((variant) =>
            unstyled.has(`${variant}:${color}`) ? (
              <Typography
                key={`${color}-${variant}`}
                variant="body2"
                sx={{ color: 'text.secondary' }}
              >
                —
              </Typography>
            ) : (
              <Button key={`${color}-${variant}`} variant={variant} color={color}>
                {label}
              </Button>
            ),
          ),
        ])}
      </Box>
    </Box>
  );
}
