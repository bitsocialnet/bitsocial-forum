import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/button';
import NotFoundMessage from '../../components/not-found-message';
import SortTabs from '../../components/sort-tabs';
import TagList from '../../components/tag-list';
import TopicList from '../../components/topic-list';
import { getShortAddress } from '../../lib/community-identifier';
import { getSection, getSectionCategory, getSectionWinner } from '../../lib/sections';
import { DIRECTORIES_DOCS_URL } from '../../lib/site';
import { parseTopicSort } from '../../lib/sorts';

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

  return (
    <>
      <header className='mb-6'>
        <p className='font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground'>{getSectionCategory(section.code)?.title}</p>
        <h1 className='mt-2 flex items-center gap-2.5 font-display text-3xl font-semibold text-muted-foreground'>
          <span aria-hidden='true' className='h-3.5 w-3.5 shrink-0 rounded-[3px]' style={{ backgroundColor: section.color }} />
          {section.title}
        </h1>
        <p className='mt-1 text-sm text-muted-foreground'>{section.description}</p>
        {winner ? (
          <p className='mt-1 text-xs text-muted-foreground'>
            {t('section.heldBy')}{' '}
            <Link to={`/c/${winner}`} className='text-blue-glow hover:underline'>
              {getShortAddress(winner)}
            </Link>
          </p>
        ) : null}
        <TagList tags={section.flairs.map((text) => ({ text }))} className='mt-3' />
      </header>

      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <SortTabs basePath={`/s/${section.code}`} active={sort} />
        <Button disabled title={t('topics.postingSoon')}>
          <Plus aria-hidden />
          {t('topics.newTopic')}
        </Button>
      </div>

      {winner ? (
        <TopicList communityAddress={winner} sort={sort} />
      ) : (
        <div className='glass-panel px-6 py-8'>
          <p className='font-semibold text-foreground'>{t('section.noCommunityTitle')}</p>
          <p className='mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground'>{t('section.noCommunityDescription')}</p>
          <a href={DIRECTORIES_DOCS_URL} target='_blank' rel='noopener noreferrer' className='mt-3 inline-flex text-sm text-blue-glow hover:underline'>
            {t('section.howSectionsWork')}
          </a>
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
                <Link
                  to={`/c/${address}`}
                  className='inline-flex rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-blue-glow hover:text-foreground'
                >
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
