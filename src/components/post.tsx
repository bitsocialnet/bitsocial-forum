import type { Comment } from '@bitsocial/bitsocial-react-hooks';
import { formatFullDate, formatShortAge } from '../lib/time';
import Avatar from './avatar';

// One post in a topic, laid out like Discourse: avatar column, name and age, then the body.
export default function Post({ comment, number, now }: { comment: Comment; number: number; now: number }) {
  const displayName: string | undefined = comment.author?.displayName;
  const address: string | undefined = comment.author?.shortAddress || comment.author?.address;

  return (
    <article id={`post-${number}`} className='flex gap-3 border-b border-border/50 py-5'>
      <Avatar name={displayName} seed={comment.author?.address} size={44} />
      <div className='min-w-0 flex-1'>
        <header className='flex items-baseline justify-between gap-3'>
          <p className='min-w-0 truncate text-sm'>
            <span className='font-semibold text-foreground'>{displayName || address}</span>
            {displayName && address ? <span className='ms-2 text-xs text-muted-foreground'>{address}</span> : null}
          </p>
          {typeof comment.timestamp === 'number' ? (
            <time className='shrink-0 text-xs text-muted-foreground' title={formatFullDate(comment.timestamp)}>
              {formatShortAge(comment.timestamp, now)}
            </time>
          ) : null}
        </header>
        {comment.content ? <div className='mt-2 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-foreground'>{comment.content}</div> : null}
        {comment.link ? (
          <a href={comment.link} target='_blank' rel='noopener noreferrer nofollow' className='mt-2 inline-block break-all text-sm text-blue-glow hover:underline'>
            {comment.link}
          </a>
        ) : null}
      </div>
    </article>
  );
}
