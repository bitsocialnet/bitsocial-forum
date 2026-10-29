// Topic list tabs, named as in Discourse, mapped to pkc page sorts. "Latest" is bump order.
export const TOPIC_SORTS = {
  latest: 'active',
  new: 'new',
  top: 'topAll',
} as const;

export type TopicSort = keyof typeof TOPIC_SORTS;

export const DEFAULT_TOPIC_SORT: TopicSort = 'latest';

// An absent segment is the default tab; an unknown one is not a page.
export function parseTopicSort(segment: string | undefined): TopicSort | undefined {
  if (segment === undefined) return DEFAULT_TOPIC_SORT;
  return Object.hasOwn(TOPIC_SORTS, segment) ? (segment as TopicSort) : undefined;
}
