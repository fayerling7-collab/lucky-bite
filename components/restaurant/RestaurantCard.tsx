'use client';

import { motion } from 'framer-motion';
import { MapPin, JapaneseYen, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Restaurant } from '@/types/restaurant';
import type { Player } from '@/types/player';

// 菜系 → emoji 映射
const CUISINE_EMOJI: Record<string, string> = {
  中餐: '🍜', 粤菜: '🥟', 川菜: '🌶', 湘菜: '🌶', 火锅: '🍲',
  烧烤: '🍖', 日料: '🍣', 韩餐: '🍖', 西餐: '🥩', 东南亚菜: '🍛',
  咖啡: '☕', 甜品: '🍰', Brunch: '🍳', 下午茶: '🧁', 酒吧: '🍸',
};

// pastel 变体
type PastelVariant = 'sky' | 'pink' | 'mint' | 'butter' | 'lavender' | 'coral';
const VARIANTS: PastelVariant[] = ['sky', 'pink', 'mint', 'butter', 'lavender', 'coral'];

const COVER_GRADIENT: Record<PastelVariant, string> = {
  sky: 'from-sky-soft to-sky-deep',
  pink: 'from-blush to-coral',
  mint: 'from-mint to-mint',
  butter: 'from-butter to-butter',
  lavender: 'from-lavender to-lavender',
  coral: 'from-coral to-blush',
};

const CARD_BORDER: Record<PastelVariant, string> = {
  sky: 'border-sky-soft/60',
  pink: 'border-blush/60',
  mint: 'border-mint/60',
  butter: 'border-butter/60',
  lavender: 'border-lavender/60',
  coral: 'border-coral/60',
};

// 根据 id 哈希稳定地选择 variant
function hashVariant(id: string): PastelVariant {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return VARIANTS[hash % VARIANTS.length];
}

export function cuisineEmoji(cuisine: string): string {
  return CUISINE_EMOJI[cuisine] ?? '🍽️';
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  recommender?: Player;
  onClick?: () => void;
  index?: number;
}

/** 状态徽章：在池中 / 已体验 / 已移出 */
function StatusBadge({ r }: { r: Restaurant }) {
  if (r.experienced) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-butter/80 px-2.5 py-1 text-xs font-bold text-amber-700 shadow-sm">
        <Star className="h-3 w-3 fill-current" /> 已体验
      </span>
    );
  }
  if (r.inPool) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-mint/80 px-2.5 py-1 text-xs font-bold text-emerald-700 shadow-sm">
        🟢 在池中
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/80 px-2.5 py-1 text-xs font-bold text-slate-500 shadow-sm">
      ⚪ 已移出
    </span>
  );
}

/** 餐厅卡片（用于首页左右滚动列） */
export function RestaurantCard({
  restaurant,
  recommender,
  onClick,
  index = 0,
}: RestaurantCardProps) {
  const variant = hashVariant(restaurant.id);
  const emoji = restaurant.coverImage ? '' : cuisineEmoji(restaurant.cuisine);

  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? { y: -6, scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4), type: 'spring', stiffness: 120 }}
      className={cn(
        'w-64 shrink-0 cursor-pointer overflow-hidden rounded-3xl border-2 bg-white/70 shadow-soft backdrop-blur-md',
        CARD_BORDER[variant],
        onClick && 'cursor-pointer',
      )}
    >
      {/* 封面占位区 */}
      <div
        className={cn(
          'relative flex h-28 items-center justify-center bg-gradient-to-br',
          COVER_GRADIENT[variant],
        )}
      >
        {restaurant.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={restaurant.coverImage}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-5xl drop-shadow-sm">{emoji}</span>
        )}
        <div className="absolute left-2 top-2">
          <StatusBadge r={restaurant} />
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-base font-bold text-slate-700">
            {restaurant.name}
          </h3>
          {restaurant.officialRating ? (
            <span className="flex shrink-0 items-center gap-0.5 text-xs font-bold text-amber-500">
              <Star className="h-3 w-3 fill-current" />
              {restaurant.officialRating}
            </span>
          ) : null}
        </div>

        {restaurant.branchName && (
          <p className="line-clamp-1 text-xs text-slate-400">{restaurant.branchName}</p>
        )}

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-sky-soft/20 px-2 py-0.5 font-medium text-sky-deep">
            {restaurant.cuisine}
          </span>
          <span className="flex items-center gap-0.5">
            <MapPin className="h-3 w-3" />
            {restaurant.district}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-0.5 text-sm font-bold text-coral">
            <JapaneseYen className="h-3.5 w-3.5" />
            {restaurant.avgPrice}
          </span>
          {recommender && (
            <span className="flex items-center gap-1.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lavender/50 text-sm">
                {recommender.avatar}
              </span>
              <span className="max-w-[5rem] truncate text-xs text-slate-400">
                {recommender.nickname}
              </span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
