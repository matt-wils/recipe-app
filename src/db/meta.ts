import { getDb, META_STORE } from './client';

const LAST_BACKUP_KEY = 'lastBackupAt';

async function getMeta<T>(key: string): Promise<T | undefined> {
  const db = await getDb();
  const record = await db.get(META_STORE, key);
  return record?.value as T | undefined;
}

async function setMeta(key: string, value: unknown): Promise<void> {
  const db = await getDb();
  await db.put(META_STORE, { key, value });
}

export function getLastBackupAt(): Promise<number | undefined> {
  return getMeta<number>(LAST_BACKUP_KEY);
}

export function setLastBackupAt(timestamp: number): Promise<void> {
  return setMeta(LAST_BACKUP_KEY, timestamp);
}
