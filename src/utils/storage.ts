/**
 * Human-readable byte size, e.g. "1.4 MB". Uses binary (1024) units to match
 * what browsers report from `navigator.storage.estimate()`.
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}

/**
 * Per-bucket storage breakdown. Chrome/Edge expose `usageDetails` on the
 * estimate; Safari/Firefox omit it, leaving only the (padded) total.
 */
export interface UsageDetails {
  indexedDB?: number;
  caches?: number;
  serviceWorkerRegistrations?: number;
  [key: string]: number | undefined;
}

// Friendly names for the buckets we expect; unknown keys fall back to the raw key.
const BUCKET_LABELS: Record<string, string> = {
  indexedDB: 'Favorites & history',
  caches: 'Offline app cache',
  serviceWorkerRegistrations: 'Service worker',
};

export interface UsageBucket {
  key: string;
  label: string;
  bytes: number;
}

/**
 * Labeled, non-zero usage buckets sorted largest-first. Returns an empty array
 * when the browser doesn't provide a breakdown (so the UI shows just the total).
 */
export function usageBuckets(details: UsageDetails | undefined): UsageBucket[] {
  if (!details) return [];
  return Object.entries(details)
    .filter((entry): entry is [string, number] => typeof entry[1] === 'number' && entry[1] > 0)
    .map(([key, bytes]) => ({ key, label: BUCKET_LABELS[key] ?? key, bytes }))
    .sort((a, b) => b.bytes - a.bytes);
}
