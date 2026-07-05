'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DynamicBackground } from '@/components/common/DynamicBackground';
import { PageTransition } from '@/components/common/PageTransition';
import { DiaryTimeline } from '@/components/diary/DiaryTimeline';
import { useApp } from '@/lib/appStore';

export default function DiaryPage() {
  const router = useRouter();
  const { diary, players, restaurants } = useApp();

  const isEmpty = diary.length === 0;

  return (
    <div className="relative min-h-screen min-h-[100dvh]">
      <DynamicBackground />
      <PageTransition>
        <div className="relative z-10 mx-auto max-w-4xl px-4 py-6 safe-top safe-bottom">
          {/* 顶部栏 */}
          <div className="mb-6 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-slate-700"
            >
              美食日记 📖
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {isEmpty ? (
              <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-lavender/50 bg-white/40 p-10 text-center backdrop-blur">
                <div className="text-5xl">📖</div>
                <p className="font-display text-lg font-bold text-slate-500">
                  还没有美食日记，去抽一次扭蛋开始记录吧～🎲
                </p>
                <Button variant="pink" onClick={() => router.push('/')}>
                  去扭蛋 ✨
                </Button>
              </div>
            ) : (
              <DiaryTimeline
                entries={diary}
                players={players}
                restaurants={restaurants}
              />
            )}
          </motion.div>
        </div>
      </PageTransition>
    </div>
  );
}
