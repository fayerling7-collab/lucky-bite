import type { ScoringRule } from '@/types/scoring';

// 默认积分规则（可配置，不写死）
// 5★ → +10, 4★ → +7, 3★ → +3, 2★ → -2, 1★ → -5
export const DEFAULT_SCORING_RULES: ScoringRule[] = [
  { id: 'rule-5', minAvg: 4.5, maxAvg: 5.0, points: 10, active: true, label: '★★★★★' },
  { id: 'rule-4', minAvg: 3.5, maxAvg: 4.49, points: 7, active: true, label: '★★★★☆' },
  { id: 'rule-3', minAvg: 2.5, maxAvg: 3.49, points: 3, active: true, label: '★★★☆☆' },
  { id: 'rule-2', minAvg: 1.5, maxAvg: 2.49, points: -2, active: true, label: '★★☆☆☆' },
  { id: 'rule-1', minAvg: 1.0, maxAvg: 1.49, points: -5, active: true, label: '★☆☆☆☆' },
];
