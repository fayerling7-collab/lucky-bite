'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Player } from '@/types/player';
import { getLevel, getLevelTitle } from '@/types/player';

interface PlayerCardProps {
  player: Player;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export function PlayerCard({ player, selected, onClick, compact }: PlayerCardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileTap={onClick ? { scale: 0.96 } : undefined}
      whileHover={onClick ? { y: -2 } : undefined}
      className={cn(
        'relative flex items-center gap-3 rounded-2xl border-2 bg-white/70 p-3 backdrop-blur transition-colors',
        selected ? 'border-sky-deep bg-sky-soft/30 shadow-soft' : 'border-white/70 shadow-soft',
        onClick && 'cursor-pointer',
      )}
    >
      {/* 选中标记 */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-sky-deep text-white shadow-pop"
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </motion.div>
      )}

      {/* 头像 */}
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blush to-lavender shadow-soft',
          compact ? 'h-10 w-10 text-xl' : 'h-14 w-14 text-3xl',
        )}
      >
        {player.avatar}
      </div>

      {/* 信息 */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-700">{player.nickname}</p>
        <p className="text-xs text-slate-500">
          Lv.{getLevel(player.points)} · {getLevelTitle(getLevel(player.points))}
        </p>
        {!compact && (
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="rounded-full bg-butter/60 px-1.5 py-0.5 font-bold text-amber-700">
              ⭐ {player.points}
            </span>
            {player.championCount > 0 && (
              <span className="rounded-full bg-coral/40 px-1.5 py-0.5 font-bold text-coral">
                👑 {player.championCount}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
