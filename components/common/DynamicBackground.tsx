'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface FloatingItem {
  id: number;
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
  emoji: string;
  opacity: number;
}

const DECORATIONS = ['☁️', '⭐', '✨', '🍡', '🍙', '🥟', '🍣', '🍩', '🍪', '🧁', '☁️', '💫'];

/** 首页动态背景：云朵/星星/食物图标/闪光缓慢漂浮 */
export function DynamicBackground() {
  const items = useMemo<FloatingItem[]>(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 18 + Math.random() * 28,
      duration: 18 + Math.random() * 22,
      delay: Math.random() * 8,
      emoji: DECORATIONS[i % DECORATIONS.length],
      opacity: 0.35 + Math.random() * 0.4,
    }));
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {/* 大色块光晕 */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blush/40 blur-3xl" />
      <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-sky-soft/40 blur-3xl" />
      <div className="absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-lavender/30 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-butter/20 blur-3xl" />

      {/* 漂浮装饰 */}
      {items.map((item) => (
        <motion.div
          key={item.id}
          className="absolute select-none"
          style={{
            left: item.left,
            top: item.top,
            fontSize: item.size,
            opacity: item.opacity,
          }}
          animate={{
            y: [0, -24, 0],
            x: [0, 8, 0],
            rotate: [0, 8, -8, 0],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* 顶部柔光 */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/50 to-transparent" />
    </div>
  );
}
