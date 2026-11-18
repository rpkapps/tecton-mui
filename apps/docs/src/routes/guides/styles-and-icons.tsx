import { createFileRoute } from '@tanstack/react-router';
import Content from '../../content/guides/styles-and-icons.mdx';
import { MdxPage } from '../../components/MdxPage';

function StylesAndIconsPage() {
  return (
    <MdxPage
      title="Tecton fonts, icons and style entry points"
      description="What each stylesheet contains, who loads it, and every available Tecton icon."
      section={{ title: 'Guides' }}
      Content={Content}
    />
  );
}

export const Route = createFileRoute('/guides/styles-and-icons')({
  component: StylesAndIconsPage,
});
