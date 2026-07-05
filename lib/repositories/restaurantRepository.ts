import type { Restaurant, NewRestaurantInput, RestaurantFilter } from '@/types/restaurant';
import { dbAll, dbPut, dbDelete, dbGet, dbGetByIndex } from '@/lib/storage/indexedDB';
import { genId } from '@/lib/utils';

export interface RestaurantRepository {
  list(filter?: RestaurantFilter): Promise<Restaurant[]>;
  getById(id: string): Promise<Restaurant | null>;
  listInPool(): Promise<Restaurant[]>;
  create(data: NewRestaurantInput): Promise<Restaurant>;
  update(id: string, data: Partial<Restaurant>): Promise<Restaurant>;
  softDelete(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
  favorite(id: string, fav: boolean, playerId: string): Promise<void>;
}

function matchesFilter(r: Restaurant, filter?: RestaurantFilter): boolean {
  if (!filter) return true;
  if (filter.cuisine?.length && !filter.cuisine.includes(r.cuisine)) return false;
  if (filter.district?.length && !filter.district.includes(r.district)) return false;
  if (filter.maxBudget && r.avgPrice > filter.maxBudget) return false;
  if (filter.minBudget && r.avgPrice < filter.minBudget) return false;
  if (filter.lunch && !r.supportsLunch) return false;
  if (filter.dinner && !r.supportsDinner) return false;
  if (filter.tags?.length && !filter.tags.some((t) => r.tags.includes(t))) return false;
  return true;
}

export const restaurantRepository: RestaurantRepository = {
  async list(filter?: RestaurantFilter): Promise<Restaurant[]> {
    const all = await dbAll('restaurants');
    return all.filter((r) => matchesFilter(r, filter));
  },

  async getById(id: string): Promise<Restaurant | null> {
    const r = await dbGet('restaurants', id);
    return r ?? null;
  },

  async listInPool(): Promise<Restaurant[]> {
    const all = await dbAll('restaurants');
    return all.filter((r) => r.inPool);
  },

  async create(data: NewRestaurantInput): Promise<Restaurant> {
    const now = new Date().toISOString();
    const restaurant: Restaurant = {
      ...data,
      district: data.district ?? '未设置',
      tags: data.tags ?? [],
      id: genId('r_'),
      experienced: false,
      photos: data.photos ?? [],
      createdAt: now,
      updatedAt: now,
    };
    await dbPut('restaurants', restaurant);
    return restaurant;
  },

  async update(id: string, data: Partial<Restaurant>): Promise<Restaurant> {
    const existing = await dbGet('restaurants', id);
    if (!existing) throw new Error(`Restaurant ${id} not found`);
    const updated: Restaurant = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    await dbPut('restaurants', updated);
    return updated;
  },

  async softDelete(id: string): Promise<void> {
    await restaurantRepository.update(id, { inPool: false });
  },

  async hardDelete(id: string): Promise<void> {
    await dbDelete('restaurants', id);
  },

  async favorite(id: string, fav: boolean, playerId: string): Promise<void> {
    const r = await dbGet('restaurants', id);
    if (!r) return;
    // 收藏逻辑由 playerRepository 维护 favoriteRestaurantIds
    void fav;
    void playerId;
  },
};

export async function getRestaurantsByRecommender(recommenderId: string): Promise<Restaurant[]> {
  return dbGetByIndex('restaurants', 'by-recommender', recommenderId);
}
