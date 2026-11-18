import { createFileRoute } from '@tanstack/react-router';
import Content from '../../content/getting-started/quick-start.mdx';
import { MdxPage } from '../../components/MdxPage';

function QuickStartPage() {
  return (
    <MdxPage
      title="Quick Start"
      description="Render your first Tecton-styled components in a few minutes."
      section={{ title: 'Getting Started' }}
      Content={Content}
    />
  );
}

export const Route = createFileRoute('/getting-started/quick-start')({
  component: QuickStartPage,
});
