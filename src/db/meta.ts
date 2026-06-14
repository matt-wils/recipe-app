import { getDb, META_STORE } from './client';

/** Generic key-value access to the `meta` store (per-device app state). */

export async function getMeta<T>(key: string): Promise<T | undefined> {
  const db = await getDb();
  const record = await db.get(META_STORE, key);
  return record?.value as T | undefined;
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  const db = await getDb();
  await db.put(META_STORE, { key, value });
}
