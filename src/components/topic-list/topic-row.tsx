import type { Comment } from '@bitsocial/bitsocial-react-hooks';
import { Pin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { withTag } from '../../lib/tags';
import { formatFullDate, formatShortAge } from '../../lib/time';
import TagList from '../tag-list';

export default function TopicRow({ comment, now, listPath, activeTag }: { comment: Comment; now: number; listPath: string; activeTag?: string }) {
  const { t } = useTranslation();
  const author = comment.author?.displayName || comment.author?.shortAddress || comment.author?.address;
  // Activity is the last reply, or the topic itself when nobody replied yet.
  const lastActivity: number | undefined = comment.lastReplyTimestamp ?? comment.timestamp;

  return (
    <tr className='border-b border-border/50 align-top'>
      <td className='py-3 pe-4'>
        <div className='flex items-start gap-1.5'>
          {comment.pinned ? <Pin aria-label={t('topics.pinned')} className='mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground' /> : null}
          <Link to={`/c/${comment.communityAddress}/t/${comment.cid}`} className='break-words text-base font-medium leading-snug text-foreground hover:text-blue-glow'>
            {comment.title || t('topics.untitled')}
          </Link>
        </div>
        <div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-1'>
          {author ? <span className='text-xs text-muted-foreground'>{author}</span> : null}
          <TagList tags={comment.flairs} getTagPath={(tag) => withTag(listPath, tag)} activeTag={activeTag} />
        </div>
      </td>
      <td className='py-3 text-center text-muted-foreground max-sm:hidden'>{comment.replyCount ?? 0}</td>
      <td className='py-3 text-end text-muted-foreground'>
        {typeof lastActivity === 'number' ? (
          <time dateTime={new Date(lastActivity * 1000).toISOString()} title={formatFullDate(lastActivity)}>
            {formatShortAge(lastActivity, now)}
          </time>
        ) : null}
      </td>
    </tr>
  );
}
