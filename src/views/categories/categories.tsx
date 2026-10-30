import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Banner from '../../components/banner';
import LatestTopic from '../../components/latest-topic';
import TagList from '../../components/tag-list';
import { FORUM_CATEGORIES } from '../../data/sections';
import { HOME_BANNER } from '../../lib/banners';
import { getSearchPath } from '../../lib/search';
import { getSectionWinner } from '../../lib/sections';

const columnHeadingClassName = 'py-3 text-start font-display text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground';

// Discourse's categories page: one glass panel per category, one row per section with the section
// color as its left edge and the newest topic beside it.
export default function Categories() {
  const { t } = useTranslation();

  return (
    <>
      <header className='mb-8'>
        <Banner sources={HOME_BANNER} className='glass-panel h-40 sm:h-52'>
          <p className='font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-sm dark:text-silver-bright/80'>
            {t('categories.welcome')}
          </p>
          <h1 className='mt-1 font-display text-4xl font-semibold text-foreground sm:text-6xl dark:text-silver-bright'>Bitsocial Forum</h1>
        </Banner>
        <p className='mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground'>
          {t('categories.description')}{' '}
          <Link to='/about/sections' className='text-blue-glow hover:underline'>
            {t('categories.howSectionsWork')}
          </Link>
        </p>
      </header>

      <div className='flex flex-col gap-8'>
        {FORUM_CATEGORIES.map((category, index) => (
          <section key={category.title} aria-labelledby={`category-${index}`}>
            <h2 id={`category-${index}`} className='mb-3 px-1 font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground'>
              {category.title}
            </h2>
            <div className='glass-panel overflow-hidden'>
              <table className='w-full table-fixed border-collapse'>
                <thead>
                  <tr className='border-b border-border/60'>
                    <th scope='col' className={`${columnHeadingClassName} ps-6`}>
                      {t('categories.category')}
                    </th>
                    <th scope='col' className={`${columnHeadingClassName} w-2/5 pe-6 ps-4 max-md:hidden`}>
                      {t('categories.latest')}
                    </th>
                  </tr>
                </thead>
                <tbody className='[&>tr:last-child]:border-b-0'>
                  {category.sections.map((section) => {
                    const winner = getSectionWinner(section);
                    return (
                      <tr key={section.code} className='border-b border-border/50 align-top'>
                        <td className='border-s-4 py-4 pe-4 ps-5' style={{ borderInlineStartColor: section.color }}>
                          <Link to={`/s/${section.code}`} className='text-base font-semibold text-foreground transition-colors hover:text-blue-glow'>
                            {section.title}
                          </Link>
                          <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>{section.description}</p>
                          <TagList
                            tags={section.flairs.map((text) => ({ text }))}
                            getTagPath={(tag) => getSearchPath({ section: section.code, tags: [tag] })}
                            className='mt-2.5'
                          />
                        </td>
                        <td className='py-4 pe-6 ps-4 max-md:hidden'>
                          {winner ? <LatestTopic communityAddress={winner} /> : <span className='text-xs text-muted-foreground'>{t('section.noCommunityShort')}</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
