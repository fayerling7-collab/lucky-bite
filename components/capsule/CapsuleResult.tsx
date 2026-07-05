'use client';

import { motion } from 'framer-motion';
import { MapPin, JapaneseYen, Star, ClipboardList, Dices, Clover, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PastelCard } from '@/components/common/PastelCard';
import { cuisineEmoji } from '@/components/restaurant/RestaurantCard';
import type { Restaurant } from '@/types/restaurant';
import type { Player } from '@/types/player';

interface CapsuleResultProps {
  restaurant: Restaurant;
  recommender?: Player;
  onAgain: () => void;
  onDetail: () => void;
  onReview: () => void;
  onKeep: () => void;
  onRemove: () => void;
}

/** 扭蛋结果展示组件（抽取动画后展示中奖餐厅大卡片） */
export function CapsuleResult({
  restaurant,
  recommender,
  onAgain,
  onDetail,
  onReview,
  onKeep,
  onRemove,
}: CapsuleResultProps) {
  const emoji = restaurant.coverImage ? '' : cuisineEmoji(restaurant.cuisine);

  return (
    <motion.div
      initial={{ y: 80, scale: 0.8, opacity: 0 }}
      animate={{ y: 0, scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 180, damping: 14 }}
      className="mx-auto w-full max-w-md"
    >
      <PastelCard variant="pink" className="flex flex-col items-center gap-4 p-6 shadow-soft-lg">
        {/* 标题：弹簧动画 */}
        <motion.h2
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 8, delay: 0.1 }}
          className="text-2xl font-extrabold text-coral"
        >
          🎉 恭喜抽中！
        </motion.h2>

        {/* 大封面 emoji + 渐变 */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 10, delay: 0.2 }}
          className="flex h-32 w-full items-center justify-center rounded-3xl bg-gradient-to-br from-blush to-butter shadow-soft"
        >
          {restaurant.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={restaurant.coverImage}
              alt={restaurant.name}
              className="h-full w-full rounded-3xl object-cover"
            />
          ) : (
            <span className="text-7xl drop-shadow-md">{emoji}</span>
          )}
        </motion.div>

        {/* 餐厅名（大字）+ 门店名 */}
        <div className="text-center">
          <h3 className="text-2xl font-extrabold text-slate-700">{restaurant.name}</h3>
          {restaurant.branchName && (
            <p className="text-sm text-slate-400">{restaurant.branchName}</p>
          )}
        </div>

        {/* 菜系 + 地区 + 人均 */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="rounded-full bg-sky-soft/30 px-3 py-1 font-bold text-sky-deep">
            {restaurant.cuisine}
          </span>
          <span className="flex items-center gap-0.5 rounded-full bg-mint/40 px-3 py-1 font-bold text-emerald-700">
            <MapPin className="h-3 w-3" /> {restaurant.district}
          </span>
          <span className="flex items-center gap-0.5 rounded-full bg-butter/60 px-3 py-1 font-bold text-amber-700">
            <JapaneseYen className="h-3 w-3" /> {restaurant.avgPrice}
          </span>
        </div>

        {/* 推荐人 */}
        {recommender && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-lavender/50 text-base">
              {recommender.avatar}
            </span>
            <span>
              由 <span className="font-bold text-lavender">{recommender.nickname}</span> 推荐
            </span>
          </div>
        )}

        {/* 按钮组 */}
        <div className="mt-2 grid w-full grid-cols-2 gap-3">
          <Button variant="primary" onClick={onDetail} className="col-span-2">
            <ClipboardList className="h-4 w-4" /> 📋 查看详情
          </Button>
          <Button variant="lavender" onClick={onAgain}>
            <Dices className="h-4 w-4" /> 🎲 再抽一次
          </Button>
          <Button variant="mint" onClick={onReview}>
            <Star className="h-4 w-4" /> ⭐ 立即评价
          </Button>
          <Button variant="ghost" onClick={onKeep}>
            <Clover className="h-4 w-4" /> 🍀 继续保留
          </Button>
          <Button
            variant="ghost"
            onClick={onRemove}
            className="text-coral hover:bg-coral/10"
          >
            <Trash2 className="h-4 w-4" /> 🗑 移出扭蛋池
          </Button>
        </div>
      </PastelCard>
    </motion.div>
  );
}
