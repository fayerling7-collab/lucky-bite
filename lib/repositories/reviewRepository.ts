import type { Review, NewReviewInput } from '@/types/review';
import { dbAll, dbPut, dbGet, dbGetByIndex } from '@/lib/storage/indexedDB';
import { genId } from '@/lib/utils';

export interface ReviewRepository {
  listByRestaurant(restaurantId: string): Promise<Review[]>;
  listByPlayer(playerId: string): Promise<Review[]>;
  listAll(): Promise<Review[]>;
  create(data: NewReviewInput): Promise<Review>;
  getById(id: string): Promise<Review | null>;
}

export const reviewRepository: ReviewRepository = {
  async listByRestaurant(restaurantId: string): Promise<Review[]> {
    return dbGetByIndex('reviews', 'by-restaurant', restaurantId);
  },

  async listByPlayer(playerId: string): Promise<Review[]> {
    return dbGetByIndex('reviews', 'by-player', playerId);
  },

  async listAll(): Promise<Review[]> {
    return dbAll('reviews');
  },

  async getById(id: string): Promise<Review | null> {
    const r = await dbGet('reviews', id);
    return r ?? null;
  },

  async create(data: NewReviewInput): Promise<Review> {
    const review: Review = {
      id: genId('rv_'),
      ...data,
      createdAt: new Date().toISOString(),
    };
    await dbPut('reviews', review);
    return review;
  },
};
