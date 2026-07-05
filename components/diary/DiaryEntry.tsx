'use client';

import { motion } from 'framer-motion';
import { Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StarRating } from '@/components/review/StarRating';
import { formatDateChinese } from '@/utils/date';
import type { DiaryEntry as DiaryEntryType } from '@/types/diary';
import type { Player } from '@/types/player';
import type { Restaurant } from '@/types/restaurant';

interface DiaryEntryProps {
  entry: DiaryEntryType;
  players: Player[];
  restaurant?: Restaurant;
}

// 胶带颜色（半透明 pastel）
const TAPE_COLORS = [
  'bg-blush/60',
  'bg-mint/60',
  'bg-butter/60',
  'bg-lavender/60',
  'bg-sky-soft/60',
];

// 基于字符串稳定生成 -1 / 0 / 1 的倾斜角度
function stableHash(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return hash;
}

export function DiaryEntry({ entry, players, restaurant }: DiaryEntryProps) {
  const tilt = (stableHash(entry.id) % 3) - 1; // -1 / 0 / 1
  const tapeColor = TAPE_COLORS[stableHash(entry.id + 'tape') % TAPE_COLORS.length];
  const recommender = players.find((p) => p.id === entry.recommenderId);
  const participants = entry.participantIds
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, rotate: tilt }}
      animate={{ opacity: 1, scale: 1, rotate: tilt }}
      whileHover={{ y: -4, rotate: 0, transition: { type: 'spring', stiffness: 300 } }}
      className="relative rounded-3xl border-2 border-white/70 bg-gradient-to-br from-cream/80 via-blush/40 to-lavender/40 p-5 shadow-soft backdrop-blur-md"
    >
      {/* 顶部胶带装饰 */}
      <div
        className={cn(
          'absolute -top-2 left-1/2 h-6 w-20 -translate-x-1/2 rotate-6 rounded-sm shadow-sm',
          tapeColor,
        )}
      />

      {/* 日期 */}
      <div className="mb-2 flex items-center gap-1.5 text-xs text-slate-500">
        <Calendar className="h-3.5 w-3.5" />
        <span className="font-display font-bold">{formatDateChinese(entry.experienceDate)}</span>
      </div>

      {/* 餐厅名 */}
      <h3 className="font-display text-2xl font-extrabold text-slate-700">
        {entry.restaurantName}
      </h3>

      {/* 菜系 + 地区标签 */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {entry.restaurantCuisine && (
          <span className="rounded-full bg-sky-soft/30 px-2.5 py-0.5 text-xs font-bold text-sky-deep">
            {entry.restaurantCuisine}
          </span>
        )}
        {restaurant?.district && (
          <span className="rounded-full bg-mint/40 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            📍 {restaurant.district}
          </span>
        )}
      </div>

      {/* 评分 */}
      <div className="mt-3 flex items-center gap-2">
        <StarRating value={Math.round(entry.finalRating)} size="sm" />
        <span className="text-sm font-bold text-amber-500">
          {entry.finalRating.toFixed(1)}
        </span>
      </div>

      {/* 参与人员 */}
      {participants.length > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-slate-400">参与</span>
          <div className="flex -space-x-2">
            {participants.map((p) => (
              <div
                key={p.id}
                title={p.nickname}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-lavender/50 text-lg shadow-sm"
              >
                {p.avatar}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 推荐人 */}
      {recommender && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <User className="h-3 w-3" />
          <span>推荐人 · {recommender.nickname}</span>
        </div>
      )}

      {/* 感受 */}
      {entry.feeling && (
        <div className="mt-3 rounded-2xl bg-white/60 p-3 text-sm italic text-slate-600">
          💭 {entry.feeling}
        </div>
      )}
    </motion.div>
  );
}
