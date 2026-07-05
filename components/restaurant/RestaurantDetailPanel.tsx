'use client';

import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Clock, JapaneseYen, Heart, Pencil, Trash2, X,
  Sun, Moon, Utensils, MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Restaurant } from '@/types/restaurant';
import type { Player } from '@/types/player';
import { cuisineEmoji } from './RestaurantCard';

interface RestaurantDetailPanelProps {
  restaurant: Restaurant | null;
  recommender?: Player;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onFavorite?: () => void;
  onReview?: () => void;
  isFavorite?: boolean;
}

/** 餐厅详情浮层：从底部弹出 + 缩放进入（简化版） */
export function RestaurantDetailPanel({
  restaurant,
  recommender,
  onClose,
  onEdit,
  onDelete,
  onFavorite,
  onReview,
  isFavorite,
}: RestaurantDetailPanelProps) {
  return (
    <AnimatePresence>
      {restaurant && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-4xl bg-white/85 shadow-soft-lg backdrop-blur-xl"
          >
            {/* 顶部关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-slate-400 shadow-soft transition hover:bg-white hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            {/* 可滚动内容 */}
            <div className="no-scrollbar flex-1 overflow-y-auto">
              {/* 大封面区 */}
              <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-sky-soft via-blush to-lavender">
                {restaurant.coverImage ? (
                  <img src={restaurant.coverImage} alt={restaurant.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-7xl drop-shadow">{cuisineEmoji(restaurant.cuisine)}</span>
                )}
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              <div className="flex flex-col gap-4 p-5">
                {/* 标题行 */}
                <div>
                  <h2 className="text-2xl font-bold text-slate-700">{restaurant.name}</h2>
                  {restaurant.branchName && <p className="mt-0.5 text-sm text-slate-400">{restaurant.branchName}</p>}
                </div>

                {/* 菜系 */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-sky-soft/25 px-3 py-1 text-xs font-bold text-sky-deep">
                    <Utensils className="h-3 w-3" /> {restaurant.cuisine}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-coral/30 px-3 py-1 text-xs font-bold text-coral">
                    <MapPin className="h-3 w-3" /> {restaurant.district}
                  </span>
                </div>

                {/* 详细地址 */}
                <div className="flex items-start gap-2 rounded-2xl bg-mint/20 p-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                  <span className="text-sm text-slate-600">{restaurant.address}</span>
                </div>

                {/* 营业时间 */}
                <div className="flex items-center gap-2 rounded-2xl bg-sky-soft/20 p-3">
                  <Clock className="h-4 w-4 shrink-0 text-sky-deep" />
                  <span className="text-sm text-slate-600">{restaurant.businessHours || '营业时间未填写'}</span>
                </div>

                {/* 午市/晚市 + 人均 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-butter/20 p-3">
                    <span className="text-xs font-bold text-amber-700">午市 / 晚市</span>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={cn('flex items-center gap-1 text-xs font-medium', restaurant.supportsLunch ? 'text-amber-600' : 'text-slate-300')}>
                        <Sun className="h-3 w-3" /> 午市
                      </span>
                      <span className={cn('flex items-center gap-1 text-xs font-medium', restaurant.supportsDinner ? 'text-purple-600' : 'text-slate-300')}>
                        <Moon className="h-3 w-3" /> 晚市
                      </span>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-blush/20 p-3">
                    <span className="text-xs font-bold text-coral">人均价格</span>
                    <p className="mt-1 text-lg font-bold text-slate-700">¥{restaurant.avgPrice}</p>
                  </div>
                </div>

                {/* 推荐人 */}
                {recommender && (
                  <div className="flex items-center gap-3 rounded-2xl bg-lavender/30 p-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-xl">
                      {recommender.avatar}
                    </span>
                    <div>
                      <p className="text-xs text-slate-400">推荐人</p>
                      <p className="text-sm font-bold text-slate-700">{recommender.nickname}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 底部按钮组 */}
            <div className="flex flex-wrap gap-2 border-t border-white/60 bg-white/50 p-3">
              <Button variant="ghost" size="sm" className="flex-1" onClick={onClose}>关闭</Button>
              <Button variant="pink" size="sm" className="flex-1" onClick={onFavorite}>
                <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
                {isFavorite ? '已收藏' : '收藏'}
              </Button>
              <Button variant="butter" size="sm" className="flex-1" onClick={onReview}>
                <MessageSquare className="h-4 w-4" /> 评价
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 bg-lavender/40 text-purple-700 hover:bg-lavender/60" onClick={onEdit}>
                <Pencil className="h-4 w-4" /> 编辑
              </Button>
              <Button variant="danger" size="sm" className="flex-1" onClick={onDelete}>
                <Trash2 className="h-4 w-4" /> 删除
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Info({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
        {icon} {title}
      </span>
      <span className="text-sm">{children}</span>
    </div>
  );
}
