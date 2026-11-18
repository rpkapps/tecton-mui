import { createFileRoute } from '@tanstack/react-router';
import Content from '../../content/getting-started/shell-integration.mdx';
import { MdxPage } from '../../components/MdxPage';

function ShellIntegrationPage() {
  return (
    <MdxPage
      title="Shell Integration"
      description="Set up the host shell that owns the page: global styles, baseline and mode."
      section={{ title: 'Getting Started' }}
      Content={Content}
    />
  );
}

export const Route = createFileRoute('/getting-started/shell-integration')({
  component: ShellIntegrationPage,
});
