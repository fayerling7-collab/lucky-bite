'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DynamicBackground } from '@/components/common/DynamicBackground';
import { PageTransition } from '@/components/common/PageTransition';
import { RankingTabs } from '@/components/ranking/RankingTabs';
import { ChampionPodium } from '@/components/ranking/ChampionPodium';
import { RankingList } from '@/components/ranking/RankingList';
import { useApp } from '@/lib/appStore';
import { computeRanking } from '@/lib/ranking';
import type { RankingPeriod } from '@/types';

export default function RankingPage() {
  const router = useRouter();
  const { players, restaurants, reviews, currentPlayer } = useApp();
  const [period, setPeriod] = useState<RankingPeriod>('week');

  const rankingEntries = useMemo(
    () => computeRanking(players, restaurants, reviews, period),
    [players, restaurants, reviews, period],
  );

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
              排行榜 🏆
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-5"
          >
            {/* 周期切换 */}
            <div className="flex justify-center">
              <RankingTabs period={period} onChange={setPeriod} />
            </div>

            {/* 前三名领奖台 */}
            <ChampionPodium entries={rankingEntries} players={players} />

            {/* 完整榜单 */}
            <div>
              <p className="mb-2 px-1 text-xs font-bold text-slate-500">
                完整榜单
              </p>
              <RankingList
                entries={rankingEntries}
                players={players}
                currentUserId={currentPlayer?.id}
              />
            </div>
          </motion.div>
        </div>
      </PageTransition>
    </div>
  );
}
