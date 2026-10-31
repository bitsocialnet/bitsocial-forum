import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import InboxButton from './inbox-button';
import ProfileButton from './profile-button';
import SearchBar from './search-bar';
import ThemeToggle from './theme-toggle';

// Discourse's full-width header in bitsocial.net's topbar material: frosted, Exo labels, 44px controls.
// Search sits in the middle and forum functions on the right; site links live in the sidebar and footer.
export default function SiteHeader({ isSidebarOpen, onToggleSidebar }: { isSidebarOpen: boolean; onToggleSidebar: () => void }) {
  const { t } = useTranslation();

  return (
    <header className='frosted-header sticky top-0 z-40'>
      <div className='mx-auto flex h-16 max-w-screen-xl items-center gap-2 px-3 sm:px-5'>
        <button
          type='button'
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? t('header.closeSidebar') : t('header.openSidebar')}
          aria-expanded={isSidebarOpen}
          aria-controls='forum-sidebar'
          className='blue-hover inline-flex h-11 w-11 items-center justify-center rounded-full border border-transparent text-muted-foreground lg:hidden'
        >
          {isSidebarOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
        </button>
        <Link to='/' aria-label='Bitsocial Forum' className='group inline-flex h-11 shrink-0 items-center gap-1'>
          <img src='./logo-small.png' width={32} height={32} alt='' aria-hidden='true' className='h-8 w-8 transition-[filter] group-hover:brightness-110' />
          <span className='hidden font-display text-xl text-muted-foreground transition-colors group-hover:text-foreground sm:inline'>Bitsocial Forum</span>
        </Link>
        <div className='mx-auto w-full min-w-0 max-w-xl px-1 sm:px-4'>
          <SearchBar />
        </div>
        <div className='flex shrink-0 items-center gap-1.5'>
          <InboxButton />
          <ThemeToggle />
          <ProfileButton />
        </div>
      </div>
    </header>
  );
}
