import { create } from 'zustand';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'maharashtra-theme';

function readInitial(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (saved === 'light' || saved === 'dark') return saved;
  // Default to dark (cinematic), but respect an explicit OS light preference.
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function apply(theme: Theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme;
  }
}

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  set: (t: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const initial = readInitial();
  apply(initial);
  return {
    theme: initial,
    toggle: () => {
      const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, next);
      apply(next);
      set({ theme: next });
    },
    set: (t) => {
      localStorage.setItem(STORAGE_KEY, t);
      apply(t);
      set({ theme: t });
    },
  };
});
