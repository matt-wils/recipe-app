import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export const DB_NAME = 'recipe-app-db';
export const DB_VERSION = 2;

export const META_STORE = 'meta';

// Legacy stores from v1 (recipes are now bundled from git, not stored locally).
const RECIPES_STORE = 'recipes';
const PHOTOS_STORE = 'photos';

export interface MetaRecord {
  key: string;
  value: unknown;
}

export interface RecipeDB extends DBSchema {
  meta: {
    key: string;
    value: MetaRecord;
  };
}

let dbPromise: Promise<IDBPDatabase<RecipeDB>> | null = null;

function open(): Promise<IDBPDatabase<RecipeDB>> {
  return openDB<RecipeDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'key' });
      }
      // v2: recipes moved to the bundled git library; drop the old local stores.
      // These names are no longer in the schema type, so cast to satisfy idb.
      for (const legacy of [RECIPES_STORE, PHOTOS_STORE] as const) {
        if (db.objectStoreNames.contains(legacy as never)) {
          db.deleteObjectStore(legacy as never);
        }
      }
    },
  });
}

export function getDb(): Promise<IDBPDatabase<RecipeDB>> {
  if (!dbPromise) {
    dbPromise = open();
  }
  return dbPromise;
}

/**
 * Best-effort request to exempt this origin from storage eviction.
 * iOS may decline; per-device state (shuffle weighting, favorites, shopping
 * list) is then lost on eviction. Recipes live in git, so they're never at risk.
 * Safe to call repeatedly. Returns whether storage is persisted.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) {
    return false;
  }
  if (await navigator.storage.persisted()) {
    return true;
  }
  return navigator.storage.persist();
}

/**
 * Test-only: delete and recreate the database so each test starts clean.
 * Relies on fake-indexeddb being installed globally in test-setup.
 */
export async function resetDbForTests(): Promise<void> {
  if (dbPromise) {
    (await dbPromise).close();
    dbPromise = null;
  }
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
}
