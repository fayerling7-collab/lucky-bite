'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ImageIcon, Search, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DynamicBackground } from '@/components/common/DynamicBackground';
import { PageTransition } from '@/components/common/PageTransition';
import { RestaurantForm } from '@/components/restaurant/RestaurantForm';
import { RestaurantSearch } from '@/components/restaurant/RestaurantSearch';
import { ImageUploader } from '@/components/restaurant/ImageUploader';
import type { SearchResultItem } from '@/components/restaurant/RestaurantSearch';
import { useApp } from '@/lib/appStore';
import type { NewRestaurantInput } from '@/types';

type EntryMode = 'choice' | 'search' | 'image' | 'form';

export default function NewRestaurantPage() {
  const router = useRouter();
  const { players, currentPlayer, addRestaurant } = useApp();
  const [mode, setMode] = useState<EntryMode>('choice');
  const [initialData, setInitialData] = useState<Partial<NewRestaurantInput> | null>(null);

  const handleSelectBranch = (branch: SearchResultItem) => {
    setInitialData({
      name: branch.name,
      branchName: branch.branchName || '',
      cuisine: branch.cuisine,
      district: branch.district,
      address: branch.address,
      businessHours: branch.businessHours,
      supportsLunch: branch.supportsLunch,
      supportsDinner: branch.supportsDinner,
      avgPrice: branch.avgPrice,
      recommenderId: currentPlayer?.id,
      inPool: true,
    });
    setMode('form');
  };

  const handleManualCreate = (_query: string) => {
    setInitialData(null);
    setMode('form');
  };

  const handleImageRecognize = (result: {
    name: string;
    branchName: string;
    cuisine: string;
    district: string;
    address: string;
    businessHours: string;
    supportsLunch: boolean;
    supportsDinner: boolean;
    avgPrice: number;
  }) => {
    setInitialData({
      name: result.name,
      branchName: result.branchName,
      cuisine: result.cuisine,
      district: result.district,
      address: result.address,
      businessHours: result.businessHours,
      supportsLunch: result.supportsLunch,
      supportsDinner: result.supportsDinner,
      avgPrice: result.avgPrice,
      recommenderId: currentPlayer?.id,
      inPool: true,
    });
    setMode('form');
  };

  const handleSubmit = async (data: NewRestaurantInput) => {
    await addRestaurant(data);
    router.push('/');
  };

  const handleCancel = () => {
    if (mode === 'form') {
      setMode('choice');
      setInitialData(null);
    } else {
      setMode('choice');
    }
  };

  const handleBackToChoice = () => {
    setMode('choice');
    setInitialData(null);
  };

  return (
    <div className="relative min-h-screen min-h-[100dvh]">
      <DynamicBackground />
      <PageTransition>
        <div className="relative z-10 mx-auto max-w-4xl px-4 py-6 safe-top safe-bottom">
          {/* 顶部栏 */}
          <div className="mb-6 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={mode === 'choice' ? () => router.back() : handleBackToChoice}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-slate-700"
            >
              新增餐厅 🍽
            </motion.h1>
          </div>

          {/* 选择入口模式 */}
          <AnimatePresence mode="wait">
            {mode === 'choice' && (
              <motion.div
                key="choice"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col gap-4"
              >
                <div className="rounded-3xl bg-white/60 p-5 backdrop-blur shadow-soft text-center">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMode('image')}
                    className="flex w-full flex-col items-center gap-3 rounded-3xl bg-gradient-to-r from-lavender to-blush p-6 text-left transition hover:brightness-105"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/50">
                      <ImageIcon className="h-8 w-8 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-700">📷 图片识别添加</p>
                      <p className="mt-1 text-sm text-slate-500">上传截图自动识别餐厅信息</p>
                    </div>
                  </motion.button>
                </div>

                <div className="rounded-3xl bg-white/60 p-5 backdrop-blur shadow-soft">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMode('search')}
                    className="flex w-full items-center gap-4 rounded-3xl bg-gradient-to-r from-sky-soft to-mint p-5 text-left transition hover:brightness-105"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/50">
                      <Search className="h-7 w-7 text-sky-deep" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-700">🔍 搜索添加</p>
                      <p className="mt-1 text-sm text-slate-500">搜索上海餐厅并选择门店</p>
                    </div>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleManualCreate('')}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/50 p-4 font-medium text-slate-600 transition hover:bg-white/80"
                  >
                    <Plus className="h-5 w-5" />
                    手动添加
                  </motion.button>
                </div>

                <div className="rounded-2xl bg-butter/30 p-3 text-center">
                  <p className="text-xs text-amber-700">📍 当前默认城市：上海市</p>
                </div>
              </motion.div>
            )}

            {/* 搜索模式 */}
            {mode === 'search' && (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-3xl bg-white/60 p-5 backdrop-blur shadow-soft"
              >
                <p className="mb-3 text-sm font-bold text-slate-600">🔍 搜索上海餐厅</p>
                <RestaurantSearch
                  onSelectBranch={handleSelectBranch}
                  onManualCreate={handleManualCreate}
                />
              </motion.div>
            )}

            {/* 图片识别模式 */}
            {mode === 'image' && (
              <motion.div
                key="image"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ImageUploader
                  onRecognize={handleImageRecognize}
                  onCancel={handleBackToChoice}
                />
              </motion.div>
            )}

            {/* 表单模式 */}
            {mode === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-3xl bg-white/70 p-6 backdrop-blur shadow-soft"
              >
                <RestaurantForm
                  initial={initialData as any}
                  recommenders={players}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  defaultRecommenderId={currentPlayer?.id}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    </div>
  );
}
