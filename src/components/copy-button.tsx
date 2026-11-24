import { useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '../lib/utils';

type CopyButtonProps = {
  text: string;
  label: string;
  copiedLabel: string;
  className?: string;
};

const COPIED_FEEDBACK_MS = 2000;

// A small icon button that copies `text` and confirms with a check mark. It renders nothing where the
// Clipboard API is missing (the build also runs from file:// and plain-http gateways), because the
// text beside it can still be selected by hand.
export default function CopyButton({ text, label, copiedLabel, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  if (typeof navigator === 'undefined' || !navigator.clipboard) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Permission denied or the document lost focus: leave the icon unchanged instead of claiming success.
      return;
    }
    clearTimeout(resetTimer.current);
    setCopied(true);
    resetTimer.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  };

  return (
    <>
      <button
        type='button'
        onClick={copy}
        aria-label={label}
        title={copied ? copiedLabel : label}
        className={cn('blue-hover inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground touch-manipulation', className)}
      >
        {copied ? <Check aria-hidden className='size-3.5' /> : <Copy aria-hidden className='size-3.5' />}
      </button>
      <span role='status' className='sr-only'>
        {copied ? copiedLabel : ''}
      </span>
    </>
  );
}
