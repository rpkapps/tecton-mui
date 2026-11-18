import { createFileRoute } from '@tanstack/react-router';
import Content from '../../content/getting-started/ssr.mdx';
import { MdxPage } from '../../components/MdxPage';

function SsrPage() {
  return (
    <MdxPage
      title="SSR Setup"
      description="Server rendering and static generation without a flash of the wrong theme."
      section={{ title: 'Getting Started' }}
      Content={Content}
    />
  );
}

export const Route = createFileRoute('/getting-started/ssr')({
  component: SsrPage,
});
