const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Discourse-style compact age for topic lists and posts: "now", "5m", "3h", "2d", then a date.
// pkc timestamps are in seconds.
export function formatShortAge(timestampSeconds: number, nowMs: number, locale = 'en'): string {
  const elapsed = Math.max(0, Math.round(nowMs / 1000 - timestampSeconds));
  if (elapsed < MINUTE) return 'now';
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h`;
  if (elapsed < 30 * DAY) return `${Math.floor(elapsed / DAY)}d`;

  const date = new Date(timestampSeconds * 1000);
  const sameYear = date.getUTCFullYear() === new Date(nowMs).getUTCFullYear();
  return date.toLocaleDateString(locale, sameYear ? { month: 'short', day: 'numeric' } : { month: 'short', year: 'numeric' });
}

export function formatFullDate(timestampSeconds: number, locale = 'en'): string {
  return new Date(timestampSeconds * 1000).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
}
