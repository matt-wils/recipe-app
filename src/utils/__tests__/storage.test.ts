import { describe, it, expect } from 'vitest';
import { formatBytes, usageBuckets } from '../storage';

describe('formatBytes', () => {
  it('renders bytes below 1 KB without a unit conversion', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1023)).toBe('1023 B');
  });

  it('scales into KB/MB/GB with one decimal', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(1.4 * 1024 * 1024)).toBe('1.4 MB');
    expect(formatBytes(832.2 * 1024 * 1024)).toBe('832.2 MB');
    expect(formatBytes(3 * 1024 * 1024 * 1024)).toBe('3.0 GB');
  });

  it('clamps invalid input to 0 B', () => {
    expect(formatBytes(NaN)).toBe('0 B');
    expect(formatBytes(-5)).toBe('0 B');
  });
});

describe('usageBuckets', () => {
  it('returns nothing when the browser omits usageDetails', () => {
    expect(usageBuckets(undefined)).toEqual([]);
  });

  it('labels known buckets and sorts largest-first', () => {
    const buckets = usageBuckets({ indexedDB: 2048, caches: 1024 * 1024 });
    expect(buckets).toEqual([
      { key: 'caches', label: 'Offline app cache', bytes: 1024 * 1024 },
      { key: 'indexedDB', label: 'Favorites & history', bytes: 2048 },
    ]);
  });

  it('drops zero and non-numeric entries and passes through unknown keys', () => {
    const buckets = usageBuckets({
      indexedDB: 0,
      caches: 4096,
      serviceWorkerRegistrations: undefined,
      fileSystem: 8192,
    });
    expect(buckets).toEqual([
      { key: 'fileSystem', label: 'fileSystem', bytes: 8192 },
      { key: 'caches', label: 'Offline app cache', bytes: 4096 },
    ]);
  });
});
