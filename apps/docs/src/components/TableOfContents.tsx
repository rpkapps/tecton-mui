import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Typography from '@tecton-mui/ui/Typography';
import Link from '@tecton-mui/ui/Link';

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/** Collects `h2[id]` / `h3[id]` headings of the article (text without the anchor icon). */
function collect(root: HTMLElement): TocItem[] {
  return [...root.querySelectorAll<HTMLElement>('h2[id], h3[id]')]
    .filter((h) => !h.closest('[data-demo-preview], [data-toc-ignore]'))
    .map((h) => ({
      id: h.id,
      text: (h.querySelector(':scope > span')?.textContent ?? h.textContent ?? '').trim(),
      level: h.tagName === 'H2' ? 2 : 3,
    }));
}

const sameItems = (a: TocItem[], b: TocItem[]) =>
  a.length === b.length && a.every((x, i) => x.id === b[i].id && x.text === b[i].text);

/**
 * "On this page": built from the rendered headings of `contentRef` (so lazily rendered sections,
 * e.g. upstream examples, are picked up), with scroll-spy highlighting of the current section.
 */
export function TableOfContents({
  contentRef,
  pathname,
}: {
  contentRef: React.RefObject<HTMLElement | null>;
  pathname: string;
}) {
  const [items, setItems] = React.useState<TocItem[]>([]);
  const [active, setActive] = React.useState<string | null>(null);

  React.useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = collect(root);
        setItems((prev) => (sameItems(prev, next) ? prev : next));
      });
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [contentRef, pathname]);

  React.useEffect(() => {
    if (!items.length) return;
    let frame = 0;
    const spy = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let current: string | null = items[0].id;
        for (const item of items) {
          const el = document.getElementById(item.id);
          if (el && el.getBoundingClientRect().top <= 120) current = item.id;
        }
        // At the very bottom, the last section is the current one.
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
          current = items[items.length - 1].id;
        }
        setActive(current);
      });
    };
    spy();
    window.addEventListener('scroll', spy, { passive: true });
    window.addEventListener('resize', spy);
    return () => {
      window.removeEventListener('scroll', spy);
      window.removeEventListener('resize', spy);
      cancelAnimationFrame(frame);
    };
  }, [items]);

  if (items.length < 2) return null;
  return (
    <Box component="nav" aria-label="On this page" data-pagefind-ignore="all">
      <Typography
        component="h2"
        variant="caption"
        sx={{
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'text.primary',
          mb: 1.5,
        }}
      >
        On this page
      </Typography>
      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          m: 0,
          p: 0,
          borderInlineStart: '1px solid var(--tecton-color-divider-subtle)',
        }}
      >
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <li key={item.id}>
              <Link
                href={`#${item.id}`}
                underline="none"
                aria-current={isActive ? 'location' : undefined}
                sx={{
                  display: 'block',
                  py: 0.5,
                  paddingInlineStart: (t) => t.spacing(item.level === 3 ? 3 : 1.5),
                  marginInlineStart: '-1px',
                  borderInlineStart: '2px solid',
                  borderColor: isActive ? 'var(--docs-accent)' : 'transparent',
                  typography: 'body2',
                  fontSize: 13,
                  lineHeight: 1.45,
                  color: isActive ? 'var(--docs-accent)' : 'text.secondary',
                  fontWeight: isActive ? 600 : 400,
                  '&:hover': { color: 'text.primary' },
                }}
              >
                {item.text}
              </Link>
            </li>
          );
        })}
      </Box>
    </Box>
  );
}
