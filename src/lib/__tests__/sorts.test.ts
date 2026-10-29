import { describe, expect, it } from 'vitest';
import { parseTopicSort, TOPIC_SORTS } from '../sorts';

describe('parseTopicSort', () => {
  it('defaults to latest, which is bump order', () => {
    expect(parseTopicSort(undefined)).toBe('latest');
    expect(TOPIC_SORTS.latest).toBe('active');
  });

  it('accepts known tabs and rejects anything else', () => {
    expect(parseTopicSort('new')).toBe('new');
    expect(parseTopicSort('top')).toBe('top');
    expect(parseTopicSort('t')).toBeUndefined();
    expect(parseTopicSort('constructor')).toBeUndefined();
  });
});
