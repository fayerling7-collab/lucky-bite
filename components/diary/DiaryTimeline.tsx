'use client';

import { motion } from 'framer-motion';
import { DiaryEntry } from './DiaryEntry';
import type { DiaryEntry as DiaryEntryType } from '@/types/diary';
import type { Player } from '@/types/player';
import type { Restaurant } from '@/types/restaurant';

interface DiaryTimelineProps {
  entries: DiaryEntryType[];
  players: Player[];
  restaurants: Restaurant[];
}

export function DiaryTimeline({ entries, players, restaurants }: DiaryTimelineProps) {
  // 按体验时间倒序
  const sorted = [...entries].sort(
    (a, b) =>
      new Date(b.experienceDate).getTime() - new Date(a.experienceDate).getTime(),
  );

  // 空状态
  if (sorted.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border-2 border-dashed border-lavender/50 bg-white/40 p-10 text-center backdrop-blur"
      >
        <div className="mb-3 text-5xl">📖</div>
        <p className="font-display text-lg font-bold text-slate-500">
          还没有美食日记，去抽一次扭蛋开始记录吧～🎲
        </p>
      </motion.div>
    );
  }

  return (
    <div className="relative pl-8">
      {/* 左侧虚线时间轴 */}
      <div className="absolute bottom-2 left-3 top-2 w-0 border-l-2 border-dashed border-lavender/60" />

      <div className="flex flex-col gap-5">
        {sorted.map((entry, i) => {
          const restaurant = restaurants.find((r) => r.id === entry.restaurantId);
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 150, damping: 18 }}
              className="relative"
            >
              {/* 节点圆点 */}
              <div className="absolute -left-[1.4rem] top-7 flex h-4 w-4 items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-coral shadow-soft ring-4 ring-white/80" />
              </div>
              <DiaryEntry entry={entry} players={players} restaurant={restaurant} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
