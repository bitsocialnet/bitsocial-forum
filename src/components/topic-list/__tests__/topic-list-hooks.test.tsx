import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest';
import { Community, PKC } from '@bitsocial/bitsocial-react-hooks/dist/lib/pkc-js/pkc-js-mock.js';
import TopicList from '..';

// Runs on the real hooks over vitest.setup's pkc-js mock. One address cannot be created, as with a name
// with a capital letter or a malformed public key; for the others the test plays pkc-js's update events.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const act = (React as { act?: (cb: () => void | Promise<void>) => void | Promise<void> }).act as (cb: () => void | Promise<void>) => void | Promise<void>;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const UNCREATABLE_ADDRESS = 'Typo.bso';
const INVALID_RECORD_ADDRESS = 'invalid-record.bso';
const OFFLINE_ADDRESS = 'offline.bso';
const PLAYED_ADDRESSES = [INVALID_RECORD_ADDRESS, OFFLINE_ADDRESS];

type CreateCommunity = (options?: { name?: string; address?: string }) => Promise<unknown>;
type MockCommunity = { address: string; updatedAt?: number; emit: (event: string, ...args: unknown[]) => boolean };
type Update = (this: MockCommunity) => Promise<void>;
const pkcPrototype = PKC.prototype as unknown as { createCommunity: CreateCommunity };
const communityPrototype = Community.prototype as unknown as { update: Update };
const createCommunity = pkcPrototype.createCommunity;
const update = communityPrototype.update;
const playedCommunities: Record<string, MockCommunity> = {};
let failedCreates = 0;

beforeAll(() => {
  pkcPrototype.createCommunity = async function (this: unknown, options) {
    if (options?.name === UNCREATABLE_ADDRESS || options?.address === UNCREATABLE_ADDRESS) {
      failedCreates++;
      // Park a runaway retry loop so the assertions below report it instead of the test hanging in act().
      if (failedCreates > 20) return new Promise(() => {});
      throw new Error('ERR_COMMUNITY_NAME_HAS_CAPITAL_LETTER');
    }
    return createCommunity.call(this, options);
  };
  communityPrototype.update = async function () {
    if (!PLAYED_ADDRESSES.includes(this.address)) return update.call(this);
    playedCommunities[this.address] = this;
  };
});

afterAll(() => {
  pkcPrototype.createCommunity = createCommunity;
  communityPrototype.update = update;
});

const mounted: Array<{ root: Root; container: HTMLDivElement }> = [];

async function unmountAll() {
  for (const { root, container } of mounted.splice(0)) {
    await act(async () => root.unmount());
    container.remove();
  }
}

afterEach(unmountAll);

async function renderTopicList(communityAddress: string) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  mounted.push({ root, container });
  await act(async () => {
    root.render(
      <MemoryRouter>
        <TopicList communityAddresses={[communityAddress]} sortType='new' getTagPath={(tag) => tag} />
      </MemoryRouter>,
    );
  });
  return container;
}

const wait = (ms: number) =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });

async function waitFor(condition: () => boolean) {
  for (let attempt = 0; attempt < 80 && !condition(); attempt++) {
    await wait(25);
  }
}

async function waitForUpdateCall(address: string) {
  await waitFor(() => Boolean(playedCommunities[address]));
  const community = playedCommunities[address];
  expect(community).toBeDefined();
  return community as MockCommunity;
}

const play = (community: MockCommunity, ...events: Array<[string, ...unknown[]]>) =>
  act(async () => {
    for (const [event, ...args] of events) community.emit(event, ...args);
  });

// pkc-js tags load errors with details.retriableError; the hooks keep only the non-retriable ones.
const loadError = (code: string, retriableError: boolean) => Object.assign(new Error(code), { details: { retriableError } });

it('reports a community that cannot be created, trying to create it only once', async () => {
  const container = await renderTopicList(UNCREATABLE_ADDRESS);

  await waitFor(() => container.textContent === 'topics.unreachable');
  await wait(200);

  expect(container.textContent).toBe('topics.unreachable');
  // useFeed creates the community once. A creation retry loop would make thousands of attempts.
  expect(failedCreates).toBeLessThanOrEqual(2);
});

it('keeps reporting a community with an invalid record while pkc-js keeps polling it', async () => {
  const container = await renderTopicList(INVALID_RECORD_ADDRESS);
  const community = await waitForUpdateCall(INVALID_RECORD_ADDRESS);

  await play(community, ['updatingstatechange', 'fetching-ipns']);
  expect(container.textContent).toBe('topics.loading');

  await play(community, ['error', loadError('ERR_COMMUNITY_SIGNATURE_IS_INVALID', false)], ['updatingstatechange', 'failed']);
  expect(container.textContent).toBe('topics.unreachable');

  // The hooks store a non-retriable error after a one second grace period. pkc-js then keeps polling: its
  // next cycle fetches the IPNS record again and, finding the record it already rejected, waits to retry.
  await wait(1100);
  await play(community, ['updatingstatechange', 'fetching-ipns']);
  expect(container.textContent).toBe('topics.unreachable');
  await play(community, ['updatingstatechange', 'waiting-retry']);
  expect(container.textContent).toBe('topics.unreachable');

  await unmountAll();
  const remounted = await renderTopicList(INVALID_RECORD_ADDRESS);
  expect(remounted.textContent).toBe('topics.unreachable');
});

it('says it is still trying to reach a community whose loads keep failing, until one succeeds', async () => {
  const container = await renderTopicList(OFFLINE_ADDRESS);
  const community = await waitForUpdateCall(OFFLINE_ADDRESS);

  await play(community, ['updatingstatechange', 'fetching-ipns']);
  expect(container.textContent).toBe('topics.loading');

  await play(community, ['error', loadError('ERR_FAILED_TO_FETCH_IPNS', true)], ['updatingstatechange', 'waiting-retry']);
  expect(container.textContent).toBe('topics.retrying');

  // The next attempt starts. Retriable errors are never stored, so this is not reported as unreachable.
  await play(community, ['updatingstatechange', 'fetching-ipns']);
  await wait(1100);
  expect(container.textContent).toBe('topics.retrying');

  community.updatedAt = Math.floor(Date.now() / 1000);
  await play(community, ['update', community], ['updatingstatechange', 'succeeded']);
  await waitFor(() => container.textContent === 'topics.empty');
  expect(container.textContent).toBe('topics.empty');
});
