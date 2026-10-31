import { Inbox } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';

// The header's inbox entry point. The inbox page is a placeholder until notifications exist.
export default function InboxButton() {
  const { t } = useTranslation();

  return (
    <NavLink
      to='/inbox'
      aria-label={t('header.inbox')}
      className={({ isActive }) =>
        cn(
          'blue-hover inline-flex h-11 w-11 items-center justify-center rounded-full border border-transparent text-muted-foreground',
          isActive && 'blue-selected text-foreground',
        )
      }
    >
      <Inbox aria-hidden className='h-4 w-4' />
    </NavLink>
  );
}
