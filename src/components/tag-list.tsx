import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export type Tag = {
  text: string;
  backgroundColor?: string;
  textColor?: string;
};

const chipClassName = 'inline-flex rounded-full border border-border px-2 text-xs leading-5 text-muted-foreground';

// pkc flairs render as Discourse tags in bitsocial.net's chip style: a small pill with a 1px border.
// With `getTagPath` each tag links to a topic list filtered by it; the active tag links back to the
// unfiltered list. A community's flair colors are kept when it sets them.
export default function TagList({
  tags,
  getTagPath,
  activeTag,
  className,
}: {
  tags?: Tag[];
  getTagPath?: (tag: string | undefined) => string;
  activeTag?: string;
  className?: string;
}) {
  if (!tags?.length) return null;

  return (
    <ul className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {tags.map((tag) => {
        const isActive = tag.text === activeTag;
        const style = tag.backgroundColor && !isActive ? { backgroundColor: tag.backgroundColor, borderColor: tag.backgroundColor, color: tag.textColor } : undefined;
        return (
          <li key={tag.text}>
            {getTagPath ? (
              <Link
                to={getTagPath(isActive ? undefined : tag.text)}
                aria-current={isActive ? 'true' : undefined}
                className={cn(chipClassName, 'blue-hover', isActive && 'blue-selected text-foreground')}
                style={style}
              >
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
