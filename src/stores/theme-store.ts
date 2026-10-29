import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

// index.html reads this key before first paint, so keep the two in sync.
const THEME_STORAGE_KEY = 'bitsocial-forum-theme';

type ThemeState = {
  theme: Theme;
  toggleTheme: () => void;
};

// Dark first, like bitsocial.net, unless the system asks for light.
function getSystemTheme(): Theme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: getSystemTheme(),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);

applyTheme(useThemeStore.getState().theme);
useThemeStore.subscribe((state) => applyTheme(state.theme));
