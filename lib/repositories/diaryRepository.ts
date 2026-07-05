import type { DiaryEntry } from '@/types/diary';
import type { Restaurant } from '@/types/restaurant';
import type { Review } from '@/types/review';
import { dbAll, dbPut } from '@/lib/storage/indexedDB';
import { genId } from '@/lib/utils';
import { computeFinalRating } from '@/lib/scoring';

export interface DiaryRepository {
  list(): Promise<DiaryEntry[]>;
  createFromExperience(
    restaurant: Restaurant,
    reviews: Review[],
    recommenderId: string,
  ): Promise<DiaryEntry>;
}

export const diaryRepository: DiaryRepository = {
  async list(): Promise<DiaryEntry[]> {
    const all = await dbAll('diary');
    return all.sort(
      (a, b) => new Date(b.experienceDate).getTime() - new Date(a.experienceDate).getTime(),
    );
  },

  async createFromExperience(
    restaurant: Restaurant,
    reviews: Review[],
    recommenderId: string,
  ): Promise<DiaryEntry> {
    const finalRating = computeFinalRating(reviews);
    const entry: DiaryEntry = {
      id: genId('d_'),
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantCuisine: restaurant.cuisine,
      participantIds: reviews.map((r) => r.playerId),
      reviewIds: reviews.map((r) => r.id),
      finalRating,
      recommenderId,
      experienceDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      feeling: reviews.map((r) => r.feeling).filter(Boolean).join(' / '),
    };
    await dbPut('diary', entry);
    return entry;
  },
};
