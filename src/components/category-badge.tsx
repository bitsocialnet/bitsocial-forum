import { Link } from 'react-router-dom';
import type { ForumSection } from '../data/sections';
import { cn } from '../lib/utils';

// Discourse's "bullet" category badge: a colored square and the name.
export default function CategoryBadge({ section, className }: { section: Pick<ForumSection, 'code' | 'color' | 'title'>; className?: string }) {
  return (
    <Link to={`/s/${section.code}`} className={cn('inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground', className)}>
      <span aria-hidden='true' className='h-2.5 w-2.5 shrink-0 rounded-[2px]' style={{ backgroundColor: section.color }} />
      {section.title}
    </Link>
  );
}
