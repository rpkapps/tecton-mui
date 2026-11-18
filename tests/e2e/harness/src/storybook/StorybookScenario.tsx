// Renders one Tecton Storybook story (`?scenario=sb:<story-id>`) with @tecton-mui/ui inside the
// same layout the Storybook preview uses, so screenshots can be compared pixel by pixel:
// - `layout: 'padded'`: the preview body has `margin: 0; padding: 1rem` (Storybook's
//   `.sb-main-padded`);
// - the global decorator wraps every story in a 24px padded, `min-height: 100vh` box painted with
//   `--tecton-color-bg-default` / `--tecton-color-text-primary`.
import * as React from 'react';
import { GlobalStyles } from '@tecton-mui/ui';

interface Story {
  name?: string;
  args?: Record<string, unknown>;
  render: (args: Record<string, unknown>) => React.ReactNode;
}
interface StoryModule {
  meta: { title: string; args?: Record<string, unknown> };
  stories: Record<string, Story>;
}

const modules = import.meta.glob<StoryModule>('./stories/*.tsx');

/** `atoms-button--primary` -> the module whose title kebab-cases to `atoms-button`. */
async function loadStory(id: string): Promise<{ story: Story; meta: StoryModule['meta'] } | null> {
  for (const load of Object.values(modules)) {
    const mod = await load();
    const story = mod.stories[id];
    if (story) return { story, meta: mod.meta };
  }
  return null;
}

// Calls the story's render function as a component so that renders using hooks work.
function StoryHost({ story, args }: { story: Story; args: Record<string, unknown> }) {
  return <>{story.render(args)}</>;
}

const previewBody = { body: { margin: 0, padding: '1rem', boxSizing: 'border-box' } } as const;

export function StorybookScenario({ id }: { id: string }) {
  const [loaded, setLoaded] = React.useState<
    { story: Story; meta: StoryModule['meta'] } | null | undefined
  >(undefined);
  React.useEffect(() => {
    let alive = true;
    loadStory(id).then((r) => alive && setLoaded(r));
    return () => {
      alive = false;
    };
  }, [id]);
  if (loaded === undefined) return null;
  if (loaded === null) return <p data-testid="sb-missing">Unknown story {id}</p>;
  const args = { ...loaded.meta.args, ...loaded.story.args };
  return (
    <>
      <GlobalStyles styles={previewBody} />
      <div
        data-testid="sb-root"
        style={{
          padding: 24,
          minHeight: '100vh',
          background: 'var(--tecton-color-bg-default)',
          color: 'var(--tecton-color-text-primary)',
        }}
      >
        <StoryHost story={loaded.story} args={args} />
      </div>
    </>
  );
}
