import type { ComponentType } from 'react';
import type { MDXProps } from 'mdx/types';
import { PageHeader, type Crumb } from './PageHeader';

/** Static content page: header (title + description) followed by the MDX body. */
export function MdxPage({
  title,
  description,
  section,
  Content,
}: {
  title: string;
  description?: string;
  section?: Crumb;
  Content: ComponentType<MDXProps>;
}) {
  return (
    <article>
      <PageHeader title={title} description={description} crumbs={section ? [section] : []} />
      <Content />
    </article>
  );
}
