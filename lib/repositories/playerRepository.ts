import type { Player, NewPlayerInput } from '@/types/player';
import { getLevel } from '@/types/player';
import { dbAll, dbPut, dbGet } from '@/lib/storage/indexedDB';
import { genId } from '@/lib/utils';

export interface PlayerRepository {
  list(): Promise<Player[]>;
  getById(id: string): Promise<Player | null>;
  create(data: NewPlayerInput): Promise<Player>;
  update(id: string, data: Partial<Player>): Promise<Player>;
  addPoints(id: string, delta: number): Promise<void>;
  recordChampion(id: string): Promise<void>;
  incrementRecommend(id: string): Promise<void>;
  incrementExperienced(id: string): Promise<void>;
  toggleFavorite(id: string, restaurantId: string): Promise<void>;
}

export const playerRepository: PlayerRepository = {
  async list(): Promise<Player[]> {
    return dbAll('players');
  },

  async getById(id: string): Promise<Player | null> {
    const p = await dbGet('players', id);
    return p ?? null;
  },

  async create(data: NewPlayerInput): Promise<Player> {
    const player: Player = {
      id: genId('p_'),
      nickname: data.nickname,
      avatar: data.avatar,
      joinedAt: new Date().toISOString(),
      points: 0,
      level: 1,
      badges: [],
      recommendCount: 0,
      experiencedCount: 0,
      championCount: 0,
      favoriteRestaurantIds: [],
    };
    await dbPut('players', player);
    return player;
  },

  async update(id: string, data: Partial<Player>): Promise<Player> {
    const existing = await dbGet('players', id);
    if (!existing) throw new Error(`Player ${id} not found`);
    const updated: Player = { ...existing, ...data, id };
    updated.level = getLevel(updated.points);
    await dbPut('players', updated);
    return updated;
  },

  async addPoints(id: string, delta: number): Promise<void> {
    const p = await dbGet('players', id);
    if (!p) return;
    p.points += delta;
    p.level = getLevel(p.points);
    await dbPut('players', p);
  },

  async recordChampion(id: string): Promise<void> {
    const p = await dbGet('players', id);
    if (!p) return;
    p.championCount += 1;
    await dbPut('players', p);
  },

  async incrementRecommend(id: string): Promise<void> {
    const p = await dbGet('players', id);
    if (!p) return;
    p.recommendCount += 1;
    await dbPut('players', p);
  },

  async incrementExperienced(id: string): Promise<void> {
    const p = await dbGet('players', id);
    if (!p) return;
    p.experiencedCount += 1;
    await dbPut('players', p);
  },

  async toggleFavorite(id: string, restaurantId: string): Promise<void> {
    const p = await dbGet('players', id);
    if (!p) return;
    const idx = p.favoriteRestaurantIds.indexOf(restaurantId);
    if (idx >= 0) {
      p.favoriteRestaurantIds.splice(idx, 1);
    } else {
      p.favoriteRestaurantIds.push(restaurantId);
    }
    await dbPut('players', p);
  },
};
