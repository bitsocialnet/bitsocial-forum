import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BITSOCIAL_URL, DOCS_URL } from '../lib/site';
import ThemeToggle from './theme-toggle';

// Discourse's full-width header in bitsocial.net's topbar material: frosted, Exo labels, 44px controls.
const navLinkClassName = 'inline-flex h-11 items-center gap-0.5 px-2 font-display text-base text-muted-foreground transition-colors hover:text-foreground';

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
          className='inline-flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-border/70 hover:text-foreground lg:hidden'
        >
          {isSidebarOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
        </button>
        <Link to='/' className='group inline-flex h-11 items-center gap-1'>
          <img src='./logo-small.png' width={32} height={32} alt='' aria-hidden='true' className='h-8 w-8 transition-[filter] group-hover:brightness-110' />
          <span className='font-display text-xl text-muted-foreground transition-colors group-hover:text-foreground'>Bitsocial Forum</span>
        </Link>
        <nav aria-label={t('header.linksLabel')} className='ms-auto hidden items-center gap-3 md:flex'>
          {[
            { label: t('header.docs'), href: DOCS_URL },
            { label: t('header.bitsocial'), href: BITSOCIAL_URL },
          ].map((link) => (
            <a key={link.href} href={link.href} target='_blank' rel='noopener noreferrer' className={navLinkClassName}>
              {link.label}
              <ArrowUpRight aria-hidden className='h-3.5 w-3.5 opacity-70 rtl:-scale-x-100' />
            </a>
          ))}
          <div className='mx-1 h-4 w-px bg-border' />
        </nav>
        <div className='flex items-center max-md:ms-auto'>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
