// Emits the TSX of a synced documentation page from the block model of lib/markdown.mjs.
// Text is always emitted as JS string expressions (`{"..."}`), so upstream prose can never be
// interpreted as JSX or change whitespace.

export const str = (value) => JSON.stringify(value);
const text = (value) => (value ? `{${str(value)}}` : '');

/** Anchor of a heading on the portal (same algorithm as apps/docs/src/lib/slug.ts `toAnchor`). */
export function toAnchor(value) {
  return value
    .toLowerCase()
    .replace(/[`'"’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Anchor that mui.com generates for a heading (used to resolve upstream `#hash` links). */
export function upstreamHash(value) {
  return value
    .toLowerCase()
    .replace(/[!@#$%^&*()=_+[\]{}`~;:'"|,.<>/?\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Rewrites MUI package imports inside prose code snippets to the public @tecton-mui/ui entries. */
export function rewriteSnippetImports(code) {
  return code.replace(
    /(from\s+|import\s+|require\()(['"])@mui\/(material|lab)(\/[\w-]+)?\2/g,
    (all, lead, quote, pkg, sub) => {
      if (sub === '/styles') return `${lead}${quote}@tecton-mui/ui/styles${quote}`;
      return `${lead}${quote}@tecton-mui/ui${sub ?? ''}${quote}`;
    },
  );
}

const VOID_HTML = new Set(['br', 'hr', 'img', 'source', 'wbr']);
const INLINE_HTML = new Set([
  'kbd',
  'b',
  'strong',
  'em',
  'i',
  'code',
  'sup',
  'sub',
  'span',
  'small',
]);

/**
 * @param {object} ctx
 * @param {(href: string) => string} ctx.resolveLink  maps an upstream href to a portal href
 * @param {(html: string) => object} ctx.parseHtmlFragment
 * @param {Map<string, object>} ctx.definitions       link reference definitions
 * @param {string[]} ctx.warnings                     collects dropped constructs
 */
export function createEmitter(ctx) {
  function attrs(map) {
    return Object.entries(map)
      .filter(([, v]) => v !== undefined && v !== null && v !== false)
      .map(([k, v]) => (v === true ? k : `${k}={${typeof v === 'string' ? str(v) : v}}`))
      .join(' ');
  }

  function link(href, children) {
    return `<M.a ${attrs({ href: ctx.resolveLink(href) })}>${children}</M.a>`;
  }

  function image(src, alt) {
    return `<M.img ${attrs({ src: ctx.resolveLink(src), alt: alt ?? '' })} />`;
  }

  /** Inline nodes, with inline HTML tags (`<kbd>`, `<br>`) paired across sibling nodes. */
  function inline(nodes = []) {
    let out = '';
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      if (node.type === 'html') {
        const open = /^<([a-z]+)(\s[^>]*)?>$/i.exec(node.value.trim());
        const voidTag = /^<([a-z]+)(\s[^>]*)?\/?>$/i.exec(node.value.trim());
        if (voidTag && VOID_HTML.has(voidTag[1].toLowerCase())) {
          out += voidTag[1].toLowerCase() === 'br' ? '<br />' : '';
          continue;
        }
        if (open && INLINE_HTML.has(open[1].toLowerCase())) {
          const tag = open[1].toLowerCase();
          let depth = 1;
          let j = i + 1;
          for (; j < nodes.length; j += 1) {
            const v = nodes[j].type === 'html' ? nodes[j].value.trim().toLowerCase() : '';
            if (v.startsWith(`<${tag}`) && !v.endsWith('/>')) depth += 1;
            if (v === `</${tag}>` && --depth === 0) break;
          }
          const inner = inline(nodes.slice(i + 1, j));
          out += htmlElement(tag, inner);
          i = j;
          continue;
        }
        if (/^<!--/.test(node.value)) continue;
        ctx.warnings.push(`inline HTML dropped: ${node.value.slice(0, 60)}`);
        continue;
      }
      out += phrasing(node);
    }
    return out;
  }

  function htmlElement(tag, inner) {
    if (tag === 'kbd') return `<M.kbd>${inner}</M.kbd>`;
    if (tag === 'code') return `<M.code>${inner}</M.code>`;
    if (tag === 'b' || tag === 'strong') return `<strong>${inner}</strong>`;
    if (tag === 'i' || tag === 'em') return `<em>${inner}</em>`;
    if (tag === 'sup' || tag === 'sub' || tag === 'small') return `<${tag}>${inner}</${tag}>`;
    return inner;
  }

  function phrasing(node) {
    switch (node.type) {
      case 'text':
        return text(node.value);
      case 'emphasis':
        return `<em>${inline(node.children)}</em>`;
      case 'strong':
        return `<strong>${inline(node.children)}</strong>`;
      case 'delete':
        return `<del>${inline(node.children)}</del>`;
      case 'inlineCode':
        return `<M.code>${text(node.value)}</M.code>`;
      case 'break':
        return '<br />';
      case 'link':
        return link(node.url, inline(node.children));
      case 'image':
        return image(node.url, node.alt);
      case 'linkReference': {
        const def = ctx.definitions.get(node.identifier);
        return def ? link(def.url, inline(node.children)) : inline(node.children);
      }
      case 'imageReference': {
        const def = ctx.definitions.get(node.identifier);
        return def ? image(def.url, node.alt) : '';
      }
      case 'footnoteReference':
        return '';
      default:
        ctx.warnings.push(`inline node dropped: ${node.type}`);
        return '';
    }
  }

  function codeBlock(value, lang) {
    const language = (lang ?? '').split(/\s/)[0] || undefined;
    const code = /^(jsx?|tsx?)$/.test(language ?? '') ? rewriteSnippetImports(value) : value;
    return `<CodeBlock ${attrs({ code, language })} />`;
  }

  function htmlBlock(value) {
    const fragment = ctx.parseHtmlFragment(value);
    return fragment.childNodes.map(htmlNode).join('');
  }

  function htmlNode(node) {
    if (node.nodeName === '#text') return node.value.trim() ? text(node.value) : '';
    if (node.nodeName === '#comment') return '';
    const tag = node.tagName;
    const attr = Object.fromEntries((node.attrs ?? []).map((a) => [a.name, a.value]));
    const children = tag === 'video' ? '' : (node.childNodes ?? []).map(htmlNode).join('');
    switch (tag) {
      case 'hr':
        return '<M.hr />';
      case 'br':
        return '<br />';
      case 'img':
        return image(attr.src, attr.alt);
      case 'video': {
        const sources = (node.childNodes ?? [])
          .filter((c) => c.tagName === 'source')
          .map((c) => Object.fromEntries(c.attrs.map((a) => [a.name, a.value])));
        const inner = sources
          .map((s) => `<source ${attrs({ src: ctx.resolveLink(s.src), type: s.type })} />`)
          .join('');
        return `<M.video ${attrs({ width: attr.width, height: attr.height })}>${inner}</M.video>`;
      }
      case 'p':
        return `<M.p>${children}</M.p>`;
      case 'a':
        return link(attr.href ?? '', children);
      default:
        if (INLINE_HTML.has(tag)) return htmlElement(tag, children);
        ctx.warnings.push(`HTML element unwrapped: <${tag}>`);
        return children;
    }
  }

  function listItem(item, spread) {
    const parts = item.children.map((child) =>
      child.type === 'paragraph' && !spread ? inline(child.children) : block(child),
    );
    const checkbox =
      typeof item.checked === 'boolean'
        ? `<input type="checkbox" disabled ${item.checked ? 'checked ' : ''}/> `
        : '';
    return `<M.li>${checkbox}${parts.join('')}</M.li>`;
  }

  function block(node) {
    switch (node.type) {
      case 'paragraph': {
        // A paragraph that only holds an image renders the image on its own.
        if (node.children.length === 1 && node.children[0].type === 'image')
          return phrasing(node.children[0]);
        return `<M.p>${inline(node.children)}</M.p>`;
      }
      case 'list': {
        const tag = node.ordered ? 'ol' : 'ul';
        const start =
          node.ordered && node.start && node.start !== 1 ? ` start={${node.start}}` : '';
        const items = node.children.map((item) => listItem(item, node.spread)).join('');
        return `<M.${tag}${start}>${items}</M.${tag}>`;
      }
      case 'code':
        return codeBlock(node.value, node.lang);
      case 'blockquote':
        return `<M.blockquote>${node.children.map(block).join('')}</M.blockquote>`;
      case 'thematicBreak':
        return '<M.hr />';
      case 'table': {
        const align = node.align ?? [];
        const cell = (tag, c, i) =>
          `<M.${tag}${align[i] ? ` style={{ textAlign: ${str(align[i])} }}` : ''}>${inline(c.children)}</M.${tag}>`;
        const [head, ...rows] = node.children;
        const headRow = `<M.tr>${head.children.map((c, i) => cell('th', c, i)).join('')}</M.tr>`;
        const bodyRows = rows
          .map((r) => `<M.tr>${r.children.map((c, i) => cell('td', c, i)).join('')}</M.tr>`)
          .join('');
        return `<M.table><M.thead>${headRow}</M.thead><M.tbody>${bodyRows}</M.tbody></M.table>`;
      }
      case 'html':
        return htmlBlock(node.value);
      case 'heading':
        return `<M.p><strong>${inline(node.children)}</strong></M.p>`;
      default:
        ctx.warnings.push(`block node dropped: ${node.type}`);
        return '';
    }
  }

  return { inline, block, codeBlock, attrs };
}
