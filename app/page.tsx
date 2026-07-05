'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Trophy, Filter, Menu } from 'lucide-react';
import { DynamicBackground } from '@/components/common/DynamicBackground';
import { RestaurantCardColumn } from '@/components/restaurant/RestaurantCardColumn';
import { RestaurantDetailPanel } from '@/components/restaurant/RestaurantDetailPanel';
import { CapsuleMachine } from '@/components/capsule/CapsuleMachine';
import { CapsuleAnimation } from '@/components/capsule/CapsuleAnimation';
import { CapsuleResult } from '@/components/capsule/CapsuleResult';
import { MoodFilterPanel } from '@/components/filter/MoodFilterPanel';
import { FloatingButton } from '@/components/common/FloatingButton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useApp } from '@/lib/appStore';
import type { Restaurant, RestaurantFilter } from '@/types';
import { getTodayBestRecommender } from '@/lib/ranking';
import { cn } from '@/lib/utils';
import { cuisineEmoji } from '@/components/restaurant/RestaurantCard';

/** 首页游戏大厅 */
export default function HomePage() {
  const router = useRouter();
  const {
    ready,
    restaurants,
    players,
    currentPlayer,
    toggleFavorite,
    removeRestaurantFromPool,
    deleteRestaurant,
  } = useApp();

  // 扭蛋池餐厅（仅 inPool=true）
  const poolRestaurants = useMemo(
    () => restaurants.filter((r) => r.inPool),
    [restaurants],
  );

  // 筛选状态
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState<RestaurantFilter>({});

  // 符合筛选的餐厅
  const filteredRestaurants = useMemo(() => {
    return poolRestaurants.filter((r) => {
      if (filter.cuisine?.length && !filter.cuisine.includes(r.cuisine)) return false;
      if (filter.district?.length && !filter.district.includes(r.district)) return false;
      if (filter.maxBudget && r.avgPrice > filter.maxBudget) return false;
      if (filter.minBudget && r.avgPrice < filter.minBudget) return false;
      if (filter.lunch && !r.supportsLunch) return false;
      if (filter.dinner && !r.supportsDinner) return false;
      if (filter.tags?.length && !filter.tags.some((t) => r.tags.includes(t))) return false;
      return true;
    });
  }, [poolRestaurants, filter]);

  const hasFilter = Object.values(filter).some((v) =>
    Array.isArray(v) ? v.length > 0 : typeof v === 'boolean' ? v : v !== undefined,
  );

  const mode: 'lucky' | 'smart' = hasFilter ? 'smart' : 'lucky';

  // 今日最佳推荐人
  const todayBest = useMemo(
    () => getTodayBestRecommender(players, restaurants),
    [players, restaurants],
  );

  // 扭蛋动画状态
  const [capsuleOpen, setCapsuleOpen] = useState(false);
  const [resultRestaurant, setResultRestaurant] = useState<Restaurant | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSpin = () => {
    if (filteredRestaurants.length === 0) return;
    setCapsuleOpen(true);
    setShowResult(false);
  };

  const handleCapsuleComplete = (restaurant: Restaurant) => {
    setResultRestaurant(restaurant);
    setCapsuleOpen(false);
    setShowResult(true);
  };

  const handleCapsuleClose = () => {
    setCapsuleOpen(false);
  };

  const handleAgain = () => {
    setShowResult(false);
    setTimeout(() => handleSpin(), 300);
  };

  // 餐厅详情浮层
  const [detailRestaurant, setDetailRestaurant] = useState<Restaurant | null>(null);

  const handleSelectRestaurant = (r: Restaurant) => {
    setDetailRestaurant(r);
  };

  const handleDetailFromResult = () => {
    if (resultRestaurant) {
      setDetailRestaurant(resultRestaurant);
      setShowResult(false);
    }
  };

  // 删除确认
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setRestaurantToDelete(id);
    setDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (restaurantToDelete) {
      await deleteRestaurant(restaurantToDelete);
      setDetailRestaurant(null);
    }
  };

  // 移出扭蛋池
  const handleRemoveFromPool = async (id: string) => {
    await removeRestaurantFromPool(id);
    setDetailRestaurant(null);
    setShowResult(false);
  };

  const recommenderForDetail = detailRestaurant
    ? players.find((p) => p.id === detailRestaurant.recommenderId)
    : undefined;

  const recommenderForResult = resultRestaurant
    ? players.find((p) => p.id === resultRestaurant.recommenderId)
    : undefined;

  const isFavorite = detailRestaurant && currentPlayer
    ? currentPlayer.favoriteRestaurantIds.includes(detailRestaurant.id)
    : false;

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-6xl"
        >
          🎲
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen min-h-[100dvh] overflow-x-hidden pb-20">
      <DynamicBackground />

      {/* 顶部栏 */}
      <header className="relative z-30 flex items-center justify-between px-4 pt-4 sm:px-6 md:px-8 safe-top">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-3xl"
          >
            🎲
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-bold bg-gradient-to-r from-sky-deep to-purple-500 bg-clip-text text-transparent"
          >
            Lucky Bite
          </motion.h1>
        </div>

        {/* 本月排行 */}
        {todayBest && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: [1, 1.02, 1],
            }}
            transition={{
              delay: 0.2,
              scale: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
            className="relative flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-butter/40 via-white/60 to-blush/40 px-4 py-2.5 backdrop-blur-md shadow-soft border border-white/50 overflow-hidden"
          >
            {/* 微光动画背景 */}
            <motion.div
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2"
            />
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-lg relative z-10"
            >
              👑
            </motion.span>
            <span className="text-xs text-slate-500 relative z-10">本月</span>
            <span className="text-sm font-bold text-slate-700 relative z-10">{todayBest.nickname}</span>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center gap-1 relative z-10"
            >
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-bold text-amber-500">{todayBest.points}分</span>
            </motion.div>
          </motion.div>
        )}

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push('/ranking')}
            className="rounded-full p-2 text-slate-500 hover:bg-white/60 transition"
            aria-label="排行榜"
          >
            <Trophy className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push('/diary')}
            className="rounded-full p-2 text-slate-500 hover:bg-white/60 transition"
            aria-label="美食日记"
          >
            <Sparkles className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push('/party')}
            className="rounded-full p-2 text-slate-500 hover:bg-white/60 transition"
            aria-label="美食小队"
          >
            <Menu className="h-5 w-5" />
          </motion.button>
        </div>
      </header>

      {/* 主区域：三列布局（桌面）/ 单列（手机） */}
      <main className="relative z-10 mx-auto max-w-7xl px-2 pt-4 md:px-4">
        {/* 手机端顶部欢迎 */}
        <div className="mb-4 text-center lg:hidden">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-bold text-slate-700"
          >
            今天吃什么？🎲
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-slate-500"
          >
            共 {poolRestaurants.length} 家餐厅在扭蛋池中等你
          </motion.p>
        </div>

        {/* 三列布局 */}
        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-start">
          {/* 左侧餐厅卡列 - 桌面端显示 */}
          <div className="hidden lg:block relative h-[calc(100vh-160px)] overflow-hidden">
            <div className="absolute inset-0 pointer-events-none top-0 h-16 bg-gradient-to-b from-cream/80 to-transparent z-10" />
            <div className="absolute inset-0 pointer-events-none bottom-0 h-16 bg-gradient-to-t from-cream/80 to-transparent z-10" />
            <RestaurantCardColumn
              restaurants={poolRestaurants.slice(0, Math.ceil(poolRestaurants.length / 2))}
              players={players}
              direction="up"
              onSelect={handleSelectRestaurant}
            />
          </div>

          {/* 中央扭蛋机 */}
          <div className="flex flex-col items-center justify-center py-4 lg:py-0">
            <div className="w-full max-w-md">
              <CapsuleMachine
                onSpin={handleSpin}
                poolCount={filteredRestaurants.length}
                mode={mode}
              />

              {/* 筛选按钮 */}
              <div className="mt-4 flex justify-center">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterOpen(true)}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-5 py-2.5 font-bold text-sm transition',
                    hasFilter
                      ? 'bg-gradient-to-r from-butter to-blush text-amber-800 shadow-pop'
                      : 'bg-white/60 text-slate-600 hover:bg-white/80 backdrop-blur',
                  )}
                >
                  <Filter className="h-4 w-4" />
                  <span>今天想吃什么？</span>
                  {hasFilter && (
                    <span className="ml-1 rounded-full bg-white/50 px-2 py-0.5 text-xs">
                      已筛选
                    </span>
                  )}
                </motion.button>
              </div>

              {/* 模式标识 */}
              <div className="mt-3 flex justify-center">
                <motion.div
                  key={mode}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold',
                    mode === 'lucky'
                      ? 'bg-mint/60 text-emerald-700'
                      : 'bg-butter/70 text-amber-700',
                  )}
                >
                  {mode === 'lucky' ? '🍀 幸运模式' : '🎯 精准模式'}
                </motion.div>
              </div>
            </div>

            {/* 手机端餐厅卡横向滚动 */}
            <div className="mt-6 w-full lg:hidden">
              <div className="mb-2 flex items-center justify-between px-2">
                <span className="text-sm font-bold text-slate-600">🍽 扭蛋池</span>
                <span className="text-xs text-slate-400">{poolRestaurants.length} 家</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar px-2">
                {poolRestaurants.slice(0, 8).map((r, i) => {
                  const cardEmoji = cuisineEmoji(r.cuisine);
                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="flex-shrink-0 w-36"
                    >
                      <div
                        onClick={() => handleSelectRestaurant(r)}
                        className="cursor-pointer"
                      >
                        <div
                          className={cn(
                            'h-24 rounded-2xl bg-gradient-to-br flex items-center justify-center text-4xl border-2',
                            i % 6 === 0 ? 'from-sky-soft/70 to-sky-deep/40 border-sky-soft/50'
                              : i % 6 === 1 ? 'from-blush/70 to-coral/40 border-blush/50'
                              : i % 6 === 2 ? 'from-mint/70 to-mint/40 border-mint/50'
                              : i % 6 === 3 ? 'from-butter/70 to-butter/40 border-butter/50'
                              : i % 6 === 4 ? 'from-lavender/70 to-lavender/40 border-lavender/50'
                              : 'from-coral/70 to-blush/40 border-coral/50',
                          )}
                        >
                          {cardEmoji}
                        </div>
                        <div className="mt-1.5 px-1">
                          <div className="text-xs font-bold text-slate-700 truncate">{r.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">{r.cuisine} · ¥{r.avgPrice}</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 右侧餐厅卡列 - 桌面端显示 */}
          <div className="hidden lg:block relative h-[calc(100vh-160px)] overflow-hidden">
            <div className="absolute inset-0 pointer-events-none top-0 h-16 bg-gradient-to-b from-cream/80 to-transparent z-10" />
            <div className="absolute inset-0 pointer-events-none bottom-0 h-16 bg-gradient-to-t from-cream/80 to-transparent z-10" />
            <RestaurantCardColumn
              restaurants={poolRestaurants.slice(Math.ceil(poolRestaurants.length / 2))}
              players={players}
              direction="down"
              onSelect={handleSelectRestaurant}
            />
          </div>
        </div>
      </main>

      {/* 筛选浮层 */}
      <MoodFilterPanel
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filter={filter}
        onFilterChange={setFilter}
        poolCount={filteredRestaurants.length}
        onApply={() => setFilterOpen(false)}
        onReset={() => setFilter({})}
      />

      {/* 扭蛋动画 */}
      <CapsuleAnimation
        open={capsuleOpen}
        restaurants={filteredRestaurants}
        onComplete={handleCapsuleComplete}
        onClose={handleCapsuleClose}
      />

      {/* 扭蛋结果 */}
      <AnimatePresence>
        {showResult && resultRestaurant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <CapsuleResult
              restaurant={resultRestaurant}
              recommender={recommenderForResult}
              onAgain={handleAgain}
              onDetail={handleDetailFromResult}
              onReview={() => router.push(`/review/${resultRestaurant.id}`)}
              onKeep={() => setShowResult(false)}
              onRemove={() => handleRemoveFromPool(resultRestaurant.id)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* 餐厅详情浮层 */}
      <RestaurantDetailPanel
        restaurant={detailRestaurant}
        recommender={recommenderForDetail}
        onClose={() => setDetailRestaurant(null)}
        onEdit={() =>
          detailRestaurant && router.push(`/restaurant/${detailRestaurant.id}/edit`)
        }
        onDelete={() => detailRestaurant && handleDelete(detailRestaurant.id)}
        onFavorite={() =>
          detailRestaurant && toggleFavorite(detailRestaurant.id)
        }
        onReview={() =>
          detailRestaurant && router.push(`/review/${detailRestaurant.id}`)
        }
        isFavorite={isFavorite}
      />

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={deleteConfirm}
        onOpenChange={setDeleteConfirm}
        title="确认删除这家餐厅？"
        description="删除后，该餐厅将永久移出抽奖池，不再参与随机抽取。"
        confirmText="删除"
        cancelText="取消"
        variant="danger"
        icon="🗑"
        onConfirm={confirmDelete}
      />

      {/* 右下角 FAB */}
      <FloatingButton href="/restaurant/new" icon="➕" label="新增餐厅" variant="pink" />
    </div>
  );
}
