import { createFileRoute } from '@tanstack/react-router';
import Content from '../../content/guides/compatibility.mdx';
import { MdxPage } from '../../components/MdxPage';

function CompatibilityPage() {
  return (
    <MdxPage
      title="Known compatibility differences and accessibility limitations"
      description="Where @tecton-mui/ui intentionally differs from upstream MUI, and known gaps."
      section={{ title: 'Guides' }}
      Content={Content}
    />
  );
}

export const Route = createFileRoute('/guides/compatibility')({
  component: CompatibilityPage,
});
