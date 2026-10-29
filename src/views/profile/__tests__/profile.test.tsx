import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Profile from '../profile';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const act = (React as { act?: (cb: () => void | Promise<void>) => void | Promise<void> }).act as (cb: () => void | Promise<void>) => void | Promise<void>;

const testState = vi.hoisted(() => ({
  accountComments: [] as Array<Record<string, unknown>>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@bitsocial/bitsocial-react-hooks', () => ({
  useAccount: () => ({ author: { address: '12D3KooWAuthorAddress', displayName: 'Rinse' } }),
  useAccountComments: () => ({ accountComments: testState.accountComments }),
}));

let container: HTMLDivElement;
let root: Root;

async function render() {
  await act(async () => {
    root.render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );
  });
}

beforeEach(() => {
  testState.accountComments = [];
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe('Profile', () => {
  it('shows the active account and keeps profile node creation disabled', async () => {
    await render();

    expect(container.querySelector('h1')?.textContent).toBe('Rinse');
    expect(container.textContent).toContain('12D3KooWAuthorAddress');
    const createButton = [...container.querySelectorAll('button')].find((button) => button.textContent === 'profile.createNode');
    expect(createButton?.disabled).toBe(true);
    expect(container.textContent).toContain('profile.noPosts');
  });

  it('lists the newest posts first, linking replies to their topic and leaving pending ones unlinked', async () => {
    testState.accountComments = [
      { cid: 'QmTopic', communityAddress: 'pkc.bso', title: 'Older topic', timestamp: 1 },
      { cid: 'QmReply', postCid: 'QmTopic', parentCid: 'QmTopic', communityAddress: 'pkc.bso', content: 'A reply', timestamp: 2 },
      { communityAddress: 'pkc.bso', title: 'Still publishing', timestamp: 3 },
    ];
    await render();

    const items = [...container.querySelectorAll('section[aria-labelledby="profile-posts"] li')].map((item) => item.textContent);
    expect(items[0]).toContain('Still publishing');
    expect(items[0]).toContain('profile.pending');
    expect(container.querySelector('a[href="/c/pkc.bso/t/QmTopic"]')?.textContent).toBe('A reply');
    expect(container.querySelectorAll('a[href="/c/pkc.bso/t/QmTopic"]')).toHaveLength(2);
  });
});
