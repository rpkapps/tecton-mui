import { createFileRoute } from '@tanstack/react-router';
import Content from '../../content/releases/migration-guides.mdx';
import { MdxPage } from '../../components/MdxPage';

function MigrationGuidesPage() {
  return (
    <MdxPage
      title="Consumer migration guides"
      description="Upgrade notes for applications moving between @tecton-mui/ui versions."
      section={{ title: 'Releases' }}
      Content={Content}
    />
  );
}

export const Route = createFileRoute('/releases/migration-guides')({
  component: MigrationGuidesPage,
});
