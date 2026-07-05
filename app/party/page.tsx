'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DynamicBackground } from '@/components/common/DynamicBackground';
import { PageTransition } from '@/components/common/PageTransition';
import { PartyManager } from '@/components/player/PartyManager';
import { useApp } from '@/lib/appStore';

export default function PartyPage() {
  const router = useRouter();
  const { currentParty, players, currentPlayer, setCurrentPlayer } = useApp();

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
              美食小队 🎉
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <PartyManager
              party={currentParty}
              players={players}
              currentPlayer={currentPlayer}
              onSetCurrent={setCurrentPlayer}
            />
          </motion.div>
        </div>
      </PageTransition>
    </div>
  );
}
