import { describe, expect, it } from 'vitest';
import { FORUM_CATEGORIES, type ForumCategory } from '../../data/sections';
import { getSection, getSectionCategory, getSectionForCommunity, getSectionWinner } from '../sections';

const allSections = FORUM_CATEGORIES.flatMap((category) => category.sections);

describe('forum taxonomy', () => {
  it('uses unique, URL-safe section codes', () => {
    const codes = allSections.map((section) => section.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const code of codes) {
      expect(code).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it('gives every category at least one section and every section a title and description', () => {
    for (const category of FORUM_CATEGORIES) {
      expect(category.sections.length).toBeGreaterThan(0);
    }
    for (const section of allSections) {
      expect(section.title.trim()).not.toBe('');
      expect(section.description.trim()).not.toBe('');
    }
  });

  it('lists each candidate community once per section', () => {
    for (const section of allSections) {
      expect(new Set(section.candidates).size).toBe(section.candidates.length);
    }
  });
});

describe('section lookup', () => {
  const categories: ForumCategory[] = [
    {
      title: 'Test',
      sections: [{ code: 'chain', color: '#f59e0b', title: 'Chain', description: 'd', flairs: [], candidates: ['first.bso', 'second.bso'] }],
    },
  ];

  it('finds a section and its category by code', () => {
    expect(getSection('chain', categories)?.title).toBe('Chain');
    expect(getSectionCategory('chain', categories)?.title).toBe('Test');
    expect(getSection('missing', categories)).toBeUndefined();
    expect(getSection(undefined, categories)).toBeUndefined();
  });

  it('picks the highest-ranked candidate as the winner', () => {
    const section = getSection('chain', categories);
    expect(section && getSectionWinner(section)).toBe('first.bso');
    expect(getSectionWinner({ ...section!, candidates: [] })).toBeUndefined();
  });

  it('finds the section a community competes for', () => {
    expect(getSectionForCommunity('second.bso', categories)?.code).toBe('chain');
    expect(getSectionForCommunity('other.bso', categories)).toBeUndefined();
    expect(getSectionForCommunity(undefined, categories)).toBeUndefined();
  });
});
