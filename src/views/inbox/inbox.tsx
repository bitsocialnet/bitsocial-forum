import { Inbox as InboxIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Placeholder for the account's notifications: replies, mentions and moderator messages.
export default function Inbox() {
  const { t } = useTranslation();

  return (
    <div className='max-w-3xl'>
      <h1 className='mb-6 font-display text-3xl font-semibold text-muted-foreground'>{t('inbox.title')}</h1>
      <div className='glass-panel flex flex-col items-center px-6 py-12 text-center'>
        <span className='inline-flex h-14 w-14 items-center justify-center rounded-full bg-silver-bright text-muted-foreground dark:bg-muted'>
          <InboxIcon aria-hidden className='h-6 w-6' />
        </span>
        <p className='mt-4 font-semibold text-foreground'>{t('inbox.emptyTitle')}</p>
        <p className='mt-1 max-w-md text-sm leading-relaxed text-muted-foreground'>{t('inbox.emptyDescription')}</p>
      </div>
    </div>
  );
}
