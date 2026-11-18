import { createFileRoute } from '@tanstack/react-router';
import type { ComponentType } from 'react';
import type { MDXProps } from 'mdx/types';
import Typography from '@tecton-mui/ui/Typography';
import Alert from '@tecton-mui/ui/Alert';
import { PageHeader } from '../../components/PageHeader';

// The UI package changelog (written by Changesets) is compiled as Markdown when it exists.
const changelogs = import.meta.glob<{ default: ComponentType<MDXProps> }>(
  '../../../../../packages/ui/CHANGELOG.md',
);

export const Route = createFileRoute('/releases/changelog')({
  loader: async () => {
    const load = Object.values(changelogs)[0];
    return { Changelog: load ? (await load()).default : null };
  },
  component: ChangelogPage,
});

function ChangelogPage() {
  const { Changelog } = Route.useLoaderData();
  return (
    <article>
      <PageHeader
        title="Changelog"
        description="Release notes of @tecton-mui/ui."
        crumbs={[{ title: 'Releases' }]}
      />
      {Changelog ? (
        // The changelog's own top-level title duplicates the page title.
        <Changelog components={{ h1: () => null }} />
      ) : (
        <>
          <Alert severity="info" variant="outlined" sx={{ mb: 2, width: 'auto' }}>
            No release has been published yet.
          </Alert>
          <Typography>
            Release notes appear here with the first published version of the package. Each entry
            lists new features, fixes and any changes that need action in your application.
          </Typography>
        </>
      )}
    </article>
  );
}
