'use client';

import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PastelCard } from '@/components/common/PastelCard';
import type { RankingEntry } from '@/types/scoring';
import type { Player } from '@/types/player';

interface RankingListProps {
  entries: RankingEntry[];
  players: Player[];
  currentUserId?: string;
}

// 前三名奖牌
const RANK_MEDAL: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

export function RankingList({
  entries,
  players: _players,
  currentUserId,
}: RankingListProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-lavender/50 bg-white/40 p-8 text-center text-slate-400 backdrop-blur">
        暂无排行数据
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {entries.map((entry, i) => {
        const isCurrent = entry.playerId === currentUserId;
        const medal = RANK_MEDAL[entry.rank];

        return (
          <motion.div
            key={entry.playerId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
          >
            <PastelCard
              variant={isCurrent ? 'sky' : 'pink'}
              className={cn(
                'flex items-center gap-3 p-3',
                isCurrent && 'ring-2 ring-sky-deep/60',
              )}
            >
              {/* 排名 */}
              <div className="flex w-9 shrink-0 items-center justify-center text-xl font-extrabold text-slate-600">
                {medal ?? <span className="text-base text-slate-400">#{entry.rank}</span>}
              </div>

              {/* 头像 */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/70 text-2xl shadow-soft">
                {entry.avatar}
              </div>

              {/* 昵称与统计 */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-bold text-slate-700">
                    {entry.nickname}
                  </p>
                  {isCurrent && (
                    <span className="rounded-full bg-sky-deep px-1.5 py-0.5 text-[10px] font-bold text-white">
                      我
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  推荐 {entry.recommendCount} 次 · 成功率 {entry.successRate}%
                </p>
              </div>

              {/* 冠军次数 */}
              {entry.championCount > 0 && (
                <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-butter/70 px-2 py-0.5 text-xs font-bold text-amber-700">
                  <Crown className="h-3 w-3" />
                  {entry.championCount}
                </div>
              )}

              {/* 积分 */}
              <div className="shrink-0 text-right">
                <p className="text-lg font-extrabold leading-none text-coral">
                  {entry.points}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400">积分</p>
              </div>
            </PastelCard>
          </motion.div>
        );
      })}
    </div>
  );
}
