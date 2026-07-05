'use client';

import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CapsuleMachineProps {
  onSpin: () => void;
  poolCount: number;
  mode: 'lucky' | 'smart';
}

// 扭蛋球上下分割配色（pastel 组合）
const CAPSULE_COLORS: { top: string; bottom: string }[] = [
  { top: 'bg-blush', bottom: 'bg-butter' },
  { top: 'bg-sky-soft', bottom: 'bg-mint' },
  { top: 'bg-lavender', bottom: 'bg-blush' },
  { top: 'bg-mint', bottom: 'bg-sky-soft' },
  { top: 'bg-butter', bottom: 'bg-coral' },
];

// 机器周围 sparkle 装饰位置
const SPARKLES: { pos: CSSProperties; delay: string }[] = [
  { pos: { top: '6%', left: '4%' }, delay: '0s' },
  { pos: { top: '18%', right: '6%' }, delay: '0.7s' },
  { pos: { top: '48%', left: '0%' }, delay: '1.2s' },
  { pos: { bottom: '26%', right: '2%' }, delay: '0.4s' },
  { pos: { top: '64%', left: '8%' }, delay: '0.9s' },
];

/** 首页中央的大型日式扭蛋机展示组件（待机状态） */
export function CapsuleMachine({ onSpin, poolCount, mode }: CapsuleMachineProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 140, damping: 12 }}
      className="relative flex flex-col items-center"
    >
      {/* sparkle 装饰 */}
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          className="animate-sparkle pointer-events-none absolute text-2xl"
          style={{ ...s.pos, animationDelay: s.delay }}
        >
          ✨
        </span>
      ))}

      {/* 机器上方：参与数量提示 */}
      <div className="glass mb-4 rounded-full px-5 py-2 text-sm font-bold text-sky-deep shadow-soft">
        本次共有 <span className="text-coral">{poolCount}</span> 家餐厅参与扭蛋
      </div>

      {/* 扭蛋机本体（持续呼吸动画） */}
      <div className="animate-breathe relative flex flex-col items-center">
        {/* 顶部圆弧玻璃罩（球形） */}
        <div className="relative h-48 w-48 overflow-hidden rounded-full border-4 border-white/80 bg-gradient-to-b from-sky-soft/40 to-white/20 shadow-soft-lg backdrop-blur-md">
          {/* 玻璃高光 */}
          <div className="absolute left-6 top-5 h-10 w-16 rounded-full bg-white/40 blur-sm" />
          {/* 内部漂浮的彩色扭蛋球（错位漂浮） */}
          {CAPSULE_COLORS.map((c, i) => (
            <div
              key={i}
              className="animate-float absolute"
              style={{
                left: `${18 + (i % 3) * 24}%`,
                top: `${28 + Math.floor(i / 3) * 30}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${5 + i * 0.4}s`,
              }}
            >
              <div className="relative h-8 w-8 rounded-full shadow-soft">
                <div className={cn('absolute inset-x-0 top-0 h-1/2 rounded-t-full', c.top)} />
                <div className={cn('absolute inset-x-0 bottom-0 h-1/2 rounded-b-full', c.bottom)} />
                <div className="absolute left-1/2 top-1/2 h-px w-full -translate-y-1/2 bg-white/70" />
                <div className="absolute left-1.5 top-1 h-1.5 w-1.5 rounded-full bg-white/80" />
              </div>
            </div>
          ))}
        </div>

        {/* 中间机身（圆角矩形，奶油色渐变） */}
        <div className="relative -mt-2 flex h-28 w-56 flex-col items-center justify-center gap-2 rounded-3xl border-4 border-white/80 bg-gradient-to-b from-cream to-butter/60 shadow-soft-lg">
          {/* 模式标识 */}
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-sky-deep shadow-sm">
            {mode === 'lucky' ? '🍀 幸运模式' : '🎯 精准模式'}
          </span>
          <div className="flex items-center gap-3">
            {/* 投币口 */}
            <div className="h-1.5 w-7 rounded-full bg-slate-400/50" />
            {/* 装饰按钮 */}
            <div className="h-5 w-5 rounded-full bg-gradient-to-b from-coral to-blush shadow-pop" />
          </div>
        </div>

        {/* 底部出口 */}
        <div className="h-3 w-20 rounded-b-2xl bg-slate-700/40" />
      </div>

      {/* 主 CTA：开始扭蛋（呼吸光晕 + whileTap 缩放） */}
      <Button
        size="lg"
        variant="primary"
        onClick={onSpin}
        className="animate-breathe mt-8"
      >
        <Sparkles className="h-5 w-5" />
        🎲 开始今天的幸运扭蛋
      </Button>
    </motion.div>
  );
}
