import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

// A wide, short banner image with optional text over its lower-left corner. Banners are always dark,
// so overlay text is light in both themes.
export default function Banner({ src, className, children }: { src: string; className?: string; children?: ReactNode }) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <img src={src} alt='' aria-hidden='true' className='absolute inset-0 h-full w-full object-cover' />
      {children ? (
        <div className='relative flex h-full flex-col justify-end bg-gradient-to-r from-black/70 via-black/30 to-transparent p-5 sm:p-7'>{children}</div>
      ) : null}
    </div>
  );
}
