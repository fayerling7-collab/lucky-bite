import type { Review } from '@/types/review';
import type { ScoringRule } from '@/types/scoring';

/** 计算推荐人获得的积分（根据平均分匹配规则） */
export function computeRecommenderPoints(avgRating: number, rules: ScoringRule[]): number {
  const rule = rules.find(
    (r) => r.active && avgRating >= r.minAvg && avgRating <= r.maxAvg,
  );
  return rule?.points ?? 0;
}

/** 计算餐厅最终评分（所有玩家所有维度的平均） */
export function computeFinalRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const allDims = reviews.flatMap((r) => [r.food, r.environment, r.service, r.value]);
  return Math.round((allDims.reduce((a, b) => a + b, 0) / allDims.length) * 10) / 10;
}

/** 推荐成功率：推荐过的餐厅中最终评分 >= 3.5 的比例 */
export function computeSuccessRate(
  recommendCount: number,
  successCount: number,
): number {
  if (recommendCount === 0) return 0;
  return Math.round((successCount / recommendCount) * 100);
}

/** 根据评分返回星级显示 */
export function ratingToStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return '★'.repeat(full) + (half ? '☆' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
}
