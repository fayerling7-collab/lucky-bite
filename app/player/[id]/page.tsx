'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/common/PageTransition';
import { DynamicBackground } from '@/components/common/DynamicBackground';
import { PlayerProfile } from '@/components/player/PlayerProfile';
import { useApp } from '@/lib/appStore';

// Cloudflare Pages Edge Runtime 配置
export const runtime = 'edge';

export default function PlayerProfilePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { players, restaurants, reviews, diary } = useApp();

  const player = players.find((p) => p.id === params.id);

  if (!player) {
    return (
      <div className="relative min-h-screen min-h-[100dvh]">
        <DynamicBackground />
        <PageTransition>
          <div className="relative z-10 mx-auto max-w-4xl px-4 py-6 safe-top safe-bottom">
            <div className="mb-6 flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold text-slate-700">玩家资料 👤</h1>
            </div>
            <div className="rounded-3xl bg-white/60 p-10 text-center backdrop-blur shadow-soft">
              <p className="text-4xl mb-3">😕</p>
              <p className="font-bold text-slate-600">玩家不存在</p>
              <p className="text-sm text-slate-400 mt-1">这位玩家可能已离开小队</p>
            </div>
          </div>
        </PageTransition>
      </div>
    );
  }

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
              玩家资料 👤
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <PlayerProfile
              player={player}
              restaurants={restaurants}
              reviews={reviews}
              diary={diary}
            />
          </motion.div>
        </div>
      </PageTransition>
    </div>
  );
}
