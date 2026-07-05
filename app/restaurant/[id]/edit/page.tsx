'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DynamicBackground } from '@/components/common/DynamicBackground';
import { PageTransition } from '@/components/common/PageTransition';
import { RestaurantForm } from '@/components/restaurant/RestaurantForm';
import { useApp } from '@/lib/appStore';

export default function EditRestaurantPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { restaurants, players, updateRestaurant } = useApp();

  const restaurant = restaurants.find((r) => r.id === params.id);

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
              <h1 className="text-xl font-bold text-slate-700">编辑餐厅 ✏️</h1>
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

  const handleSubmit = async (data: any) => {
    await updateRestaurant(params.id, data);
    router.back();
  };

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
              编辑餐厅 ✏️
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <RestaurantForm
              initial={restaurant}
              recommenders={players}
              onSubmit={handleSubmit}
              onCancel={() => router.back()}
            />
          </motion.div>
        </div>
      </PageTransition>
    </div>
  );
}
