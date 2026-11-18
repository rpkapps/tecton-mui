import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import IconButton from '@tecton-mui/ui/IconButton';
import Tooltip from '@tecton-mui/ui/Tooltip';
import Icon from '@tecton-mui/ui/Icon';

export function CopyButton({ text, label = 'Copy code' }: { text: string; label?: string }) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(id);
  }, [copied]);
  return (
    <Tooltip title={copied ? 'Copied' : label}>
      <IconButton
        size="small"
        aria-label={label}
        onClick={() => {
          void navigator.clipboard?.writeText(text).then(() => setCopied(true));
        }}
      >
        <Icon name={copied ? 'check' : 'copy'} size="small" />
      </IconButton>
    </Tooltip>
  );
}

/** Copyable, monospace code block (no syntax highlighting dependency). */
export function CodeBlock({
  code,
  language,
  bare,
}: {
  code: string;
  language?: string;
  /** Without border/margins (used inside demos). */
  bare?: boolean;
}) {
  const text = code.replace(/\n$/, '');
  return (
    <Box
      // Code is always left-to-right; logical properties keep the layout correct in RTL pages.
      dir="ltr"
      sx={{
        position: 'relative',
        my: bare ? 0 : 2,
        border: bare ? 0 : 1,
        borderColor: 'divider',
        borderRadius: bare ? 0 : 1,
        bgcolor: 'action.hover',
      }}
    >
      <Box sx={{ position: 'absolute', top: 4, insetInlineEnd: 4 }}>
        <CopyButton text={text} />
      </Box>
      <Box
        component="pre"
        data-language={language}
        sx={{
          m: 0,
          p: 2,
          paddingInlineEnd: 6,
          overflowX: 'auto',
          typography: 'data',
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        <code>{text}</code>
      </Box>
    </Box>
  );
}
