import type { Comment } from '@bitsocial/bitsocial-react-hooks';

// Search queries are free text plus optional tokens, as in Discourse's advanced search:
//   tag:Release  tag:"Feature request"  section:bso  community:askseedit.bso
// Free text matches topic titles and bodies; every tag must be present; section or community scopes
// which communities are searched (all section communities otherwise).
export type SearchQuery = {
  text: string;
  tags: string[];
  section?: string;
  community?: string;
};

const TOKEN_PATTERN = /\b(tag|section|community):(?:"([^"]*)"|(\S+))/gi;

export function parseSearchQuery(raw: string): SearchQuery {
  const query: SearchQuery = { text: '', tags: [] };
  const text = raw.replace(TOKEN_PATTERN, (_match, key: string, quoted: string | undefined, bare: string | undefined) => {
    const value = (quoted ?? bare ?? '').trim();
    if (!value) return ' ';
    const name = key.toLowerCase();
    if (name === 'tag' && !query.tags.includes(value)) query.tags.push(value);
    if (name === 'section') query.section = value;
    if (name === 'community') query.community = value;
    return ' ';
  });
  query.text = text.replace(/\s+/g, ' ').trim();
  return query;
}

function formatToken(key: string, value: string): string {
  return /\s/.test(value) ? `${key}:"${value}"` : `${key}:${value}`;
}

export function formatSearchQuery(query: Partial<SearchQuery>): string {
  return [
    query.section ? formatToken('section', query.section) : '',
    query.community ? formatToken('community', query.community) : '',
    ...(query.tags ?? []).map((tag) => formatToken('tag', tag)),
    query.text ?? '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function getSearchPath(query: string | Partial<SearchQuery>): string {
  const q = typeof query === 'string' ? query.trim() : formatSearchQuery(query);
  return q ? `/search?${new URLSearchParams({ q }).toString()}` : '/search';
}

// The useFeed filter for a query, or undefined when nothing narrows the feed. The key tells the hooks'
// feed cache filters apart, so it is derived from the normalized query.
export function getSearchFeedFilter(query: SearchQuery) {
  const words = query.text.toLowerCase().split(' ').filter(Boolean);
  if (words.length === 0 && query.tags.length === 0) return undefined;

  return {
    key: `search:${formatSearchQuery({ tags: query.tags, text: words.join(' ') })}`,
    filter: (comment: Comment) => {
      const flairs: string[] = (comment.flairs ?? []).map((flair: { text?: string }) => flair.text);
      if (!query.tags.every((tag) => flairs.includes(tag))) return false;
      const haystack = `${comment.title ?? ''}\n${comment.content ?? ''}`.toLowerCase();
      return words.every((word) => haystack.includes(word));
    },
  };
}
