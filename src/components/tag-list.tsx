import { cn } from '../lib/utils';

export type Tag = {
  text: string;
  backgroundColor?: string;
  textColor?: string;
};

// pkc flairs render as Discourse tags in bitsocial.net's chip style: a small pill with a 1px border.
// A community's flair colors are kept when it sets them.
export default function TagList({ tags, className }: { tags?: Tag[]; className?: string }) {
  if (!tags?.length) return null;

  return (
    <ul className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {tags.map((tag) => (
        <li
          key={tag.text}
          className='rounded-full border border-border px-2 text-xs leading-5 text-muted-foreground'
          style={tag.backgroundColor ? { backgroundColor: tag.backgroundColor, borderColor: tag.backgroundColor, color: tag.textColor } : undefined}
        >
          {tag.text}
        </li>
      ))}
    </ul>
  );
}
