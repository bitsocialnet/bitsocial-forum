import type { ReactNode } from 'react';
import type { BannerSources } from '../lib/banners';
import { cn } from '../lib/utils';
import { useThemeStore } from '../stores/theme-store';

// A wide, short banner image with optional text over its lower-left corner. The image follows the
// theme, and a gradient in the page background color keeps the overlay text readable over it.
export default function Banner({ sources, className, children }: { sources: BannerSources; className?: string; children?: ReactNode }) {
  const theme = useThemeStore((state) => state.theme);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <img src={sources[theme]} alt='' aria-hidden='true' className='absolute inset-0 h-full w-full object-cover' />
      {children ? (
        <div className='relative flex h-full flex-col justify-end bg-gradient-to-r from-white/85 via-white/45 to-transparent p-5 sm:p-7 dark:from-black/70 dark:via-black/30'>
          {children}
        </div>
      ) : null}
    </div>
  );
}
