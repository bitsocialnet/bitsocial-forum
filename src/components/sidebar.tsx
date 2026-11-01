import { ArrowUpRight, CircleHelp, LayoutList } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { FORUM_CATEGORIES } from '../data/sections';
import { BITSOCIAL_URL, DOCS_URL } from '../lib/site';
import { cn } from '../lib/utils';

// Hover shows the selected style itself. It appears instantly (no transition while hovered) so sweeping
// the list feels immediate, and fades out after the pointer leaves.
const itemClassName =
  'hover:blue-selected flex items-center gap-2.5 rounded-full border border-transparent px-3 py-1.5 text-sm text-muted-foreground transition-[background-color,border-color,box-shadow,color] duration-500 ease-in-out hover:text-foreground hover:transition-none';
const activeItemClassName = 'blue-selected font-medium text-foreground';
const groupTitleClassName = 'px-3 pb-1.5 font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/80';

function navItemClassName({ isActive }: { isActive: boolean }) {
  return cn(itemClassName, isActive && activeItemClassName);
}

// Discourse-style sidebar: the categories page, every section grouped by category, then resources.
// Hover and selection use bitsocial.net's blue.
export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  const externalLinks = [
    { label: t('sidebar.docs'), href: DOCS_URL },
    { label: t('sidebar.bitsocial'), href: BITSOCIAL_URL },
  ];

  return (
    <nav aria-label={t('sidebar.label')} className='flex flex-col gap-5 py-5'>
      <NavLink to='/' end onClick={onNavigate} className={navItemClassName}>
        <LayoutList aria-hidden className='h-4 w-4' />
        {t('sidebar.categories')}
      </NavLink>

      {FORUM_CATEGORIES.map((category) => (
        <div key={category.title}>
          <p className={groupTitleClassName}>{category.title}</p>
          <ul className='flex flex-col gap-0.5'>
            {category.sections.map((section) => (
              <li key={section.code}>
                <NavLink to={`/s/${section.code}`} onClick={onNavigate} className={navItemClassName}>
                  <span aria-hidden='true' className='h-2.5 w-2.5 shrink-0 rounded-[2px]' style={{ backgroundColor: section.color }} />
                  <span className='truncate'>{section.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div>
        <p className={groupTitleClassName}>{t('sidebar.resources')}</p>
        <ul className='flex flex-col gap-0.5'>
          <li>
            <NavLink to='/about/sections' onClick={onNavigate} className={navItemClassName}>
              <CircleHelp aria-hidden className='h-4 w-4' />
              {t('sidebar.howSectionsWork')}
            </NavLink>
          </li>
          {externalLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} target='_blank' rel='noopener noreferrer' className={itemClassName}>
                {link.label}
                <ArrowUpRight aria-hidden className='h-3.5 w-3.5 opacity-70 rtl:-scale-x-100' />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
