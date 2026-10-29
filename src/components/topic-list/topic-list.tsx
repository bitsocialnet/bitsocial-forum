import { useFeed } from '@bitsocial/bitsocial-react-hooks';
import { useTranslation } from 'react-i18next';
import { toCommunityIdentifier } from '../../lib/community-identifier';
import { TOPIC_SORTS, type TopicSort } from '../../lib/sorts';
import { getTagFeedFilter } from '../../lib/tags';
import { Button } from '../button';
import TopicRow from './topic-row';

const TOPICS_PER_PAGE = 30;

// Discourse's topic table inside a bitsocial.net glass panel. `listPath` is the page showing the list,
// so a row's tags filter that same list.
export default function TopicList({ communityAddress, sort, tag, listPath }: { communityAddress: string; sort: TopicSort; tag?: string; listPath: string }) {
  const { t } = useTranslation();
  const { feed, hasMore, loadMore } = useFeed({
    communities: [toCommunityIdentifier(communityAddress)],
    sortType: TOPIC_SORTS[sort],
    postsPerPage: TOPICS_PER_PAGE,
    filter: tag ? getTagFeedFilter(tag) : undefined,
  });
  const now = Date.now();

  if (feed.length === 0) {
    return (
      <p className='glass-panel px-6 py-10 text-center text-sm text-muted-foreground'>
        {hasMore ? t('topics.loading') : tag ? t('topics.emptyTag', { tag }) : t('topics.empty')}
      </p>
    );
  }

  return (
    <>
      <div className='glass-panel overflow-hidden px-5 sm:px-6'>
        <table className='w-full table-fixed border-collapse text-sm'>
          <thead>
            <tr className='border-b border-border/60 font-display text-xs uppercase tracking-[0.12em] text-muted-foreground'>
              <th scope='col' className='py-3 pe-4 text-start font-semibold'>
                {t('topics.topic')}
              </th>
              <th scope='col' className='w-20 py-3 text-center font-semibold max-sm:hidden'>
                {t('topics.replies')}
              </th>
              <th scope='col' className='w-20 py-3 text-end font-semibold'>
                {t('topics.activity')}
              </th>
            </tr>
          </thead>
          <tbody className='[&>tr:last-child]:border-b-0'>
            {feed.map((comment) => (
              <TopicRow key={comment.cid} comment={comment} now={now} listPath={listPath} activeTag={tag} />
            ))}
          </tbody>
        </table>
      </div>
      {hasMore ? (
        <div className='mt-5 flex justify-center'>
          <Button variant='outline' onClick={() => void loadMore()}>
            {t('topics.loadMore')}
          </Button>
        </div>
      ) : null}
    </>
  );
}
