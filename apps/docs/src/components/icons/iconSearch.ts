import type { IconName, IconVariant } from '@tecton-mui/ui/Icon';
import { tectonIconVariants } from '../../../../../packages/ui/src/styles/tecton/generated/icons';
import { iconKeywords } from './iconKeywords';

// Read from the UI package's generated icon manifest (the data the Icon component uses), so the
// search always lists exactly the icons of the pinned Tecton version.
/** Every Tecton icon name, sorted. */
export const ICON_NAMES = Object.keys(tectonIconVariants).sort() as IconName[];

/** Variants an icon ships with; empty for multicolor brand marks. */
export function iconVariants(name: IconName): readonly IconVariant[] {
  return tectonIconVariants[name] ?? [];
}

export function isMulticolor(name: IconName): boolean {
  return iconVariants(name).length === 0;
}

const words = (text: string) =>
  text
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean);

interface Entry {
  name: IconName;
  nameWords: string[];
  keywordWords: string[];
}

const ENTRIES: Entry[] = ICON_NAMES.map((name) => ({
  name,
  nameWords: name.split('-'),
  keywordWords: [...new Set((iconKeywords[name] ?? []).flatMap(words))],
}));

/** How well one query word matches an icon (0: no match). */
function wordScore(word: string, entry: Entry): number {
  if (entry.nameWords.includes(word)) return 6;
  if (entry.nameWords.some((w) => w.startsWith(word))) return 4;
  if (entry.keywordWords.includes(word)) return 3;
  if (word.length >= 2 && entry.name.includes(word)) return 2;
  if (word.length >= 2 && entry.keywordWords.some((w) => w.startsWith(word))) return 1;
  return 0;
}

/**
 * Icons matching `query`, best match first. Every word of the query must match the icon name (as a
 * word, a word prefix or a substring) or one of its search keywords. An empty query returns every
 * icon in alphabetical order.
 */
export function searchIcons(query: string): IconName[] {
  const queryWords = words(query);
  if (queryWords.length === 0) return ICON_NAMES;
  const joined = queryWords.join('-');
  const hits: { name: IconName; score: number }[] = [];
  for (const entry of ENTRIES) {
    let score = 0;
    for (const word of queryWords) {
      const s = wordScore(word, entry);
      if (s === 0) {
        score = 0;
        break;
      }
      score += s;
    }
    if (score === 0) continue;
    if (entry.name === joined) score += 100;
    else if (entry.name.startsWith(joined)) score += 10;
    hits.push({ name: entry.name, score });
  }
  return hits.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).map((h) => h.name);
}
