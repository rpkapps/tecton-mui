import { createFileRoute } from '@tanstack/react-router';
import Content from '../../content/guides/theming.mdx';
import { MdxPage } from '../../components/MdxPage';

function ThemingPage() {
  return (
    <MdxPage
      title="ThemeProvider and shared light/dark mode"
      description="How the Tecton theme is provided, customised and switched between modes."
      section={{ title: 'Guides' }}
      Content={Content}
    />
  );
}

export const Route = createFileRoute('/guides/theming')({
  component: ThemingPage,
});
