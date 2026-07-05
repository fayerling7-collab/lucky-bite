'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Utensils, JapaneseYen } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/common/PageTransition';
import { DynamicBackground } from '@/components/common/DynamicBackground';
import { ReviewForm } from '@/components/review/ReviewForm';
import { KeepOrRemoveDialog } from '@/components/review/KeepOrRemoveDialog';
import { useApp } from '@/lib/appStore';
import { computeFinalRating } from '@/lib/scoring';
import type { NewReviewInput, Review } from '@/types';
import { cuisineEmoji } from '@/components/restaurant/RestaurantCard';

function ReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('restaurantId') || '';
  const { restaurants, addReview, finalizeExperience, removeRestaurantFromPool } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submittedReview, setSubmittedReview] = useState<Review | null>(null);
  const [finalRating, setFinalRating] = useState(0);

  const restaurant = restaurants.find((r) => r.id === restaurantId);

  if (!restaurant) {
    return (
      <div className="relative min-h-screen min-h-[100dvh]">
        <DynamicBackground />
        <PageTransition>
          <div className="relative z-10 mx-auto max-w-4xl px-4 py-6 safe-top safe-bottom">
            <div className="mb-6 flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold text-slate-700">评价餐厅 ⭐</h1>
            </div>
            <div className="rounded-3xl bg-white/60 p-10 text-center backdrop-blur shadow-soft">
              <p className="text-4xl mb-3">😕</p>
              <p className="font-bold text-slate-600">餐厅不存在</p>
              <p className="text-sm text-slate-400 mt-1">这家餐厅可能已被删除</p>
            </div>
          </div>
        </PageTransition>
      </div>
    );
  }

  const handleSubmit = async (data: NewReviewInput) => {
    const review = await addReview(data);
    const rating = computeFinalRating([review]);
    setSubmittedReview(review);
    setFinalRating(rating);
    setDialogOpen(true);
  };

  const handleKeep = async () => {
    if (submittedReview) {
      await finalizeExperience(restaurantId, [submittedReview]);
      router.push('/diary');
    }
  };

  const handleRemove = async () => {
    if (submittedReview) {
      await removeRestaurantFromPool(restaurantId);
      await finalizeExperience(restaurantId, [submittedReview]);
      router.push('/');
    }
  };

  const emoji = cuisineEmoji(restaurant.cuisine);

  return (
    <div className="relative min-h-screen min-h-[100dvh]">
      <DynamicBackground />
      <PageTransition>
        <div className="relative z-10 mx-auto max-w-4xl px-4 py-6 safe-top safe-bottom">
          <div className="mb-6 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-slate-700"
            >
              评价餐厅 ⭐
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-5 flex items-center gap-3 rounded-3xl bg-gradient-to-r from-sky-soft/60 to-lavender/50 p-4 shadow-soft backdrop-blur">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-3xl shadow-soft">
                {emoji}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-bold text-slate-700">
                  {restaurant.name}
                  {restaurant.branchName && (
                    <span className="ml-1 text-sm font-normal text-slate-500">
                      ({restaurant.branchName})
                    </span>
                  )}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Utensils className="h-3 w-3" />
                    {restaurant.cuisine}
                  </span>
                  <span className="flex items-center gap-1">
                    📍 {restaurant.district}
                    {restaurant.businessArea && ` · ${restaurant.businessArea}`}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-coral">
                    <JapaneseYen className="h-3 w-3" />
                    {restaurant.avgPrice} 元/人
                  </span>
                </div>
              </div>
            </div>

            <ReviewForm
              restaurant={restaurant}
              onSubmit={handleSubmit}
              onCancel={() => router.back()}
            />
          </motion.div>
        </div>
      </PageTransition>

      <KeepOrRemoveDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        restaurant={restaurant}
        finalRating={finalRating}
        onKeep={handleKeep}
        onRemove={handleRemove}
      />
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-slate-400">加载中...</p></div>}>
      <ReviewContent />
    </Suspense>
  );
}
