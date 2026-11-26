import { useComment, useReplies } from '@bitsocial/bitsocial-react-hooks';
import { Reply } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/button';
import CategoryBadge from '../../components/category-badge';
import NotFoundMessage from '../../components/not-found-message';
import Post from '../../components/post';
import TagList from '../../components/tag-list';
import { getShortAddress, toCommunityIdentifier } from '../../lib/community-identifier';
import { getSearchPath } from '../../lib/search';
import { getSectionForCommunity } from '../../lib/sections';

// A topic reads top to bottom, oldest reply first and without nesting, like Discourse.
export default function Topic() {
  const { t } = useTranslation();
  const { communityAddress, commentCid } = useParams();
  const comment = useComment({ commentCid, community: communityAddress ? toCommunityIdentifier(communityAddress) : undefined });
  const { replies, hasMore, loadMore } = useReplies({ comment: comment.cid ? comment : undefined, sortType: 'old', flat: true });
  // Before the topic loads, the hooks hold a placeholder with only its cid, so a timestamp is what
  // marks it loaded. A topic pkc-js gave up on, such as an invalid record, is 'failed' instead.
  const isLoaded = typeof comment.timestamp === 'number';
  const isFailed = !isLoaded && comment.state === 'failed';
  const now = Date.now();

  if (!communityAddress || !commentCid) {
    return <NotFoundMessage />;
  }

  // The URL's community only helps fetch the topic, and pkc-js accepts a topic from another community
  // unless both are names. Once loaded, label the topic with the community it was posted to.
  const topicCommunityAddress: string = (isLoaded && comment.communityAddress) || communityAddress;
  const section = getSectionForCommunity(topicCommunityAddress);

  return (
    <div className='max-w-3xl'>
      <header className='mb-6'>
        <h1 className='break-words font-display text-3xl font-semibold leading-tight text-muted-foreground'>
          {comment.title || (isLoaded ? t('topics.untitled') : isFailed ? t('topic.loadFailed') : t('topic.loading'))}
        </h1>
        <div className='mt-2 flex flex-wrap items-center gap-3'>
          {section ? (
            <CategoryBadge section={section} />
          ) : (
            <Link to={`/c/${topicCommunityAddress}`} className='text-sm text-muted-foreground hover:text-foreground'>
              {getShortAddress(topicCommunityAddress)}
            </Link>
          )}
          <TagList
            tags={comment.flairs}
            getTagPath={(tag) => getSearchPath(section ? { section: section.code, tags: [tag] } : { community: topicCommunityAddress, tags: [tag] })}
          />
        </div>
      </header>

      {isLoaded ? (
        <>
          <div className='glass-panel px-5 sm:px-6 [&>article:last-child]:border-b-0'>
            <Post comment={comment} number={1} now={now} />
            {replies.map((reply, index) => (
              <Post key={reply.cid} comment={reply} number={index + 2} now={now} />
            ))}
          </div>
          {hasMore ? (
            <Button variant='outline' className='mt-5' onClick={() => void loadMore()}>
              {t('topic.loadMoreReplies')}
            </Button>
          ) : null}
          <div className='mt-6 flex items-center gap-3'>
            <Button disabled title={t('topics.postingSoon')}>
              <Reply aria-hidden />
              {t('topic.reply')}
            </Button>
            <span className='text-xs text-muted-foreground'>{t('topics.postingSoon')}</span>
          </div>
        </>
      ) : null}
    </div>
  );
}
