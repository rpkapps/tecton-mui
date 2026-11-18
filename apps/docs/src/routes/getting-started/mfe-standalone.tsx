import { createFileRoute } from '@tanstack/react-router';
import Content from '../../content/getting-started/mfe-standalone.mdx';
import { MdxPage } from '../../components/MdxPage';

function MfeStandalonePage() {
  return (
    <MdxPage
      title="MFE / Standalone Integration"
      description="Mount micro-frontends inside a shell, or run an application on its own."
      section={{ title: 'Getting Started' }}
      Content={Content}
    />
  );
}

export const Route = createFileRoute('/getting-started/mfe-standalone')({
  component: MfeStandalonePage,
});
