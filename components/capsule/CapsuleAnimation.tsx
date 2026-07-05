'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { cuisineEmoji } from '@/components/restaurant/RestaurantCard';
import type { Restaurant } from '@/types/restaurant';

interface CapsuleAnimationProps {
  open: boolean;
  onComplete: (restaurant: Restaurant) => void;
  onClose: () => void;
  restaurants: Restaurant[];
}

type Stage = 'glow' | 'shake' | 'spin' | 'drop' | 'open' | 'celebrate';

const STAGE_TEXT: Record<Stage, string> = {
  glow: '✨ 幸运正在路上…',
  shake: '摇动中…',
  spin: '扭蛋加速中…',
  drop: '扭蛋掉落！',
  open: '🎉 恭喜抽中！',
  celebrate: '🎉 恭喜抽中！',
};

// 各阶段起始时间（ms）：发光→摇动→旋转→掉落→打开→庆祝，总时长约 3000ms
const STAGE_STARTS: { stage: Stage; at: number }[] = [
  { stage: 'glow', at: 0 },
  { stage: 'shake', at: 400 },
  { stage: 'spin', at: 1000 },
  { stage: 'drop', at: 1500 },
  { stage: 'open', at: 2000 },
  { stage: 'celebrate', at: 2500 },
];
const TOTAL = 3000;

/** 全屏扭蛋抽取动画（约 3 秒仪式感流程） */
export function CapsuleAnimation({ open, onComplete, onClose, restaurants }: CapsuleAnimationProps) {
  const [stage, setStage] = useState<Stage>('glow');
  // 用 ref 保存回调，避免父组件重渲染导致动画重置
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // 随机选中一家餐厅（open 切换时重新抽取并缓存，避免重渲染变化）
  const selected = useMemo<Restaurant | null>(() => {
    if (!open || restaurants.length === 0) return null;
    return restaurants[Math.floor(Math.random() * restaurants.length)];
  }, [open, restaurants]);

  useEffect(() => {
    if (!open || !selected) return;
    setStage('glow');
    const timers = STAGE_STARTS.map(({ stage: st, at }) =>
      setTimeout(() => setStage(st), at),
    );
    // 庆祝阶段触发彩带爆发
    timers.push(
      setTimeout(() => {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#FFD6E0', '#FFE9A8', '#BDEBD0', '#A8D8F0', '#D9C8F0'],
        });
      }, 2500),
    );
    // 完成后回调
    timers.push(setTimeout(() => onCompleteRef.current(selected), TOTAL));
    return () => timers.forEach(clearTimeout);
  }, [open, selected]);

  const isActive = (stages: Stage[]) => stages.includes(stage);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="capsule-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.6, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 160, damping: 14 }}
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center"
          >
            {/* 阶段提示文字 */}
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass mb-6 rounded-full px-6 py-2 text-lg font-bold text-white shadow-soft"
            >
              {STAGE_TEXT[stage]}
            </motion.div>

            {/* 扭蛋机舞台 */}
            <div className="relative flex h-80 w-72 items-center justify-center">
              {/* 发光光晕 */}
              <motion.div
                className="absolute h-56 w-56 rounded-full bg-white blur-3xl"
                animate={{
                  scale: isActive(['glow', 'shake']) ? [1, 1.4, 1] : 1,
                  opacity: isActive(['glow', 'shake']) ? [0.4, 0.85, 0.4] : 0.3,
                }}
                transition={{ duration: 0.8, repeat: isActive(['glow', 'shake']) ? Infinity : 0 }}
              />

              {/* 机身（摇动 / 旋转阶段晃动） */}
              <motion.div
                animate={{
                  rotate: stage === 'shake' ? [-3, 3, -3] : stage === 'spin' ? [0, -4, 4, 0] : 0,
                }}
                transition={{ duration: 0.35, repeat: isActive(['shake', 'spin']) ? Infinity : 0 }}
                className="relative flex flex-col items-center"
              >
                {/* 玻璃罩 + 内部扭蛋球 */}
                <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-white/80 bg-gradient-to-b from-sky-soft/40 to-white/20 backdrop-blur-md">
                  <motion.div
                    animate={{
                      rotate: stage === 'spin' ? 360 : 0,
                      scale: stage === 'glow' ? [1, 1.12, 1] : 1,
                    }}
                    transition={{
                      rotate: { duration: 0.5, repeat: stage === 'spin' ? Infinity : 0, ease: 'linear' },
                      scale: { duration: 0.8, repeat: stage === 'glow' ? Infinity : 0 },
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {/* 扭蛋球（上半 blush 下半 butter） */}
                    <div className="relative h-12 w-12 rounded-full shadow-soft-lg">
                      <div className="absolute inset-0 top-0 h-1/2 rounded-t-full bg-blush" />
                      <div className="absolute inset-0 bottom-0 h-1/2 rounded-b-full bg-butter" />
                      <div className="absolute left-1/2 top-1/2 h-px w-full -translate-y-1/2 bg-white/80" />
                    </div>
                  </motion.div>
                </div>

                {/* 机身底座 */}
                <div className="h-16 w-48 rounded-3xl border-4 border-white/80 bg-gradient-to-b from-cream to-butter/60" />

                {/* 掉落 / 打开阶段：扭蛋沿轨道下落并裂开 */}
                <AnimatePresence>
                  {isActive(['drop', 'open', 'celebrate']) && (
                    <motion.div
                      initial={{ y: -110, opacity: 0 }}
                      animate={{ y: 50, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 120, damping: 10 }}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2"
                    >
                      {isActive(['open', 'celebrate']) ? (
                        // 扭蛋裂开 + 餐厅 emoji 弹出
                        <motion.div
                          initial={{ scale: 0.4, rotate: -30 }}
                          animate={{ scale: [0.4, 1.4, 1], rotate: 0 }}
                          transition={{ duration: 0.5 }}
                          className="flex flex-col items-center"
                        >
                          <div className="text-6xl drop-shadow-lg">
                            {selected ? cuisineEmoji(selected.cuisine) : '🍽️'}
                          </div>
                          {selected && (
                            <div className="mt-2 max-w-[14rem] rounded-full bg-white/90 px-4 py-1 text-center text-sm font-bold text-slate-700 shadow-soft">
                              {selected.name}
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        // 下落中的扭蛋
                        <div className="relative h-10 w-10 rounded-full shadow-soft-lg">
                          <div className="absolute inset-0 top-0 h-1/2 rounded-t-full bg-blush" />
                          <div className="absolute inset-0 bottom-0 h-1/2 rounded-b-full bg-butter" />
                          <div className="absolute left-1/2 top-1/2 h-px w-full -translate-y-1/2 bg-white/80" />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
