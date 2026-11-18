import { createFileRoute } from '@tanstack/react-router';
import Content from '../../content/guides/licensing.mdx';
import { MdxPage } from '../../components/MdxPage';

function LicensingPage() {
  return (
    <MdxPage
      title="Licensing and provenance"
      description="Where the code and the documentation in this portal come from."
      section={{ title: 'Guides' }}
      Content={Content}
    />
  );
}

export const Route = createFileRoute('/guides/licensing')({
  component: LicensingPage,
});
