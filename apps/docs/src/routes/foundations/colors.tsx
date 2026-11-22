import { createFileRoute } from '@tanstack/react-router';
import Content from '../../content/foundations/colors.mdx';
import { MdxPage } from '../../components/MdxPage';

function ColorsPage() {
  return (
    <MdxPage
      title="Colors"
      description="Every Tecton color token with its light and dark value, and how to use it."
      section={{ title: 'Foundations' }}
      Content={Content}
    />
  );
}

export const Route = createFileRoute('/foundations/colors')({
  component: ColorsPage,
});
