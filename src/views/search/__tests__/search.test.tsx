import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SearchBar from '../../../components/search-bar';
import Search from '../search';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const act = (React as { act?: (cb: () => void | Promise<void>) => void | Promise<void> }).act as (cb: () => void | Promise<void>) => void | Promise<void>;

const testState = vi.hoisted(() => ({
  feedCalls: [] as Array<{ communities?: unknown[]; sortType?: string; filter?: { key: string } }>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@bitsocial/bitsocial-react-hooks', () => ({
  useFeed: (options: { communities?: unknown[]; sortType?: string; filter?: { key: string } }) => {
    testState.feedCalls.push(options);
    return { feed: [], hasMore: false, loadMore: vi.fn() };
  },
}));

vi.mock('../../../data/sections', () => ({
  FORUM_CATEGORIES: [
    {
      title: 'Bitsocial',
      sections: [
        { code: 'bso', color: '#f59e0b', title: 'BSO', description: 'Token talk', flairs: ['Chain'], candidates: ['chain-one.bso'] },
        { code: 'seedit', color: '#22d3ee', title: 'Seedit', description: 'Client', flairs: ['Bug'], candidates: ['seedit-one.bso'] },
        { code: 'empty', color: '#6b7280', title: 'Empty', description: 'Nobody yet', flairs: [], candidates: [] },
      ],
    },
  ],
}));

let container: HTMLDivElement;
let root: Root;

async function renderAt(path: string) {
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <SearchBar />
        <Routes>
          <Route path='/search' element={<Search />} />
        </Routes>
      </MemoryRouter>,
    );
  });
}

beforeEach(() => {
  testState.feedCalls = [];
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe('Search', () => {
  it('fills the search bar with the query and scopes a section tag search to that section', async () => {
    await renderAt('/search?q=section%3Abso+tag%3AChain');

    expect(container.querySelector('input[type="search"]')?.getAttribute('value')).toBe('section:bso tag:Chain');
    expect(testState.feedCalls[0]).toMatchObject({ communities: [{ name: 'chain-one.bso' }], sortType: 'new', filter: { key: 'search:tag:Chain' } });
    // Each chip removes only its own part: the section chip keeps the tag, the tag chip keeps the section.
    const removeLinks = [...container.querySelectorAll('a[aria-label="search.removeFilter"]')].map((link) => link.getAttribute('href'));
    expect(removeLinks).toEqual(['/search?q=tag%3AChain', '/search?q=section%3Abso']);
  });

  it('searches every section community when the query is not scoped', async () => {
    await renderAt('/search?q=bridge');

    expect(testState.feedCalls[0]).toMatchObject({ communities: [{ name: 'chain-one.bso' }, { name: 'seedit-one.bso' }] });
  });

  it('offers tags to browse before anything is searched', async () => {
    await renderAt('/search');

    expect(testState.feedCalls).toHaveLength(0);
    expect(container.querySelector('a[href="/search?q=section%3Aseedit+tag%3ABug"]')?.textContent).toBe('Bug');
  });

  it('searches the community when a query names both a community and an unknown section', async () => {
    await renderAt('/search?q=section%3Abogus+community%3Aaskseedit.bso+tag%3ABug');

    expect(container.textContent).not.toContain('search.unknownSection');
    expect(testState.feedCalls[0]).toMatchObject({ communities: [{ name: 'askseedit.bso' }], filter: { key: 'search:tag:Bug' } });
  });

  it('reports an unknown section', async () => {
    await renderAt('/search?q=section%3Abogus+tag%3ABug');

    expect(testState.feedCalls).toHaveLength(0);
    expect(container.textContent).toContain('search.unknownSection');
  });

  it('explains a section with no community instead of searching nothing', async () => {
    await renderAt('/search?q=section%3Aempty+tag%3AX');

    expect(testState.feedCalls).toHaveLength(0);
    expect(container.textContent).toContain('search.sectionHasNoCommunity');
  });
});
