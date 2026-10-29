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
      className='inline-flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-border/70 hover:text-foreground'
    >
      {theme === 'dark' ? <Moon className='h-4 w-4' /> : <Sun className='h-4 w-4' />}
    </button>
  );
}
