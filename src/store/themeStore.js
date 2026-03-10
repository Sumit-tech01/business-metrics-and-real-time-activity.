import { create } from 'zustand';

const THEME_KEY = 'erp_theme';

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme = localStorage.getItem(THEME_KEY);

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const persistTheme = (theme) => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(THEME_KEY, theme);
};

export const useThemeStore = create((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    persistTheme(theme);
    set({ theme });
  },
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      persistTheme(nextTheme);
      return { theme: nextTheme };
    }),
}));
