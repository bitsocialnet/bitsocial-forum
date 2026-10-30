import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../stores/theme-store';

export default function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const { t } = useTranslation();

  return (
    <button
      type='button'
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')}
      className='blue-hover inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-black/[0.04] text-muted-foreground dark:border-transparent dark:bg-transparent'
    >
      {theme === 'dark' ? <Moon className='h-4 w-4' /> : <Sun className='h-4 w-4' />}
    </button>
  );
}
