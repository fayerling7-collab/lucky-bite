// 积分规则类型定义

export interface ScoringRule {
  id: string;
  minAvg: number;   // 评分区间下限（含）
  maxAvg: number;   // 评分区间上限（含）
  points: number;   // 推荐人获得积分（可为负）
  active: boolean;
  label: string;    // 显示标签，如 "★★★★★"
}

export type RankingPeriod = 'week' | 'month' | 'quarter' | 'all';

export interface RankingEntry {
  playerId: string;
  nickname: string;
  avatar: string;
  points: number;
  recommendCount: number;
  successRate: number;     // 推荐成功率
  championCount: number;
  rank: number;
}
