import { describe, expect, it } from 'vitest';
import { getTagFeedFilter, withTag } from '../tags';

describe('withTag', () => {
  it('adds an encoded tag to a list path, or leaves the path alone without one', () => {
    expect(withTag('/s/pkc', 'pkc-js')).toBe('/s/pkc?tag=pkc-js');
    expect(withTag('/s/5chan/new', 'Feature request')).toBe('/s/5chan/new?tag=Feature+request');
    expect(withTag('/s/pkc', undefined)).toBe('/s/pkc');
  });
});

describe('getTagFeedFilter', () => {
  it('keeps only topics carrying the flair and keys the feed by tag', () => {
    const filter = getTagFeedFilter('Bug');
    expect(filter.key).toBe('tag:Bug');
    expect(filter.filter({ flairs: [{ text: 'Bug' }] })).toBe(true);
    expect(filter.filter({ flairs: [{ text: 'Question' }] })).toBe(false);
    expect(filter.filter({})).toBe(false);
  });
});
