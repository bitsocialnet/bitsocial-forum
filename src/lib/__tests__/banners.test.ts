import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { FORUM_CATEGORIES } from '../../data/sections';
import { getSectionBanner, HOME_BANNER } from '../banners';

// jsdom gives import.meta.url an http scheme, so resolve from the repo root Vitest runs in.
const publicDir = path.join(process.cwd(), 'public');

describe('banners', () => {
  it('has dark and light banners for every section and for the home page', () => {
    const banners = [HOME_BANNER, ...FORUM_CATEGORIES.flatMap((category) => category.sections.map((section) => getSectionBanner(section.code)))];
    const sources = banners.flatMap((banner) => [banner.dark, banner.light]);
    const missing = sources.filter((src) => !existsSync(path.join(publicDir, src)));
    // Run `corepack yarn banners:generate` after adding a section.
    expect(missing).toEqual([]);
  });
});
