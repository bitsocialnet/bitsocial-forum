import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export type Tag = {
  text: string;
  backgroundColor?: string;
  textColor?: string;
};

const chipClassName = 'inline-flex rounded-full border border-border px-2 text-xs leading-5 text-muted-foreground';

// pkc flairs render as Discourse tags in bitsocial.net's chip style: a small pill with a 1px border.
// With `getTagPath` each tag links to a search for it. A community's flair colors are kept when set.
export default function TagList({ tags, getTagPath, className }: { tags?: Tag[]; getTagPath?: (tag: string) => string; className?: string }) {
  if (!tags?.length) return null;

  return (
    <ul className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {tags.map((tag) => {
        const style = tag.backgroundColor ? { backgroundColor: tag.backgroundColor, borderColor: tag.backgroundColor, color: tag.textColor } : undefined;
        return (
          <li key={tag.text}>
            {getTagPath ? (
              <Link to={getTagPath(tag.text)} className={cn(chipClassName, 'blue-hover')} style={style}>
                {tag.text}
              </Link>
            ) : (
              <span className={chipClassName} style={style}>
                {tag.text}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
