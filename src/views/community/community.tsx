import { useCommunity } from '@bitsocial/bitsocial-react-hooks';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import CategoryBadge from '../../components/category-badge';
import NotFoundMessage from '../../components/not-found-message';
import SortTabs from '../../components/sort-tabs';
import TagList, { type Tag } from '../../components/tag-list';
import TopicList from '../../components/topic-list';
import { getShortAddress, toCommunityIdentifier } from '../../lib/community-identifier';
import { getSectionForCommunity } from '../../lib/sections';
import { DEFAULT_TOPIC_SORT, parseTopicSort } from '../../lib/sorts';
import { TAG_SEARCH_PARAM, withTag } from '../../lib/tags';

// Any community opens by its exact address, whether or not it holds a section.
export default function Community() {
  const { t } = useTranslation();
  const { communityAddress, sort: sortSegment } = useParams();
  const [searchParams] = useSearchParams();
  const tag = searchParams.get(TAG_SEARCH_PARAM) || undefined;
  const community = useCommunity({ community: communityAddress ? toCommunityIdentifier(communityAddress) : undefined });
  const sort = parseTopicSort(sortSegment);
  const section = getSectionForCommunity(communityAddress);

  if (!communityAddress || !sort) {
    return <NotFoundMessage />;
  }

  const basePath = `/c/${communityAddress}`;
  const listPath = sort === DEFAULT_TOPIC_SORT ? basePath : `${basePath}/${sort}`;
  // The community's own post flair set, or at least the tag being filtered by.
  const postFlairs: Tag[] = community.flairs?.post ?? (tag ? [{ text: tag }] : []);

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
        <TagList tags={postFlairs} getTagPath={(nextTag) => withTag(listPath, nextTag)} activeTag={tag} className='mt-3' />
      </header>

      <div className='mb-4'>
        <SortTabs basePath={basePath} active={sort} tag={tag} />
      </div>
      <TopicList communityAddress={communityAddress} sort={sort} tag={tag} listPath={listPath} />
    </>
  );
}
