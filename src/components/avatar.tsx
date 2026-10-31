import { UserRound } from 'lucide-react';

// Avatars until profiles exist. An author with a display name gets a letter avatar whose color comes
// from their address, so it stays stable across posts; anyone else gets the default person icon on an
// opaque grey circle, which stays visible on white surfaces and over banners.
const AVATAR_COLORS = ['#1a4fd0', '#0e7490', '#7c3aed', '#b45309', '#be123c', '#15803d', '#4b5563', '#9333ea'];

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

export default function Avatar({ name, seed, size = 40 }: { name?: string; seed?: string; size?: number }) {
  const letter = name?.trim().charAt(0).toUpperCase();

  if (!letter) {
    return (
      <span
        aria-hidden='true'
        className='inline-flex shrink-0 items-center justify-center rounded-full bg-silver-bright text-muted-foreground dark:bg-muted'
        style={{ width: size, height: size }}
      >
        <UserRound style={{ width: Math.round(size * 0.55), height: Math.round(size * 0.55) }} strokeWidth={1.75} />
      </span>
    );
  }

  return (
    <span
      aria-hidden='true'
      className='inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white'
      style={{ width: size, height: size, fontSize: Math.round(size * 0.45), backgroundColor: AVATAR_COLORS[hashString(seed || name || '') % AVATAR_COLORS.length] }}
    >
      {letter}
    </span>
  );
}
