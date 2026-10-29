import type { Comment } from '@bitsocial/bitsocial-react-hooks';

// Tags are pkc flairs. A topic list filtered by tag lives at `<list path>?tag=<flair text>`.
export const TAG_SEARCH_PARAM = 'tag';

export function withTag(path: string, tag: string | undefined): string {
  if (!tag) return path;
  return `${path}?${new URLSearchParams({ [TAG_SEARCH_PARAM]: tag }).toString()}`;
}

// The shape useFeed takes as `filter`; the key tells the hooks' feed cache filters apart.
export function getTagFeedFilter(tag: string) {
  return {
    key: `tag:${tag}`,
    filter: (comment: Comment) => Boolean(comment.flairs?.some((flair: { text?: string }) => flair.text === tag)),
  };
}
