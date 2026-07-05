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

const DECORATIONS = [
  '🦌', '🐴', '✨', '🌸', '🦋', '☁️', '💫', '⭐',
  '🌸', '✨', '🦋', '☁️', '💫', '🦌', '🐴', '🌸'
];

/** 首页动态背景：梦幻碎花元素缓慢漂浮 */
export function DynamicBackground() {
  const items = useMemo<FloatingItem[]>(() => {
    // 使用网格均匀分布算法：将屏幕分成 4x4 网格，每个格子放置一个元素
    const gridCols = 4;
    const gridRows = 4;
    const cellWidth = 100 / gridCols;
    const cellHeight = 100 / gridRows;
    const allItems: FloatingItem[] = [];

    let id = 0;
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        // 在每个网格内随机偏移（20%-80% 的位置，避免边缘）
        const baseLeft = col * cellWidth;
        const baseTop = row * cellHeight;
        const offsetLeft = cellWidth * (0.2 + Math.random() * 0.6);
        const offsetTop = cellHeight * (0.2 + Math.random() * 0.6);

        allItems.push({
          id: id,
          left: `${baseLeft + offsetLeft}%`,
          top: `${baseTop + offsetTop}%`,
          size: 20 + Math.random() * 24,
          duration: 20 + Math.random() * 25,
          delay: Math.random() * 10,
          emoji: DECORATIONS[id % DECORATIONS.length],
          opacity: 0.3 + Math.random() * 0.2, // 降低透明度到 0.3-0.5
        });
        id++;
      }
    }

    return allItems;
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {/* 大色块光晕 - 更饱和的颜色 */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blush/50 blur-3xl" />
      <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-sky-soft/50 blur-3xl" />
      <div className="absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-lavender/40 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-butter/30 blur-3xl" />

      {/* 漂浮装饰 - 添加模糊效果 */}
      {items.map((item) => (
        <motion.div
          key={item.id}
          className="absolute select-none"
          style={{
            left: item.left,
            top: item.top,
            fontSize: item.size,
            opacity: item.opacity,
            filter: 'blur(0.5px)', // 轻微模糊使背景更柔和
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 10, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.05, 1],
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
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/40 to-transparent" />
    </div>
  );
}
