import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Section from '../section';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const act = (React as { act?: (cb: () => void | Promise<void>) => void | Promise<void> }).act as (cb: () => void | Promise<void>) => void | Promise<void>;

const testState = vi.hoisted(() => ({
  feedCalls: [] as Array<{ communities?: unknown[]; sortType?: string }>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@bitsocial/bitsocial-react-hooks', () => ({
  useFeed: (options: { communities?: unknown[]; sortType?: string }) => {
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
        { code: 'key', color: '#22d3ee', title: 'Key', description: 'Held by a key', flairs: [], candidates: ['12D3KooWKYshQ7mJp4Zr8tVwX2nB6cL9dFgH3kRsT5uYaEiOoPq1'] },
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
          <Route path='/:sectionCode/:sort?' element={<Section />} />
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
    await renderAt('/bso');

    expect(testState.feedCalls[0]).toMatchObject({ communities: [{ name: 'chain-one.bso' }], sortType: 'active' });
    expect(container.querySelector('a[href="/c/chain-one.bso/t/QmThread"]')?.textContent).toBe('Chain launch plan');
    expect(container.querySelector('a[href="/c/chain-two.bso"]')).not.toBeNull();
    expect(container.textContent).toContain('Chain');
  });

  it('maps the sort tab in the URL to a pkc page sort', async () => {
    await renderAt('/bso/new');

    expect(testState.feedCalls[0]).toMatchObject({ sortType: 'new' });
    expect(container.querySelector('a[aria-current="page"]')?.getAttribute('href')).toBe('/bso/new');
  });

  it('links tags to a search scoped to the section', async () => {
    await renderAt('/bso');

    expect(container.querySelector('a[href="/search?q=section%3Abso+tag%3AChain"]')?.textContent).toBe('Chain');
  });

  it('shows the full address of the community holding the section and copies it', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    const address = '12D3KooWKYshQ7mJp4Zr8tVwX2nB6cL9dFgH3kRsT5uYaEiOoPq1';
    await renderAt('/key');

    expect(container.querySelector(`a[href="/c/${address}"]`)?.textContent).toBe(address);
    await act(async () => {
      container.querySelector<HTMLButtonElement>('button[aria-label="section.copyAddress"]')?.click();
    });
    expect(writeText).toHaveBeenCalledWith(address);
    expect(container.querySelector('[role="status"]')?.textContent).toBe('section.addressCopied');
    vi.unstubAllGlobals();
  });

  it('treats an unknown sort tab as a missing page', async () => {
    await renderAt('/bso/sideways');

    expect(testState.feedCalls).toHaveLength(0);
    expect(container.textContent).toContain('section.notFound');
  });

  it('explains an empty section instead of loading a feed', async () => {
    await renderAt('/empty');

    expect(testState.feedCalls).toHaveLength(0);
    expect(container.textContent).toContain('section.noCommunityTitle');
  });

  it('reports an unknown section code', async () => {
    await renderAt('/missing');

    expect(container.textContent).toContain('section.notFound');
  });
});
