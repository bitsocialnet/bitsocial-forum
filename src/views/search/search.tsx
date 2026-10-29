import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import TagList from '../../components/tag-list';
import TopicList from '../../components/topic-list';
import { FORUM_CATEGORIES } from '../../data/sections';
import { getShortAddress } from '../../lib/community-identifier';
import { getSearchFeedFilter, getSearchPath, parseSearchQuery, type SearchQuery } from '../../lib/search';
import { getSection, getSectionWinner, getSectionWinners } from '../../lib/sections';

const labelClassName = 'font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground';

// One part of the current query as a chip; its x removes that part.
function QueryChip({ label, removePath, color }: { label: string; removePath: string; color?: string }) {
  const { t } = useTranslation();

  return (
    <li className='blue-selected inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm text-foreground'>
      {color ? <span aria-hidden='true' className='h-2.5 w-2.5 rounded-[2px]' style={{ backgroundColor: color }} /> : null}
      {label}
      <Link
        to={removePath}
        aria-label={t('search.removeFilter', { filter: label })}
        className='-me-1 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground'
      >
        <X aria-hidden className='h-3.5 w-3.5' />
      </Link>
    </li>
  );
}

// Search across section communities, one section (section:code) or one community (community:address).
// Results are the scoped communities' feeds, newest first, filtered on the client.
export default function Search() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const raw = searchParams.get('q')?.trim() ?? '';
  const query = parseSearchQuery(raw);
  const section = query.section ? getSection(query.section) : undefined;
  const sectionWinner = section ? getSectionWinner(section) : undefined;
  const communityAddresses = query.community ? [query.community] : section ? (sectionWinner ? [sectionWinner] : []) : getSectionWinners();
  const without = (change: Partial<SearchQuery>) => getSearchPath({ ...query, ...change });
  // A tag clicked in the results replaces the query's tags but keeps its scope.
  const getTagPath = (tag: string) => getSearchPath({ section: query.section, community: query.community, tags: [tag] });

  return (
    <div className='max-w-4xl'>
      <header className='mb-6'>
        <h1 className='font-display text-3xl font-semibold text-muted-foreground'>{t('search.title')}</h1>
        {raw ? (
          <ul className='mt-4 flex flex-wrap items-center gap-2' aria-label={t('search.activeFilters')}>
            {query.section ? <QueryChip label={section?.title ?? query.section} color={section?.color} removePath={without({ section: undefined })} /> : null}
            {query.community ? <QueryChip label={getShortAddress(query.community)} removePath={without({ community: undefined })} /> : null}
            {query.tags.map((tag) => (
              <QueryChip key={tag} label={`#${tag}`} removePath={without({ tags: query.tags.filter((other) => other !== tag) })} />
            ))}
            {query.text ? <QueryChip label={`“${query.text}”`} removePath={without({ text: '' })} /> : null}
          </ul>
        ) : (
          <p className='mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground'>{t('search.help')}</p>
        )}
      </header>

      {!raw ? (
        <section aria-labelledby='search-tags'>
          <h2 id='search-tags' className={`${labelClassName} mb-3`}>
            {t('search.browseTags')}
          </h2>
          <div className='glass-panel divide-y divide-border/50 px-6'>
            {FORUM_CATEGORIES.flatMap((category) => category.sections)
              .filter((candidate) => candidate.flairs.length > 0)
              .map((candidate) => (
                <div key={candidate.code} className='flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:gap-4'>
                  <p className='flex w-48 shrink-0 items-center gap-2 text-sm font-medium text-foreground'>
                    <span aria-hidden='true' className='h-2.5 w-2.5 rounded-[2px]' style={{ backgroundColor: candidate.color }} />
                    {candidate.title}
                  </p>
                  <TagList tags={candidate.flairs.map((text) => ({ text }))} getTagPath={(tag) => getSearchPath({ section: candidate.code, tags: [tag] })} />
                </div>
              ))}
          </div>
        </section>
      ) : query.section && !section ? (
        <p className='glass-panel px-6 py-8 text-sm text-muted-foreground'>{t('search.unknownSection', { section: query.section })}</p>
      ) : communityAddresses.length === 0 ? (
        <div className='glass-panel px-6 py-8'>
          <p className='font-semibold text-foreground'>{t('search.nothingToSearchTitle')}</p>
          <p className='mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground'>{section ? t('search.sectionHasNoCommunity') : t('search.noSectionCommunities')}</p>
        </div>
      ) : (
        <TopicList
          communityAddresses={communityAddresses}
          sortType='new'
          filter={getSearchFeedFilter(query)}
          getTagPath={getTagPath}
          emptyMessage={t('search.noResults')}
        />
      )}
    </div>
  );
}
