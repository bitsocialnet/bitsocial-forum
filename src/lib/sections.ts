import { FORUM_CATEGORIES, type ForumCategory, type ForumSection } from '../data/sections';

export function getSection(code: string | undefined, categories: ForumCategory[] = FORUM_CATEGORIES): ForumSection | undefined {
  if (!code) return undefined;
  for (const category of categories) {
    const section = category.sections.find((candidate) => candidate.code === code);
    if (section) return section;
  }
  return undefined;
}

export function getSectionCategory(code: string, categories: ForumCategory[] = FORUM_CATEGORIES): ForumCategory | undefined {
  return categories.find((category) => category.sections.some((section) => section.code === code));
}

// Candidates are stored highest-ranked first, so the winner is the first one. A section with no
// candidates has no community yet.
export function getSectionWinner(section: ForumSection): string | undefined {
  return section.candidates[0];
}

// The section a community competes for, so its pages can show the section badge.
export function getSectionForCommunity(address: string | undefined, categories: ForumCategory[] = FORUM_CATEGORIES): ForumSection | undefined {
  if (!address) return undefined;
  for (const category of categories) {
    const section = category.sections.find((candidate) => candidate.candidates.includes(address));
    if (section) return section;
  }
  return undefined;
}
