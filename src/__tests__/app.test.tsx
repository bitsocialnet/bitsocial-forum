import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../app';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const act = (React as { act?: (cb: () => void | Promise<void>) => void | Promise<void> }).act as (cb: () => void | Promise<void>) => void | Promise<void>;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@bitsocial/bitsocial-react-hooks', () => ({
  useAccount: () => undefined,
}));

let container: HTMLDivElement;
let root: Root;

function BackButton() {
  const navigate = useNavigate();
  return (
    <button type='button' data-testid='history-back' onClick={() => void navigate(-1)}>
      back
    </button>
  );
}

async function renderAt(entries: string[]) {
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
        <App />
        <BackButton />
      </MemoryRouter>,
    );
  });
}

const sidebarToggle = () => container.querySelector<HTMLButtonElement>('button[aria-controls="forum-sidebar"]')!;
const isSidebarOpen = () => sidebarToggle().getAttribute('aria-expanded') === 'true';

async function click(element: HTMLElement | null) {
  expect(element).not.toBeNull();
  await act(async () => element!.click());
}

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe('App sidebar drawer', () => {
  it('opens and closes from the header toggle', async () => {
    await renderAt(['/']);

    await click(sidebarToggle());
    expect(isSidebarOpen()).toBe(true);
    expect(container.querySelector('#forum-sidebar')?.className).not.toContain('max-lg:hidden');

    await click(sidebarToggle());
    expect(isSidebarOpen()).toBe(false);
    expect(container.querySelector('#forum-sidebar')?.className).toContain('max-lg:hidden');
  });

  it('closes when a header link navigates', async () => {
    await renderAt(['/inbox']);
    await click(sidebarToggle());

    await click(container.querySelector('a[aria-label="Bitsocial Forum"]'));

    expect(container.textContent).toContain('categories.welcome');
    expect(isSidebarOpen()).toBe(false);
    expect(container.querySelector('#forum-sidebar')?.className).toContain('max-lg:hidden');
  });

  it('closes when the header search is submitted', async () => {
    await renderAt(['/']);
    await click(sidebarToggle());

    await act(async () => {
      container.querySelector('form[role="search"]')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(container.textContent).toContain('search.title');
    expect(isSidebarOpen()).toBe(false);
  });

  it('closes on a history navigation and stays closed when returning to the page it was opened on', async () => {
    await renderAt(['/', '/inbox']);
    await click(sidebarToggle());

    await click(container.querySelector('[data-testid="history-back"]'));
    expect(container.textContent).toContain('categories.welcome');
    expect(isSidebarOpen()).toBe(false);

    await click(container.querySelector('a[aria-label="header.inbox"]'));
    await click(sidebarToggle());
    await click(container.querySelector('a[aria-label="Bitsocial Forum"]'));
    await click(container.querySelector('[data-testid="history-back"]'));
    expect(container.textContent).toContain('inbox.title');
    expect(isSidebarOpen()).toBe(false);
  });
});
