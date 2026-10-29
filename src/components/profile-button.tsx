import { useAccount } from '@bitsocial/bitsocial-react-hooks';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import Avatar from './avatar';

// The header's account entry point: the active Bitsocial account's avatar and name, linking to its profile.
export default function ProfileButton() {
  const { t } = useTranslation();
  const account = useAccount();
  const address: string | undefined = account?.author?.address;
  const displayName: string | undefined = account?.author?.displayName;

  return (
    <NavLink
      to='/profile'
      aria-label={t('header.profile')}
      className={({ isActive }) =>
        cn(
          'blue-hover inline-flex h-11 items-center gap-2 rounded-full border border-transparent ps-1.5 pe-1.5 text-muted-foreground md:pe-4',
          isActive && 'blue-selected text-foreground',
        )
      }
    >
      <Avatar name={displayName} seed={address} size={32} />
      <span className='hidden max-w-40 truncate font-display text-sm md:inline'>{displayName || t('profile.anonymous')}</span>
    </NavLink>
  );
}
