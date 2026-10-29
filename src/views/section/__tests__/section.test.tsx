import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Section from '../section';

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
    return {
      feed: [{ cid: 'QmThread', communityAddress: 'chain-one.bso', title: 'Chain launch plan', replyCount: 2, timestamp: 1, author: { shortAddress: 'alice' } }],
      hasMore: false,
      loadMore: vi.fn(),
    };
  },
}));

vi.mock('../../../data/sections', () => ({
  FORUM_CATEGORIES: [
    {
      title: 'Bitsocial',
      sections: [
        { code: 'bso', color: '#f59e0b', title: 'BSO', description: 'Token talk', flairs: ['Chain'], candidates: ['chain-one.bso', 'chain-two.bso'] },
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
        <Routes>
          <Route path='/s/:sectionCode/:sort?' element={<Section />} />
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

describe('Section', () => {
  it('opens the highest-ranked candidate and lists the others', async () => {
    await renderAt('/s/bso');

    expect(testState.feedCalls[0]).toMatchObject({ communities: [{ name: 'chain-one.bso' }], sortType: 'active' });
    expect(container.querySelector('a[href="/c/chain-one.bso/t/QmThread"]')?.textContent).toBe('Chain launch plan');
    expect(container.querySelector('a[href="/c/chain-two.bso"]')).not.toBeNull();
    expect(container.textContent).toContain('Chain');
  });

  it('maps the sort tab in the URL to a pkc page sort', async () => {
    await renderAt('/s/bso/new');

    expect(testState.feedCalls[0]).toMatchObject({ sortType: 'new' });
    expect(container.querySelector('a[aria-current="page"]')?.getAttribute('href')).toBe('/s/bso/new');
  });

  it('filters the topic list by the tag in the URL and keeps it across sort tabs', async () => {
    await renderAt('/s/bso/new?tag=Chain');

    expect(testState.feedCalls[0]).toMatchObject({ sortType: 'new', filter: { key: 'tag:Chain' } });
    expect(container.querySelector('a[href="/s/bso/top?tag=Chain"]')).not.toBeNull();
    // The active tag links back to the unfiltered list.
    expect(container.querySelector('a[aria-current="true"]')?.getAttribute('href')).toBe('/s/bso/new');
  });

  it('treats an unknown sort tab as a missing page', async () => {
    await renderAt('/s/bso/sideways');

    expect(testState.feedCalls).toHaveLength(0);
    expect(container.textContent).toContain('section.notFound');
  });

  it('explains an empty section instead of loading a feed', async () => {
    await renderAt('/s/empty');

    expect(testState.feedCalls).toHaveLength(0);
    expect(container.textContent).toContain('section.noCommunityTitle');
  });

  it('reports an unknown section code', async () => {
    await renderAt('/s/missing');

    expect(container.textContent).toContain('section.notFound');
  });
});
