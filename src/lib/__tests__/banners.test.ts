import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { FORUM_CATEGORIES } from '../../data/sections';
import { getSectionBannerSrc, HOME_BANNER_SRC } from '../banners';

// jsdom gives import.meta.url an http scheme, so resolve from the repo root Vitest runs in.
const publicDir = path.join(process.cwd(), 'public');

describe('banners', () => {
  it('has a generated banner for every section and for the home page', () => {
    const sources = [HOME_BANNER_SRC, ...FORUM_CATEGORIES.flatMap((category) => category.sections.map((section) => getSectionBannerSrc(section.code)))];
    const missing = sources.filter((src) => !existsSync(path.join(publicDir, src)));
    // Run `corepack yarn banners:generate` after adding a section.
    expect(missing).toEqual([]);
  });
});
