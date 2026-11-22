import { createFileRoute } from '@tanstack/react-router';
import Content from '../../content/foundations/spacing-and-radius.mdx';
import { MdxPage } from '../../components/MdxPage';

function SpacingAndRadiusPage() {
  return (
    <MdxPage
      title="Spacing and radius"
      description="The Tecton spacing, corner radius, border width and icon size scales."
      section={{ title: 'Foundations' }}
      Content={Content}
    />
  );
}

export const Route = createFileRoute('/foundations/spacing-and-radius')({
  component: SpacingAndRadiusPage,
});
