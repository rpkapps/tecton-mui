// Parses an upstream Material UI markdown page (docs/data/material/components/<dir>/<dir>.md) into
// a block model: headings, markdown (mdast) blocks, demo directives, callouts and code groups.
//
// MUI's markdown has a few extensions on top of GFM that are handled before the markdown parser:
//   {{"demo": "Name.js", ...options}}     a live demo (options: bg, iframe, defaultCodeOpen, ...)
//   {{"component": "..."}}                a docs-site React component (dropped: MUI site chrome)
//   :::info|warning|success|error ... :::  callouts
//   <codeblock storageKey="..."> ```lang title ... ``` </codeblock>   tabbed code groups
//   <p class="description">...</p>        the page lead paragraph

/** Splits a `---` frontmatter block into simple `key: value` pairs. */
export function splitFrontmatter(text) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!match) return { frontmatter: {}, body: text };
  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(line);
    if (kv) frontmatter[kv[1]] = kv[2].replace(/^'(.*)'$/, '$1').trim();
  }
  return { frontmatter, body: text.slice(match[0].length) };
}

const DIRECTIVE = /^\{\{\s*("demo"|"component")[\s\S]*\}\}\s*$/;

/**
 * Tokenizes the page body into raw chunks: `markdown` text, `directive` JSON objects, `callout`
 * (with nested chunks) and `codeblock` groups. Fenced code is never interpreted.
 */
export function tokenize(body) {
  const lines = body.split('\n');
  const root = [];
  const stack = [{ chunks: root }];
  let buffer = [];
  let fence = null;
  const flush = () => {
    if (buffer.join('').trim())
      stack.at(-1).chunks.push({ kind: 'markdown', text: buffer.join('\n') });
    buffer = [];
  };
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const fenceMatch = /^\s*(`{3,}|~{3,})/.exec(line);
    if (fence) {
      if (fenceMatch && fenceMatch[1][0] === fence[0] && fenceMatch[1].length >= fence.length) {
        fence = null;
      }
      buffer.push(line);
      continue;
    }
    if (fenceMatch) {
      fence = fenceMatch[1];
      buffer.push(line);
      continue;
    }
    if (DIRECTIVE.test(line.trim())) {
      flush();
      stack.at(-1).chunks.push({ kind: 'directive', value: JSON.parse(line.trim().slice(1, -1)) });
      continue;
    }
    const callout = /^:::(\w+)?\s*$/.exec(line.trim());
    if (callout) {
      flush();
      if (callout[1]) {
        const node = { kind: 'callout', severity: callout[1], chunks: [] };
        stack.at(-1).chunks.push(node);
        stack.push(node);
      } else if (stack.length > 1) {
        stack.pop();
      }
      continue;
    }
    if (/^<codeblock\b[^>]*>\s*$/.test(line.trim())) {
      flush();
      const group = { kind: 'codeblock', codes: [] };
      i += 1;
      let current = null;
      for (; i < lines.length && !/^<\/codeblock>\s*$/.test(lines[i].trim()); i += 1) {
        const open = /^\s*```(\S*)\s*(.*)$/.exec(lines[i]);
        if (!current && open) {
          current = { lang: open[1] || undefined, meta: open[2] || undefined, lines: [] };
        } else if (current && /^\s*```\s*$/.test(lines[i])) {
          group.codes.push({ ...current, value: current.lines.join('\n') });
          current = null;
        } else if (current) {
          current.lines.push(lines[i]);
        }
      }
      stack.at(-1).chunks.push(group);
      continue;
    }
    buffer.push(line);
  }
  flush();
  return root;
}

/** Plain text of an mdast node. */
export function mdText(node) {
  if (!node) return '';
  if (node.type === 'text' || node.type === 'inlineCode') return node.value;
  if (node.type === 'html') return '';
  return (node.children ?? []).map(mdText).join('');
}

/**
 * Parses the page into `{ frontmatter, title, description, blocks }`. Blocks:
 *   { type: 'heading', depth, children }     (h2-h4; the h1 becomes `title`)
 *   { type: 'node', node }                   (an mdast block node)
 *   { type: 'demo', name, options }
 *   { type: 'callout', severity, blocks }
 *   { type: 'code', codes: [{ lang, meta, value }] }
 */
export function parsePage(text, { parseMarkdown }) {
  const { frontmatter, body } = splitFrontmatter(text);
  let title = frontmatter.title ?? '';
  let description = null;
  const convert = (chunks) => {
    const blocks = [];
    for (const chunk of chunks) {
      if (chunk.kind === 'directive') {
        if (chunk.value.demo) {
          const { demo, ...options } = chunk.value;
          blocks.push({ type: 'demo', name: demo.replace(/\.(js|tsx?)$/, ''), options });
        }
        // `component` directives render MUI site chrome (link headers, ads): dropped.
      } else if (chunk.kind === 'callout') {
        blocks.push({ type: 'callout', severity: chunk.severity, blocks: convert(chunk.chunks) });
      } else if (chunk.kind === 'codeblock') {
        blocks.push({ type: 'code', codes: chunk.codes });
      } else {
        const tree = parseMarkdown(chunk.text);
        for (const node of tree.children) {
          if (node.type === 'heading' && node.depth === 1) {
            title = mdText(node);
          } else if (node.type === 'heading') {
            blocks.push({ type: 'heading', depth: node.depth, children: node.children });
          } else if (node.type === 'html' && /^<p class="description">/.test(node.value)) {
            const inner = node.value
              .replace(/^<p class="description">/, '')
              .replace(/<\/p>\s*$/, '');
            description = parseMarkdown(inner).children[0]?.children ?? [];
          } else if (node.type === 'html' && /^<!--[\s\S]*-->$/.test(node.value.trim())) {
            // Authoring comments.
          } else if (node.type === 'definition') {
            // Link reference definitions are resolved by the emitter.
            blocks.push({ type: 'definition', node });
          } else {
            blocks.push({ type: 'node', node });
          }
        }
      }
    }
    return blocks;
  };
  const blocks = convert(tokenize(body));
  return { frontmatter, title, description, blocks };
}
