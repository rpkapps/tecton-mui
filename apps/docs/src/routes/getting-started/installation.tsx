import { createFileRoute } from '@tanstack/react-router';
import Content from '../../content/getting-started/installation.mdx';
import { MdxPage } from '../../components/MdxPage';

function InstallationPage() {
  return (
    <MdxPage
      title="Installation"
      description="Add @tecton-mui/ui to a React application and load the Tecton styles."
      section={{ title: 'Getting Started' }}
      Content={Content}
    />
  );
}

export const Route = createFileRoute('/getting-started/installation')({
  component: InstallationPage,
});
