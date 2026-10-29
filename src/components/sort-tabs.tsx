import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DEFAULT_TOPIC_SORT, TOPIC_SORTS, type TopicSort } from '../lib/sorts';
import { withTag } from '../lib/tags';
import { cn } from '../lib/utils';

// Discourse's navigation pills above a topic list, styled as bitsocial.net's filter chips. Switching
// sort keeps the active tag filter.
export default function SortTabs({ basePath, active, tag }: { basePath: string; active: TopicSort; tag?: string }) {
  const { t } = useTranslation();

  return (
    <nav aria-label={t('topics.sortLabel')} className='flex items-center gap-2'>
      {(Object.keys(TOPIC_SORTS) as TopicSort[]).map((sort) => (
        <Link
          key={sort}
          to={withTag(sort === DEFAULT_TOPIC_SORT ? basePath : `${basePath}/${sort}`, tag)}
          aria-current={sort === active ? 'page' : undefined}
          className={cn(
            'blue-hover rounded-full border border-border px-4 py-1.5 font-display text-sm text-muted-foreground',
            sort === active && 'blue-selected text-foreground',
          )}
        >
          {t(`topics.sort.${sort}`)}
        </Link>
      ))}
    </nav>
  );
}
