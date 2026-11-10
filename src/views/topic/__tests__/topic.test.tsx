import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { HashRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Topic from '../topic';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const act = (React as { act?: (cb: () => void | Promise<void>) => void | Promise<void> }).act as (cb: () => void | Promise<void>) => void | Promise<void>;

const testState = vi.hoisted(() => ({
  comment: {} as Record<string, unknown>,
  replies: [] as Array<Record<string, unknown>>,
  repliesHasMore: false,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@bitsocial/bitsocial-react-hooks', () => ({
  useComment: () => testState.comment,
  useReplies: () => ({ replies: testState.replies, hasMore: testState.repliesHasMore, loadMore: vi.fn() }),
}));

vi.mock('../../../data/sections', () => ({
  FORUM_CATEGORIES: [
    {
      title: 'Bitsocial',
      sections: [{ code: 'bso', color: '#f59e0b', title: 'BSO', description: 'Token talk', flairs: ['Chain'], candidates: ['12D3KooWSectionCommunity'] }],
    },
  ],
}));

const loadedComment = {
  cid: 'QmTopic',
  communityAddress: 'askseedit.bso',
  title: 'Dark mode',
  content: 'Please add it',
  timestamp: 1_700_000_000,
  updatedAt: 1_700_000_100,
  state: 'succeeded',
  author: { address: '12D3KooWAuthor', shortAddress: 'Author' },
};

let container: HTMLDivElement;
let root: Root;

async function renderAt(path: string) {
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path='/c/:communityAddress/t/:commentCid' element={<Topic />} />
        </Routes>
      </MemoryRouter>,
    );
  });
}

beforeEach(() => {
  testState.comment = loadedComment;
  testState.replies = [];
  testState.repliesHasMore = false;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe('Topic', () => {
  it('keeps the topic open when a post age is clicked', async () => {
    window.location.hash = '#/c/askseedit.bso/t/QmTopic';
    await act(async () => {
      root.render(
        <HashRouter>
          <Routes>
            <Route path='/c/:communityAddress/t/:commentCid' element={<Topic />} />
            <Route path='*' element={<p>route-not-found</p>} />
          </Routes>
        </HashRouter>,
      );
    });

    const age = container.querySelector<HTMLElement>('article header [title]');
    expect(age).not.toBeNull();
    await act(async () => {
      age!.click();
      // jsdom queues the hash navigation's popstate as a task.
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(container.textContent).not.toContain('route-not-found');
    expect(container.querySelector('h1')?.textContent).toBe('Dark mode');
    expect(window.location.hash).toBe('#/c/askseedit.bso/t/QmTopic');
  });

  it('shows the loading state, not an empty topic, while only the placeholder comment exists', async () => {
    testState.comment = { cid: 'QmTopic', state: 'fetching-ipfs' };
    testState.repliesHasMore = true;
    await renderAt('/c/askseedit.bso/t/QmTopic');

    expect(container.querySelector('h1')?.textContent).toBe('topic.loading');
    expect(container.querySelector('article')).toBeNull();
    expect(container.textContent).not.toContain('topic.loadMoreReplies');
    expect(container.textContent).not.toContain('topic.reply');
  });

  it('reports a topic that failed to load instead of rendering it as untitled', async () => {
    testState.comment = { cid: 'QmTopic', state: 'failed', error: new Error('invalid signature') };
    testState.repliesHasMore = true;
    await renderAt('/c/askseedit.bso/t/QmTopic');

    expect(container.querySelector('h1')?.textContent).toBe('topic.loadFailed');
    expect(container.querySelector('article')).toBeNull();
    expect(container.textContent).not.toContain('topic.loadMoreReplies');
  });

  it('renders a loaded topic and its replies', async () => {
    testState.replies = [{ cid: 'QmReply', content: 'Agreed', timestamp: 1_700_000_050, author: { address: '12D3KooWReplier' } }];
    await renderAt('/c/askseedit.bso/t/QmTopic');

    expect(container.querySelector('h1')?.textContent).toBe('Dark mode');
    expect(container.querySelectorAll('article')).toHaveLength(2);
  });
});
