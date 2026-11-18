import { createFileRoute } from '@tanstack/react-router';
import Content from '../../content/getting-started/migration-from-mui.mdx';
import { MdxPage } from '../../components/MdxPage';

function MigrationFromMuiPage() {
  return (
    <MdxPage
      title="Migration from MUI"
      description="Move an existing @mui/material application to @tecton-mui/ui."
      section={{ title: 'Getting Started' }}
      Content={Content}
    />
  );
}

export const Route = createFileRoute('/getting-started/migration-from-mui')({
  component: MigrationFromMuiPage,
});
