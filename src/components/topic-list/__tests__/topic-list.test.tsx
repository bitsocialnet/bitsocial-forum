import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import communitiesStore from '@bitsocial/bitsocial-react-hooks/dist/stores/communities/index.js';
import LatestTopic from '../../latest-topic';
import TopicList from '..';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const act = (React as { act?: (cb: () => void | Promise<void>) => void | Promise<void> }).act as (cb: () => void | Promise<void>) => void | Promise<void>;

const testState = vi.hoisted(() => ({ hasMore: true }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@bitsocial/bitsocial-react-hooks', () => ({
  // useFeed keeps hasMore true while a community has never loaded, whatever the reason.
  useFeed: () => ({ feed: [], hasMore: testState.hasMore, loadMore: vi.fn() }),
}));

let container: HTMLDivElement;
let root: Root;

const setCommunities = (communities: Record<string, Record<string, unknown>>, errors: Record<string, Error[]> = {}) =>
  act(async () => {
    communitiesStore.setState({ communities, errors });
  });

async function render(element: React.ReactNode) {
  await act(async () => {
    root.render(<MemoryRouter>{element}</MemoryRouter>);
  });
}

const renderTopicList = (communityAddresses: string[]) =>
  render(<TopicList communityAddresses={communityAddresses} sortType='active' getTagPath={(tag) => `/search?q=${tag}`} />);

const loadError = new Error('ERR_COMMUNITY_SIGNATURE_IS_INVALID');

beforeEach(async () => {
  testState.hasMore = true;
  await setCommunities({});
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe('TopicList', () => {
  it('reports a community with a stored load error whatever pkc-js is doing next', async () => {
    await setCommunities({ 'gone.bso': { address: 'gone.bso', updatingState: 'fetching-ipns' } }, { 'gone.bso': [loadError] });
    await renderTopicList(['gone.bso']);

    expect(container.textContent).toBe('topics.unreachable');
  });

  it('reports a community as soon as pkc-js marks it failed', async () => {
    await setCommunities({ 'gone.bso': { address: 'gone.bso', updatingState: 'failed' } });
    await renderTopicList(['gone.bso']);

    expect(container.textContent).toBe('topics.unreachable');
  });

  it('reports a community that could not be created', async () => {
    await setCommunities({}, { 'Typo.bso': [loadError] });
    await renderTopicList(['Typo.bso']);

    expect(container.textContent).toBe('topics.unreachable');
  });

  it('keeps loading while a community loads for the first time', async () => {
    await setCommunities({ 'slow.bso': { address: 'slow.bso', updatingState: 'fetching-ipns' } });
    await renderTopicList(['slow.bso']);

    expect(container.textContent).toBe('topics.loading');
  });

  it('keeps saying it is still trying through the next attempt after a failed one', async () => {
    await setCommunities({ 'offline.bso': { address: 'offline.bso', updatingState: 'waiting-retry' } });
    await renderTopicList(['offline.bso']);
    expect(container.textContent).toBe('topics.retrying');

    await setCommunities({ 'offline.bso': { address: 'offline.bso', updatingState: 'fetching-ipns' } });
    expect(container.textContent).toBe('topics.retrying');
  });

  it('keeps loading while any community of the list can still load', async () => {
    await setCommunities(
      { 'gone.bso': { address: 'gone.bso', updatingState: 'waiting-retry' }, 'slow.bso': { address: 'slow.bso', updatingState: 'fetching-ipns' } },
      { 'gone.bso': [loadError] },
    );
    await renderTopicList(['gone.bso', 'slow.bso']);

    expect(container.textContent).toBe('topics.loading');
  });

  it('says it is still trying while the communities of the list that did not fail are retrying', async () => {
    await setCommunities(
      { 'gone.bso': { address: 'gone.bso', updatingState: 'waiting-retry' }, 'offline.bso': { address: 'offline.bso', updatingState: 'waiting-retry' } },
      { 'gone.bso': [loadError] },
    );
    await renderTopicList(['gone.bso', 'offline.bso']);

    expect(container.textContent).toBe('topics.retrying');
  });

  it('shows an empty community as empty', async () => {
    testState.hasMore = false;
    await setCommunities({ 'quiet.bso': { address: 'quiet.bso', updatedAt: 1_700_000_000, updatingState: 'waiting-retry' } });
    await renderTopicList(['quiet.bso']);

    expect(container.textContent).toBe('topics.empty');
  });
});

describe('LatestTopic', () => {
  it('reports an unreachable section community instead of loading forever', async () => {
    await setCommunities({ 'gone.bso': { address: 'gone.bso', updatingState: 'waiting-retry' } }, { 'gone.bso': [loadError] });
    await render(<LatestTopic communityAddress='gone.bso' />);

    expect(container.textContent).toBe('topics.unreachable');
  });

  it('says it is still trying to reach a section community that failed a load attempt', async () => {
    await setCommunities({ 'offline.bso': { address: 'offline.bso', updatingState: 'waiting-retry' } });
    await render(<LatestTopic communityAddress='offline.bso' />);

    expect(container.textContent).toBe('topics.retrying');
  });
});
