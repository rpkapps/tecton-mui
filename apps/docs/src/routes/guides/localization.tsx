import { createFileRoute } from '@tanstack/react-router';
import Content from '../../content/guides/localization.mdx';
import { MdxPage } from '../../components/MdxPage';

function LocalizationPage() {
  return (
    <MdxPage
      title="LocalizationProvider, date-fns and locales"
      description="Set the date locale and translate the texts of the date and time pickers."
      section={{ title: 'Guides' }}
      Content={Content}
    />
  );
}

export const Route = createFileRoute('/guides/localization')({
  component: LocalizationPage,
});
