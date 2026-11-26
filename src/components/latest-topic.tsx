import { useFeed } from '@bitsocial/bitsocial-react-hooks';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useCommunitiesLoadStatus } from '../hooks/use-communities-load-status';
import { toCommunityIdentifier } from '../lib/community-identifier';
import { formatShortAge } from '../lib/time';

// The newest topic of a section's community, for the categories table's "Latest" column.
export default function LatestTopic({ communityAddress }: { communityAddress: string }) {
  const { t } = useTranslation();
  const { feed, hasMore } = useFeed({ communities: [toCommunityIdentifier(communityAddress)], sortType: 'new', postsPerPage: 1 });
  const loadStatus = useCommunitiesLoadStatus([communityAddress]);
  const topic = feed[0];

  if (!topic) {
    return (
      <span className='text-xs text-muted-foreground'>
        {loadStatus === 'unreachable'
          ? t('topics.unreachable', { count: 1 })
          : loadStatus === 'retrying'
            ? t('topics.retrying', { count: 1 })
            : hasMore
              ? t('topics.loading')
              : t('topics.empty')}
      </span>
    );
  }

  return (
    <div className='flex items-baseline justify-between gap-3'>
      <Link to={`/c/${topic.communityAddress}/t/${topic.cid}`} className='min-w-0 truncate text-sm text-foreground hover:text-blue-glow'>
        {topic.title || t('topics.untitled')}
      </Link>
      {typeof topic.timestamp === 'number' ? <span className='shrink-0 text-xs text-muted-foreground'>{formatShortAge(topic.timestamp, Date.now())}</span> : null}
    </div>
  );
}
