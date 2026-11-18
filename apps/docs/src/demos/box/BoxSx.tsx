import Box from '@tecton-mui/ui/Box';

export default function BoxSx() {
  return (
    <Box
      sx={{
        p: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
        display: 'flex',
        gap: 2,
        alignItems: 'center',
      }}
    >
      <Box component="span" sx={{ typography: 'subtitle2' }}>
        Box
      </Box>
      <Box component="span" sx={{ typography: 'body2', color: 'text.secondary' }}>
        Layout with theme spacing, palette and typography keys.
      </Box>
    </Box>
  );
}
