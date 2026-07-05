'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { RankingEntry } from '@/types/scoring';
import type { Player } from '@/types/player';
import { getLevel, getLevelTitle } from '@/types/player';

interface ChampionPodiumProps {
  entries: RankingEntry[];
  players: Player[];
}

// 不同名次的视觉样式
const RANK_STYLES: Record<
  1 | 2 | 3,
  {
    order: string;
    avatarSize: string;
    cardHeight: string;
    gradient: string;
    border: string;
    medal: string;
    glow: string;
  }
> = {
  1: {
    order: 'order-2',
    avatarSize: 'h-24 w-24 text-5xl',
    cardHeight: 'min-h-[7.5rem]',
    gradient: 'from-butter to-coral',
    border: 'border-amber-300',
    medal: '🥇',
    glow: 'shadow-[0_0_40px_rgba(255,233,168,0.7)]',
  },
  2: {
    order: 'order-1 self-end',
    avatarSize: 'h-20 w-20 text-4xl',
    cardHeight: 'min-h-[5.5rem]',
    gradient: 'from-sky-soft to-lavender',
    border: 'border-slate-300',
    medal: '🥈',
    glow: '',
  },
  3: {
    order: 'order-3 self-end',
    avatarSize: 'h-16 w-16 text-3xl',
    cardHeight: 'min-h-[5rem]',
    gradient: 'from-blush to-coral',
    border: 'border-orange-300',
    medal: '🥉',
    glow: '',
  },
};

// 散落的彩带装饰
const CONFETTI = ['🎉', '✨', '🎊', '⭐', '💫', '🎈', '🌟', '🎀'];

export function ChampionPodium({ entries, players: _players }: ChampionPodiumProps) {
  const top3 = entries.slice(0, 3);

  if (top3.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-lavender/50 bg-white/40 p-10 text-center text-slate-400 backdrop-blur">
        <div className="mb-2 text-4xl">🏆</div>
        还没有排行数据，快去推荐餐厅吧～
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-cream/80 via-blush/30 to-lavender/30 p-6 shadow-soft backdrop-blur">
      {/* 散落的彩带装饰 */}
      {CONFETTI.map((emoji, i) => (
        <motion.span
          key={i}
          className="animate-sparkle pointer-events-none absolute text-2xl"
          style={{
            top: `${8 + (i * 13) % 35}%`,
            left: `${4 + (i * 19) % 92}%`,
            animationDelay: `${i * 0.3}s`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 + i * 0.1 }}
        >
          {emoji}
        </motion.span>
      ))}

      {/* 领奖台 */}
      <div className="relative flex items-end justify-center gap-3 sm:gap-6">
        {top3.map((entry) => {
          const rank = entry.rank as 1 | 2 | 3;
          const style = RANK_STYLES[rank];
          const isFirst = rank === 1;
          // 第三名先入场，第一名最后（最有戏剧性）
          const delay = (3 - rank) * 0.18;

          return (
            <motion.div
              key={entry.playerId}
              className={cn('flex flex-col items-center', style.order)}
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 140, damping: 14, delay }}
            >
              {/* 皇冠（仅第一名） */}
              {isFirst && (
                <motion.div
                  initial={{ y: -100, opacity: 0, rotate: -20 }}
                  animate={{ y: -10, opacity: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.7 }}
                  className="animate-wiggle relative z-10 mb-1 text-3xl"
                >
                  👑
                </motion.div>
              )}

              {/* 头像 */}
              <div className="relative mb-2">
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full bg-gradient-to-br shadow-soft-lg',
                    style.avatarSize,
                    style.gradient,
                    style.glow,
                    isFirst && 'animate-breathe',
                  )}
                >
                  <span>{entry.avatar}</span>
                </div>
                <span className="absolute -bottom-1 -right-1 text-2xl">
                  {style.medal}
                </span>
              </div>

              {/* 信息卡 */}
              <div
                className={cn(
                  'flex w-24 flex-col items-center rounded-2xl border-2 bg-white/80 px-2 py-2 backdrop-blur sm:w-28',
                  style.border,
                  style.cardHeight,
                )}
              >
                <p className="line-clamp-1 text-sm font-bold text-slate-700">
                  {entry.nickname}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  Lv.{getLevel(entry.points)} {getLevelTitle(getLevel(entry.points))}
                </p>
                <p className="mt-1 text-lg font-extrabold text-coral">
                  {entry.points}
                </p>
                <p className="text-[10px] text-slate-400">成功率 {entry.successRate}%</p>
                {isFirst && (
                  <span className="mt-1 rounded-full bg-amber-300/80 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    👑 美食大王
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
