import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Restaurant } from '@/types/restaurant';
import type { Player } from '@/types/player';
import type { Review } from '@/types/review';
import type { DiaryEntry } from '@/types/diary';
import type { FoodParty } from '@/types/party';
import type { ScoringRule } from '@/types/scoring';

interface LuckyBiteDB extends DBSchema {
  restaurants: {
    key: string;
    value: Restaurant;
    indexes: { 'by-recommender': string; 'by-district': string };
  };
  players: {
    key: string;
    value: Player;
    indexes: { 'by-party': string };
  };
  reviews: {
    key: string;
    value: Review;
    indexes: { 'by-restaurant': string; 'by-player': string };
  };
  diary: {
    key: string;
    value: DiaryEntry;
    indexes: { 'by-date': string };
  };
  parties: {
    key: string;
    value: FoodParty;
    indexes: { 'by-code': string };
  };
  scoringRules: {
    key: string;
    value: ScoringRule;
  };
}

type StoreName = 'restaurants' | 'players' | 'reviews' | 'diary' | 'parties' | 'scoringRules';
type StoreValue<S extends StoreName> = LuckyBiteDB[S]['value'];

const DB_NAME = 'lucky-bite';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<LuckyBiteDB>> | null = null;

function getDB(): Promise<IDBPDatabase<LuckyBiteDB>> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB only available in browser'));
  }
  if (!dbPromise) {
    dbPromise = openDB<LuckyBiteDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('restaurants')) {
          const r = db.createObjectStore('restaurants', { keyPath: 'id' });
          r.createIndex('by-recommender', 'recommenderId');
          r.createIndex('by-district', 'district');
        }
        if (!db.objectStoreNames.contains('players')) {
          const p = db.createObjectStore('players', { keyPath: 'id' });
          p.createIndex('by-party', 'partyId');
        }
        if (!db.objectStoreNames.contains('reviews')) {
          const rv = db.createObjectStore('reviews', { keyPath: 'id' });
          rv.createIndex('by-restaurant', 'restaurantId');
          rv.createIndex('by-player', 'playerId');
        }
        if (!db.objectStoreNames.contains('diary')) {
          const d = db.createObjectStore('diary', { keyPath: 'id' });
          d.createIndex('by-date', 'experienceDate');
        }
        if (!db.objectStoreNames.contains('parties')) {
          const pa = db.createObjectStore('parties', { keyPath: 'id' });
          pa.createIndex('by-code', 'inviteCode');
        }
        if (!db.objectStoreNames.contains('scoringRules')) {
          db.createObjectStore('scoringRules', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function dbGet<S extends StoreName>(
  store: S,
  key: string,
): Promise<StoreValue<S> | undefined> {
  const db = await getDB();
  return db.get(store, key) as Promise<StoreValue<S> | undefined>;
}

export async function dbAll<S extends StoreName>(
  store: S,
): Promise<StoreValue<S>[]> {
  const db = await getDB();
  return db.getAll(store) as Promise<StoreValue<S>[]>;
}

export async function dbPut<S extends StoreName>(
  store: S,
  value: StoreValue<S>,
): Promise<string> {
  const db = await getDB();
  await db.put(store, value);
  return (value as { id: string }).id;
}

export async function dbDelete<S extends StoreName>(
  store: S,
  key: string,
): Promise<void> {
  const db = await getDB();
  await db.delete(store, key);
}

export async function dbClear<S extends StoreName>(store: S): Promise<void> {
  const db = await getDB();
  await db.clear(store);
}

export async function dbGetByIndex<S extends StoreName>(
  store: S,
  indexName: string,
  value: IDBValidKey,
): Promise<StoreValue<S>[]> {
  const db = await getDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as any).getAllFromIndex(store, indexName, value) as Promise<StoreValue<S>[]>;
}

export { getDB };
