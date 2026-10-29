import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import Banner from '../../components/banner';
import { Button } from '../../components/button';
import NotFoundMessage from '../../components/not-found-message';
import SortTabs from '../../components/sort-tabs';
import TagList from '../../components/tag-list';
import TopicList from '../../components/topic-list';
import { getSectionBannerSrc } from '../../lib/banners';
import { getShortAddress } from '../../lib/community-identifier';
import { getSearchPath } from '../../lib/search';
import { getSection, getSectionCategory, getSectionWinner } from '../../lib/sections';
import { parseTopicSort, TOPIC_SORTS } from '../../lib/sorts';

// A section is a directory code: it opens whichever community currently ranks first for it. Topic
// links use that community's exact address, so they keep working if another community takes the code.
export default function Section() {
  const { t } = useTranslation();
  const { sectionCode, sort: sortSegment } = useParams();
  const section = getSection(sectionCode);
  const sort = parseTopicSort(sortSegment);

  if (!section || !sort) {
    return <NotFoundMessage title={t('section.notFound')} />;
  }

  const winner = getSectionWinner(section);
  const otherCandidates = section.candidates.slice(1);
  // Tags search within this section.
  const getTagPath = (tag: string) => getSearchPath({ section: section.code, tags: [tag] });

  return (
    <>
      <header className='mb-6'>
        <Banner src={getSectionBannerSrc(section.code)} className='glass-panel h-32 sm:h-40'>
          <p className='font-display text-xs font-semibold uppercase tracking-[0.18em] text-silver-bright/80'>{getSectionCategory(section.code)?.title}</p>
          <h1 className='mt-1.5 flex items-center gap-2.5 font-display text-3xl font-semibold text-silver-bright sm:text-4xl'>
            <span aria-hidden='true' className='h-3.5 w-3.5 shrink-0 rounded-[3px]' style={{ backgroundColor: section.color }} />
            {section.title}
          </h1>
        </Banner>
        <p className='mt-4 text-sm text-muted-foreground'>{section.description}</p>
        {winner ? (
          <p className='mt-1 text-xs text-muted-foreground'>
            {t('section.heldBy')}{' '}
            <Link to={`/c/${winner}`} className='text-blue-glow hover:underline'>
              {getShortAddress(winner)}
            </Link>
          </p>
        ) : null}
        <TagList tags={section.flairs.map((text) => ({ text }))} getTagPath={getTagPath} className='mt-3' />
      </header>

      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <SortTabs basePath={`/s/${section.code}`} active={sort} />
        <Button disabled title={t('topics.postingSoon')}>
          <Plus aria-hidden />
          {t('topics.newTopic')}
        </Button>
      </div>

      {winner ? (
        <TopicList communityAddresses={[winner]} sortType={TOPIC_SORTS[sort]} getTagPath={getTagPath} />
      ) : (
        <div className='glass-panel px-6 py-8'>
          <p className='font-semibold text-foreground'>{t('section.noCommunityTitle')}</p>
          <p className='mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground'>{t('section.noCommunityDescription')}</p>
          <Link to='/about/sections' className='mt-3 inline-flex text-sm text-blue-glow hover:underline'>
            {t('section.howSectionsWork')}
          </Link>
        </div>
      )}

      {otherCandidates.length > 0 ? (
        <section className='mt-8' aria-labelledby='other-communities'>
          <h2 id='other-communities' className='mb-3 font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground'>
            {t('section.otherCommunities')}
          </h2>
          <ul className='flex flex-wrap gap-2'>
            {otherCandidates.map((address) => (
              <li key={address}>
                <Link to={`/c/${address}`} className='blue-hover inline-flex rounded-full border border-border px-3 py-1 text-sm text-muted-foreground'>
                  {getShortAddress(address)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
