'use client';

import { motion } from 'framer-motion';
import { Crown, Star, Award, Heart, Calendar, Trophy, Utensils, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PastelCard } from '@/components/common/PastelCard';
import { formatDateChinese } from '@/utils/date';
import type { Player } from '@/types/player';
import type { Restaurant } from '@/types/restaurant';
import type { Review } from '@/types/review';
import type { DiaryEntry } from '@/types/diary';
import { getLevel, getLevelTitle } from '@/types/player';

interface PlayerProfileProps {
  player: Player;
  restaurants: Restaurant[];
  reviews: Review[];
  diary: DiaryEntry[];
}

export function PlayerProfile({ player, restaurants, reviews, diary }: PlayerProfileProps) {
  const level = getLevel(player.points);
  const title = getLevelTitle(level);
  // 推荐过的餐厅
  const recommended = restaurants.filter((r) => r.recommenderId === player.id);
  // 历史评价数
  const reviewCount = reviews.filter((r) => r.playerId === player.id).length;
  // 参与的日记数
  const diaryCount = diary.filter((d) => d.participantIds.includes(player.id)).length;
  // 收藏餐厅数
  const favoriteCount = player.favoriteRestaurantIds.length;

  // 统计网格
  const stats = [
    { label: '推荐餐厅', value: player.recommendCount, icon: Utensils, color: 'text-sky-deep' },
    { label: '已体验', value: player.experiencedCount, icon: Star, color: 'text-amber-500' },
    { label: '积分', value: player.points, icon: Sparkles, color: 'text-coral' },
    { label: '等级', value: `Lv.${level}`, icon: Trophy, color: 'text-purple-600' },
    { label: '冠军次数', value: player.championCount, icon: Crown, color: 'text-amber-700' },
    { label: '评价数', value: reviewCount, icon: Award, color: 'text-emerald-600' },
    { label: '收藏数', value: favoriteCount, icon: Heart, color: 'text-pink-500' },
    { label: '日记数', value: diaryCount, icon: Calendar, color: 'text-slate-500' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* 顶部资料卡 */}
      <PastelCard variant="lavender" className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blush to-lavender text-5xl shadow-soft-lg">
          {player.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-2xl font-extrabold text-slate-700">
            {player.nickname}
          </h2>
          <p className="text-sm font-bold text-purple-600">{title}</p>
          <p className="mt-1 text-xs text-slate-400">
            加入于 {formatDateChinese(player.joinedAt)}
          </p>
        </div>
        {player.championCount > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-butter/80 px-3 py-1 text-sm font-bold text-amber-700 shadow-pop">
            <Crown className="h-4 w-4" />
            {player.championCount} 冠
          </div>
        )}
      </PastelCard>

      {/* 数据统计网格 */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <PastelCard variant="sky" className="flex flex-col items-center p-3 text-center">
              <s.icon className={cn('mb-1 h-5 w-5', s.color)} />
              <p className="text-lg font-extrabold text-slate-700">{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </PastelCard>
          </motion.div>
        ))}
      </div>

      {/* 徽章墙 */}
      <PastelCard variant="butter" className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-700" />
          <h3 className="font-display text-lg font-bold text-slate-700">徽章墙</h3>
        </div>
        {player.badges.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {player.badges.map((b, i) => (
              <motion.span
                key={`${b}-${i}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
                className="rounded-full bg-white/80 px-3 py-1 text-sm font-bold text-amber-700 shadow-soft"
              >
                🏅 {b}
              </motion.span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">暂无徽章，继续努力～</p>
        )}
      </PastelCard>

      {/* 推荐过的餐厅（前 3 个） */}
      {recommended.length > 0 && (
        <PastelCard variant="mint" className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-emerald-600" />
            <h3 className="font-display text-lg font-bold text-slate-700">我推荐的餐厅</h3>
          </div>
          <div className="flex flex-col gap-2">
            {recommended.slice(0, 3).map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-2 rounded-2xl bg-white/60 px-3 py-2"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mint/60 text-lg">
                  🍽️
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-700">{r.name}</p>
                  <p className="text-xs text-slate-400">
                    {r.cuisine} · {r.district}
                  </p>
                </div>
                {r.finalRating != null && (
                  <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                    <Star className="h-3 w-3 fill-current" />
                    {r.finalRating}
                  </span>
                )}
              </div>
            ))}
          </div>
        </PastelCard>
      )}
    </div>
  );
}
