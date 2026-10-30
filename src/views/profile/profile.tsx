import { useAccount, useAccountComments, type Comment } from '@bitsocial/bitsocial-react-hooks';
import { Server, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Avatar from '../../components/avatar';
import Banner from '../../components/banner';
import { Button } from '../../components/button';
import { HOME_BANNER } from '../../lib/banners';
import { getShortAddress } from '../../lib/community-identifier';
import { formatFullDate, formatShortAge } from '../../lib/time';

const panelHeadingClassName = 'font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground';

// Where an account comment opens: its topic, or the topic it replies to. Unpublished comments have no link yet.
function getCommentPath(comment: Comment): string | undefined {
  if (!comment.cid || !comment.communityAddress) return undefined;
  return `/c/${comment.communityAddress}/t/${comment.postCid ?? comment.cid}`;
}

// The active account's profile. The profile node (an author community hosted by Forge RPC or the
// user's own node) is not built yet, so that card describes it and its action is disabled.
export default function Profile() {
  const { t } = useTranslation();
  const account = useAccount();
  const { accountComments } = useAccountComments();
  const address: string | undefined = account?.author?.address;
  const displayName: string | undefined = account?.author?.displayName;
  const comments = [...(accountComments ?? [])].reverse();
  const now = Date.now();

  return (
    <div className='flex max-w-3xl flex-col gap-6'>
      <section className='glass-panel overflow-hidden'>
        <Banner sources={HOME_BANNER} className='h-24 sm:h-28' />
        <div className='flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-start'>
          <div className='relative -mt-10 w-fit rounded-full ring-4 ring-background'>
            <Avatar name={displayName} seed={address} size={80} />
          </div>
          <div className='min-w-0 flex-1 sm:pt-3'>
            <h1 className='break-words font-display text-3xl font-semibold text-muted-foreground'>{displayName || t('profile.anonymous')}</h1>
            {address ? <p className='mt-1 break-all text-sm text-muted-foreground'>{address}</p> : null}
          </div>
          <p className='text-sm text-muted-foreground sm:pt-4'>{t('profile.postCount', { count: comments.length })}</p>
        </div>
      </section>

      <section className='glass-panel px-6 py-5' aria-labelledby='profile-node'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <h2 id='profile-node' className={panelHeadingClassName}>
            {t('profile.nodeTitle')}
          </h2>
          <span className='rounded-full border border-border px-2.5 text-xs leading-6 text-muted-foreground'>{t('profile.nodeStatus')}</span>
        </div>
        <p className='mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground'>{t('profile.nodeDescription')}</p>
        <ul className='mt-3 flex flex-col gap-1.5 text-sm text-muted-foreground'>
          <li className='flex items-center gap-2'>
            <Server aria-hidden className='h-4 w-4 shrink-0' />
            {t('profile.nodeHosting')}
          </li>
          <li className='flex items-center gap-2'>
            <UserPlus aria-hidden className='h-4 w-4 shrink-0' />
            {t('profile.nodeLink', { link: address ? `forum.bitsocial.net/#/u/${getShortAddress(address)}` : 'forum.bitsocial.net/#/u/…' })}
          </li>
        </ul>
        <div className='mt-5 flex items-center gap-3'>
          <Button disabled title={t('profile.nodeComingSoon')}>
            {t('profile.createNode')}
          </Button>
          <span className='text-xs text-muted-foreground'>{t('profile.nodeComingSoon')}</span>
        </div>
      </section>

      <section className='glass-panel px-6 py-5' aria-labelledby='profile-posts'>
        <h2 id='profile-posts' className={panelHeadingClassName}>
          {t('profile.postsTitle')}
        </h2>
        {comments.length === 0 ? (
          <p className='mt-3 text-sm text-muted-foreground'>{t('profile.noPosts')}</p>
        ) : (
          <ul className='mt-2 divide-y divide-border/50'>
            {comments.map((comment, index) => {
              const path = getCommentPath(comment);
              const label = comment.title || comment.content || t('topics.untitled');
              return (
                <li key={comment.cid ?? `pending-${index}`} className='flex items-baseline justify-between gap-4 py-3'>
                  <div className='min-w-0'>
                    {path ? (
                      <Link to={path} className='line-clamp-1 break-words text-sm font-medium text-foreground transition-colors hover:text-blue-glow'>
                        {label}
                      </Link>
                    ) : (
                      <span className='line-clamp-1 break-words text-sm text-muted-foreground'>{label}</span>
                    )}
                    <p className='mt-0.5 text-xs text-muted-foreground'>
                      {comment.parentCid ? t('profile.reply') : t('profile.topic')}
                      {comment.communityAddress ? ` · ${getShortAddress(comment.communityAddress)}` : null}
                      {path ? null : ` · ${t('profile.pending')}`}
                    </p>
                  </div>
                  {typeof comment.timestamp === 'number' ? (
                    <time className='shrink-0 text-xs text-muted-foreground' title={formatFullDate(comment.timestamp)}>
                      {formatShortAge(comment.timestamp, now)}
                    </time>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
