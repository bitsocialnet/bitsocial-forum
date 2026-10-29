import { describe, expect, it } from 'vitest';
import { formatSearchQuery, getSearchFeedFilter, getSearchPath, parseSearchQuery } from '../search';

describe('parseSearchQuery', () => {
  it('separates tokens from free text', () => {
    expect(parseSearchQuery('section:bso tag:Chain  bridge   fees')).toEqual({ text: 'bridge fees', tags: ['Chain'], section: 'bso' });
    expect(parseSearchQuery('tag:"Feature request" community:askseedit.bso')).toEqual({ text: '', tags: ['Feature request'], community: 'askseedit.bso' });
  });

  it('keeps unknown key:value text, such as URLs, as free text', () => {
    expect(parseSearchQuery('see https://docs.bitsocial.net').text).toBe('see https://docs.bitsocial.net');
  });
});

describe('formatSearchQuery and getSearchPath', () => {
  it('round-trips through the parser, quoting values with spaces', () => {
    const query = { section: '5chan', tags: ['Feature request'], text: 'dark mode' };
    expect(formatSearchQuery(query)).toBe('section:5chan tag:"Feature request" dark mode');
    expect(parseSearchQuery(formatSearchQuery(query))).toEqual(query);
  });

  it('builds the search page URL', () => {
    expect(getSearchPath({ section: 'bso', tags: ['Chain'] })).toBe('/search?q=section%3Abso+tag%3AChain');
    expect(getSearchPath('  ')).toBe('/search');
  });
});

describe('getSearchFeedFilter', () => {
  it('matches every tag and every word of the text in the title or body', () => {
    const filter = getSearchFeedFilter(parseSearchQuery('tag:Bug crash'))!;
    expect(filter.filter({ title: 'App Crash on start', flairs: [{ text: 'Bug' }] })).toBe(true);
    expect(filter.filter({ title: 'Crash', flairs: [{ text: 'Question' }] })).toBe(false);
    expect(filter.filter({ title: 'Slow start', content: 'no crash here', flairs: [{ text: 'Bug' }] })).toBe(true);
    expect(filter.filter({ title: 'Slow start', flairs: [{ text: 'Bug' }] })).toBe(false);
  });

  it('does not filter a query that only scopes communities', () => {
    expect(getSearchFeedFilter(parseSearchQuery('section:bso'))).toBeUndefined();
  });
});
