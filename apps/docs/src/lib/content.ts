// Lazy content registries. Each page's MDX and demos load with the page's route (code split),
// so no demo code is shipped to pages that do not use it.
import type { ComponentType } from 'react';
import type { MDXProps } from 'mdx/types';
import type { LoadedDemo } from '../components/Demo';

type MdxModule = { default: ComponentType<MDXProps> };

const componentContent = import.meta.glob<MdxModule>('../content/components/*.mdx');
const demoModules = import.meta.glob<{ default: ComponentType }>('../demos/*/*.tsx');
const demoSources = import.meta.glob<string>('../demos/*/*.tsx', {
  query: '?raw',
  import: 'default',
});
const apiData = import.meta.glob<ApiDoc>('../generated/api/*.json', { import: 'default' });

export interface ApiProp {
  name: string;
  kind: 'prop' | 'event' | 'slot';
  type: string;
  required: boolean;
  defaultValue: string | null;
  description: string;
  deprecated: string | boolean | null;
}

export interface ApiDoc {
  name: string;
  package: string;
  subpath: string;
  exportName: string;
  hasDefault: boolean;
  rootExport: boolean;
  summary: string;
  inherits: string | null;
  inheritedCount: number;
  inheritedFrom: string[];
  props: ApiProp[];
}

export async function loadComponentContent(slug: string) {
  const loader = componentContent[`../content/components/${slug}.mdx`];
  return loader ? (await loader()).default : null;
}

/** Loads every demo in `src/demos/<folder>/` with its source text. */
export async function loadDemos(folder: string): Promise<Record<string, LoadedDemo>> {
  const prefix = `../demos/${folder}/`;
  const keys = Object.keys(demoModules).filter((k) => k.startsWith(prefix));
  const entries = await Promise.all(
    keys.map(async (key) => {
      const [mod, code] = await Promise.all([demoModules[key](), demoSources[key]()]);
      const name = key.slice(prefix.length).replace(/\.tsx$/, '');
      return [name, { Component: mod.default, code }] as const;
    }),
  );
  return Object.fromEntries(entries);
}

export async function loadApi(names: string[]): Promise<ApiDoc[]> {
  const docs = await Promise.all(
    names.map((name) => apiData[`../generated/api/${name}.json`]?.() ?? Promise.resolve(null)),
  );
  return docs.filter((d): d is ApiDoc => d != null);
}
