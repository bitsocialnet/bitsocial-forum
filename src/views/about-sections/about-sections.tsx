import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CONTENT_DISCOVERY_DOCS_URL, DIRECTORIES_DOCS_URL } from '../../lib/site';

// Each block is a heading and a paragraph in public/translations/en/default.json under aboutSections.
const BLOCKS = ['community', 'whoRuns', 'whyNotOne', 'changingHands', 'startCommunity', 'tags'] as const;

// Explains forum sections in the forum's own terms. Directories are the mechanism underneath, so the
// docs about them are linked as further reading rather than as the explanation.
export default function AboutSections() {
  const { t } = useTranslation();
  const docsLinks = [
    { label: t('aboutSections.directoriesDocs'), href: DIRECTORIES_DOCS_URL },
    { label: t('aboutSections.discoveryDocs'), href: CONTENT_DISCOVERY_DOCS_URL },
  ];

  return (
    <article className='max-w-3xl'>
      <header className='mb-6'>
        <p className='font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground'>{t('aboutSections.eyebrow')}</p>
        <h1 className='mt-2 font-display text-3xl font-semibold text-muted-foreground md:text-4xl'>{t('aboutSections.title')}</h1>
        <p className='mt-3 text-base leading-relaxed text-muted-foreground'>{t('aboutSections.intro')}</p>
      </header>

      <div className='glass-panel divide-y divide-border/50 px-6 sm:px-8'>
        {BLOCKS.map((block) => (
          <section key={block} className='py-6' aria-labelledby={`about-${block}`}>
            <h2 id={`about-${block}`} className='font-display text-lg font-semibold text-foreground'>
              {t(`aboutSections.${block}.title`)}
            </h2>
            <p className='mt-2 text-[15px] leading-relaxed text-muted-foreground'>{t(`aboutSections.${block}.body`)}</p>
            {block === 'startCommunity' ? (
              <Link to='/s/general' className='mt-3 inline-flex text-sm text-blue-glow hover:underline'>
                {t('aboutSections.startCommunity.link')}
              </Link>
            ) : null}
          </section>
        ))}
      </div>

      <section className='mt-6 px-1' aria-labelledby='about-learn-more'>
        <h2 id='about-learn-more' className='font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground'>
          {t('aboutSections.learnMore')}
        </h2>
        <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>{t('aboutSections.learnMoreBody')}</p>
        <ul className='mt-3 flex flex-wrap gap-2'>
          {docsLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target='_blank'
                rel='noopener noreferrer'
                className='blue-hover inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-sm text-muted-foreground'
              >
                {link.label}
                <ArrowUpRight aria-hidden className='h-3.5 w-3.5 opacity-70 rtl:-scale-x-100' />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
