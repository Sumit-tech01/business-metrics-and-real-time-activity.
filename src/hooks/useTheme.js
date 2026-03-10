import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

export const useTheme = () => {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    const rootElement = document.documentElement;

    if (theme === 'dark') {
      rootElement.classList.add('dark');
      return;
    }

    rootElement.classList.remove('dark');
  }, [theme]);
};
