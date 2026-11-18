// Markdown/HTML parsers used by the sync. They are not dependencies of their own: they are resolved
// through packages the docs app already depends on (`@mdx-js/rollup`, `remark-gfm`) and through
// the workspace's `jsdom` (parse5), so the sync adds no packages to the lockfile.
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

function resolveChain(fromDir, names) {
  let req = createRequire(join(fromDir, 'package.json'));
  let resolved;
  for (const name of names) {
    resolved = req.resolve(name);
    req = createRequire(resolved);
  }
  return pathToFileURL(resolved).href;
}

export async function loadParsers(repo) {
  const docs = join(repo, 'apps/docs');
  const [{ fromMarkdown }, { gfm }, { gfmFromMarkdown }, parse5, ts] = await Promise.all([
    import(
      resolveChain(docs, [
        '@mdx-js/rollup',
        '@mdx-js/mdx',
        'remark-parse',
        'mdast-util-from-markdown',
      ])
    ),
    import(resolveChain(docs, ['remark-gfm', 'micromark-extension-gfm'])),
    import(resolveChain(docs, ['remark-gfm', 'mdast-util-gfm'])),
    import(resolveChain(repo, ['jsdom', 'parse5'])),
    import(resolveChain(repo, ['typescript'])),
  ]);
  return {
    parseMarkdown: (text) =>
      fromMarkdown(text, { extensions: [gfm()], mdastExtensions: [gfmFromMarkdown()] }),
    parseHtmlFragment: (html) => parse5.parseFragment(html),
    ts: ts.default ?? ts,
  };
}
