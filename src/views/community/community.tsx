import { useCommunity } from '@bitsocial/bitsocial-react-hooks';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import CategoryBadge from '../../components/category-badge';
import NotFoundMessage from '../../components/not-found-message';
import SortTabs from '../../components/sort-tabs';
import TagList, { type Tag } from '../../components/tag-list';
import TopicList from '../../components/topic-list';
import { getShortAddress, toCommunityIdentifier } from '../../lib/community-identifier';
import { getSearchPath } from '../../lib/search';
import { getSectionForCommunity } from '../../lib/sections';
import { parseTopicSort, TOPIC_SORTS } from '../../lib/sorts';

// Any community opens by its exact address, whether or not it holds a section.
export default function Community() {
  const { t } = useTranslation();
  const { communityAddress, sort: sortSegment } = useParams();
  const community = useCommunity({ community: communityAddress ? toCommunityIdentifier(communityAddress) : undefined });
  const sort = parseTopicSort(sortSegment);
  const section = getSectionForCommunity(communityAddress);

  if (!communityAddress || !sort) {
    return <NotFoundMessage />;
  }

  const postFlairs: Tag[] | undefined = community.flairs?.post;
  // Tags search within this community.
  const getTagPath = (tag: string) => getSearchPath({ community: communityAddress, tags: [tag] });

  return (
    <>
      <header className='mb-6'>
        {section ? (
          <CategoryBadge section={section} className='text-xs' />
        ) : (
          <p className='font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground'>{t('community.eyebrow')}</p>
        )}
        <h1 className='mt-2 break-words font-display text-3xl font-semibold text-muted-foreground'>{community.title || getShortAddress(communityAddress)}</h1>
        {community.description ? <p className='mt-1 max-w-3xl text-sm text-muted-foreground'>{community.description}</p> : null}
        <p className='mt-1 break-all text-xs text-muted-foreground/80'>{communityAddress}</p>
        <TagList tags={postFlairs} getTagPath={getTagPath} className='mt-3' />
      </header>

      <div className='mb-4'>
        <SortTabs basePath={`/c/${communityAddress}`} active={sort} />
      </div>
      <TopicList communityAddresses={[communityAddress]} sortType={TOPIC_SORTS[sort]} getTagPath={getTagPath} />
    </>
  );
}
