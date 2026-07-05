// 玩家相关类型定义

export interface Player {
  id: string;
  nickname: string;
  avatar: string;
  joinedAt: string;
  points: number;
  level: number;
  badges: string[];
  recommendCount: number;
  experiencedCount: number;
  championCount: number;
  favoriteRestaurantIds: string[];
  partyId?: string;
}

export interface NewPlayerInput {
  nickname: string;
  avatar: string;
}

// 等级计算：每 50 分一级
export function getLevel(points: number): number {
  return Math.floor(points / 50) + 1;
}

// 等级对应的称号
export function getLevelTitle(level: number): string {
  if (level >= 10) return '美食传说';
  if (level >= 7) return '美食大王';
  if (level >= 5) return '美食达人';
  if (level >= 3) return '美食探险家';
  if (level >= 2) return '美食爱好者';
  return '美食新手';
}
