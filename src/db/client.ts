import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Recipe, RecipePhoto } from '../types';

export const DB_NAME = 'recipe-app-db';
export const DB_VERSION = 1;

export const RECIPES_STORE = 'recipes';
export const PHOTOS_STORE = 'photos';
export const META_STORE = 'meta';

export interface MetaRecord {
  key: string;
  value: unknown;
}

export interface RecipeDB extends DBSchema {
  recipes: {
    key: string;
    value: Recipe;
    indexes: {
      name: string;
      createdAt: number;
      tags: string;
    };
  };
  photos: {
    key: string;
    value: RecipePhoto;
  };
  meta: {
    key: string;
    value: MetaRecord;
  };
}

let dbPromise: Promise<IDBPDatabase<RecipeDB>> | null = null;

function open(): Promise<IDBPDatabase<RecipeDB>> {
  return openDB<RecipeDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Version 1 - initial schema.
      if (!db.objectStoreNames.contains(RECIPES_STORE)) {
        const recipes = db.createObjectStore(RECIPES_STORE, { keyPath: 'id' });
        recipes.createIndex('name', 'name');
        recipes.createIndex('createdAt', 'createdAt');
        recipes.createIndex('tags', 'tags', { multiEntry: true });
      }
      if (!db.objectStoreNames.contains(PHOTOS_STORE)) {
        db.createObjectStore(PHOTOS_STORE, { keyPath: 'recipeId' });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'key' });
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
 * iOS may decline; the JSON backup remains the real source of truth.
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
