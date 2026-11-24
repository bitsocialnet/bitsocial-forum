import { useTranslation } from 'react-i18next';
import { BITSOCIAL_URL, DOCS_URL, GITHUB_URL, STATS_URL, TELEGRAM_URL, TWITTER_URL } from '../lib/site';

// A compact version of bitsocial.net's glass footer, with the forum's version and license at bottom right.
export default function SiteFooter() {
  const { t } = useTranslation();
  const links = [
    { label: t('footer.docs'), href: DOCS_URL },
    { label: t('footer.bitsocial'), href: BITSOCIAL_URL },
    { label: t('footer.stats'), href: STATS_URL },
    { label: 'GitHub', href: GITHUB_URL },
    { label: 'Twitter', href: TWITTER_URL },
    { label: 'Telegram', href: TELEGRAM_URL },
  ];

  return (
    <footer className='footer-glass mx-4 mt-10 lg:mx-8' style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className='flex flex-col gap-4 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between'>
        <ul className='flex flex-wrap gap-x-5 gap-y-2'>
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} target='_blank' rel='noopener noreferrer' className='transition-colors hover:text-foreground'>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <p className='font-display tracking-wide text-muted-foreground/80'>{t('footer.version', { version: import.meta.env.VITE_APP_VERSION })}</p>
      </div>
    </footer>
  );
}
