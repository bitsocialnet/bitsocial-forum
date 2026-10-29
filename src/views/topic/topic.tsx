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
import { getSectionForCommunity } from '../../lib/sections';

// A topic reads top to bottom, oldest reply first and without nesting, like Discourse.
export default function Topic() {
  const { t } = useTranslation();
  const { communityAddress, commentCid } = useParams();
  const comment = useComment({ commentCid, community: communityAddress ? toCommunityIdentifier(communityAddress) : undefined });
  const { replies, hasMore, loadMore } = useReplies({ comment: comment.cid ? comment : undefined, sortType: 'old', flat: true });
  const section = getSectionForCommunity(communityAddress);
  const now = Date.now();

  if (!communityAddress || !commentCid) {
    return <NotFoundMessage />;
  }

  return (
    <div className='max-w-3xl'>
      <header className='mb-6'>
        <h1 className='break-words font-display text-3xl font-semibold leading-tight text-muted-foreground'>
          {comment.title || (comment.cid ? t('topics.untitled') : t('topic.loading'))}
        </h1>
        <div className='mt-2 flex flex-wrap items-center gap-3'>
          {section ? (
            <CategoryBadge section={section} />
          ) : (
            <Link to={`/c/${communityAddress}`} className='text-sm text-muted-foreground hover:text-foreground'>
              {getShortAddress(communityAddress)}
            </Link>
          )}
          <TagList tags={comment.flairs} />
        </div>
      </header>

      {comment.cid ? (
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
