// Letter avatars until profiles exist: the color is derived from the author's address so it stays
// stable across posts, and the letter from the display name when there is one.
const AVATAR_COLORS = ['#1a4fd0', '#0e7490', '#7c3aed', '#b45309', '#be123c', '#15803d', '#4b5563', '#9333ea'];

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

// Every Bitsocial address starts with the same peer ID prefix, so skip it or every anonymous avatar reads "1".
const PEER_ID_PREFIX = /^12D3KooW/;

export default function Avatar({ name, seed, size = 40 }: { name?: string; seed?: string; size?: number }) {
  const letter = (name || seed || '?').trim().replace(PEER_ID_PREFIX, '').charAt(0).toUpperCase() || '?';

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
