import { openDB, type IDBPDatabase } from 'idb';
import type { MistakeItem } from '../types';

const DB_NAME = 'ChildMistakeBookDB';
const DB_VERSION = 1;
const STORE_NAME = 'mistakes';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('subject', 'subject', { unique: false });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      },
    });
  }
  return dbPromise;
}

export async function dbGetAllMistakes(): Promise<MistakeItem[]> {
  const db = await getDb();
  const all = await db.getAll(STORE_NAME);
  return all as MistakeItem[];
}

export async function dbSaveMistake(item: MistakeItem): Promise<void> {
  const db = await getDb();
  await db.put(STORE_NAME, item);
}

export async function dbDeleteMistake(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}
