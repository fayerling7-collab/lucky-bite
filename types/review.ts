// 评价相关类型定义

export interface Review {
  id: string;
  restaurantId: string;
  playerId: string;
  food: number;          // 1-5
  environment: number;   // 1-5
  service: number;       // 1-5
  value: number;         // 1-5
  wouldReturn: boolean;
  wouldRecommend: boolean;
  feeling?: string;
  createdAt: string;
}

export interface NewReviewInput {
  restaurantId: string;
  playerId: string;
  food: number;
  environment: number;
  service: number;
  value: number;
  wouldReturn: boolean;
  wouldRecommend: boolean;
  feeling?: string;
}

// 计算单条评价的平均分
export function reviewAverage(review: Pick<Review, 'food' | 'environment' | 'service' | 'value'>): number {
  return (review.food + review.environment + review.service + review.value) / 4;
}
