import type { Player, Restaurant, Review } from '@/types';
import type { RankingEntry, RankingPeriod } from '@/types/scoring';
import { startOfPeriod } from '@/utils/date';
import { computeSuccessRate } from '@/lib/scoring';

/** 计算指定周期内的排行榜 */
export function computeRanking(
  players: Player[],
  restaurants: Restaurant[],
  reviews: Review[],
  period: RankingPeriod,
): RankingEntry[] {
  const startTime = startOfPeriod(period);
  // 周期内有评价的餐厅（已体验）
  const experiencedReviews = reviews.filter(
    (r) => new Date(r.createdAt).getTime() >= startTime,
  );
  // 推荐人在周期内被推荐且已体验的餐厅
  const periodRestaurants = restaurants.filter(
    (r) => r.experienced && new Date(r.updatedAt).getTime() >= startTime,
  );

  const entries: RankingEntry[] = players.map((p) => {
    // 周期内该推荐人推荐的、已体验的餐厅数
    const recommendedExperienced = periodRestaurants.filter(
      (r) => r.recommenderId === p.id,
    );
    const recommendCount = recommendedExperienced.length;
    // 成功数：最终评分 >= 3.5
    const successCount = recommendedExperienced.filter(
      (r) => (r.finalRating ?? 0) >= 3.5,
    ).length;
    const successRate = computeSuccessRate(recommendCount, successCount);
    // 周期内获得的积分（近似：基于推荐餐厅的评分）
    const periodPoints = recommendedExperienced.reduce((sum, r) => {
      const rating = r.finalRating ?? 0;
      if (rating >= 4.5) return sum + 10;
      if (rating >= 3.5) return sum + 7;
      if (rating >= 2.5) return sum + 3;
      if (rating >= 1.5) return sum - 2;
      return sum - 5;
    }, 0);

    void experiencedReviews;

    return {
      playerId: p.id,
      nickname: p.nickname,
      avatar: p.avatar,
      points: periodPoints,
      recommendCount,
      successRate,
      championCount: p.championCount,
      rank: 0,
    };
  });

  entries.sort((a, b) => b.points - a.points || b.successRate - a.successRate);
  entries.forEach((e, i) => {
    e.rank = i + 1;
  });
  return entries;
}

/** 获取今日最佳推荐人（基于今日评价的餐厅） */
export function getTodayBestRecommender(
  players: Player[],
  restaurants: Restaurant[],
): RankingEntry | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayRestaurants = restaurants.filter(
    (r) => r.experienced && new Date(r.updatedAt).getTime() >= today.getTime(),
  );
  if (todayRestaurants.length === 0) {
    // fallback：总积分最高的
    const sorted = [...players].sort((a, b) => b.points - a.points);
    const top = sorted[0];
    if (!top) return null;
    return {
      playerId: top.id,
      nickname: top.nickname,
      avatar: top.avatar,
      points: top.points,
      recommendCount: top.recommendCount,
      successRate: 0,
      championCount: top.championCount,
      rank: 1,
    };
  }
  const best = todayRestaurants.reduce((best, r) => {
    const rating = r.finalRating ?? 0;
    const bestRating = best.finalRating ?? 0;
    return rating > bestRating ? r : best;
  });
  const player = players.find((p) => p.id === best.recommenderId);
  if (!player) return null;
  return {
    playerId: player.id,
    nickname: player.nickname,
    avatar: player.avatar,
    points: player.points,
    recommendCount: player.recommendCount,
    successRate: 0,
    championCount: player.championCount,
    rank: 1,
  };
}
