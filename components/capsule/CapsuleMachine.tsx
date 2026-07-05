'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { CSSProperties } from 'react';
import { Sparkles, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CapsuleMachineProps {
  onSpin: () => void;
  poolCount: number;
  mode: 'lucky' | 'smart';
  result?: { name: string; cuisine: string; avgPrice: number };
  isSpinning?: boolean;
}

// 扭蛋球上下分割配色（马卡龙色系，20个）
const CAPSULE_COLORS: { top: string; bottom: string }[] = [
  { top: 'bg-pink-300', bottom: 'bg-rose-200' },
  { top: 'bg-sky-300', bottom: 'bg-blue-200' },
  { top: 'bg-purple-300', bottom: 'bg-violet-200' },
  { top: 'bg-green-300', bottom: 'bg-emerald-200' },
  { top: 'bg-yellow-300', bottom: 'bg-amber-200' },
  { top: 'bg-orange-300', bottom: 'bg-orange-200' },
  { top: 'bg-red-300', bottom: 'bg-red-200' },
  { top: 'bg-teal-300', bottom: 'bg-cyan-200' },
  { top: 'bg-indigo-300', bottom: 'bg-indigo-200' },
  { top: 'bg-pink-400', bottom: 'bg-pink-200' },
  { top: 'bg-purple-400', bottom: 'bg-purple-200' },
  { top: 'bg-blue-300', bottom: 'bg-blue-100' },
  { top: 'bg-green-400', bottom: 'bg-green-200' },
  { top: 'bg-yellow-400', bottom: 'bg-yellow-200' },
  { top: 'bg-orange-400', bottom: 'bg-orange-100' },
  { top: 'bg-rose-300', bottom: 'bg-rose-100' },
  { top: 'bg-violet-300', bottom: 'bg-violet-100' },
  { top: 'bg-cyan-300', bottom: 'bg-cyan-100' },
  { top: 'bg-emerald-300', bottom: 'bg-emerald-100' },
  { top: 'bg-amber-300', bottom: 'bg-amber-100' },
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
export function CapsuleMachine({ onSpin, poolCount, mode, result, isSpinning }: CapsuleMachineProps) {
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
      <div className={cn('relative flex flex-col items-center', !isSpinning && 'animate-breathe')}>
        {/* 顶部圆弧玻璃罩（球形，增大尺寸） */}
        <div className="relative h-72 w-72 overflow-hidden rounded-full border-4 border-white/80 bg-gradient-to-b from-sky-soft/40 to-white/20 shadow-soft-lg backdrop-blur-md">
          {/* 玻璃高光 */}
          <div className="absolute left-10 top-8 h-14 w-24 rounded-full bg-white/40 blur-sm" />
          {/* 密集排列的彩色扭蛋球（20个，更密集的布局，增大尺寸） */}
          {CAPSULE_COLORS.map((c, i) => {
            const angle = (i / 20) * Math.PI * 2 * 2.5;
            const radius = 12 + (i % 5) * 10;
            const centerX = 50;
            const centerY = 50;
            const left = centerX + Math.cos(angle) * radius - 7;
            const top = centerY + Math.sin(angle) * radius - 7;

            return (
              <motion.div
                key={i}
                className="absolute"
                animate={isSpinning ? { rotate: 360 } : { y: [0, -5, 0] }}
                transition={isSpinning ? { duration: 1 + i * 0.1, repeat: Infinity, ease: 'linear' } : { duration: 5 + i * 0.3, repeat: Infinity, delay: i * 0.3 }}
                style={{
                  left: `${Math.max(3, Math.min(85, left))}%`,
                  top: `${Math.max(3, Math.min(85, top))}%`,
                }}
              >
                <div className="relative h-12 w-12 rounded-full shadow-soft">
                  {/* 上半部分 */}
                  <div className={cn('absolute inset-x-0 top-0 h-1/2 rounded-t-full', c.top)} />
                  {/* 下半部分 */}
                  <div className={cn('absolute inset-x-0 bottom-0 h-1/2 rounded-b-full', c.bottom)} />
                  {/* 中间分割线 */}
                  <div className="absolute left-1/2 top-1/2 h-px w-full -translate-y-1/2 bg-white/70" />
                  {/* 左上角高光点（模拟光泽） */}
                  <div className="absolute left-2.5 top-2 h-2.5 w-2.5 rounded-full bg-white/90 blur-[1px]" />
                  {/* 小光点装饰 */}
                  <div className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-white/60" />
                  {/* 底部折射光晕 */}
                  <div className="absolute bottom-1.5 left-1/2 h-2 w-4 -translate-x-1/2 rounded-full bg-white/30 blur-[2px]" />
                </div>
              </motion.div>
            );
          })}
          {/* 额外的光点装饰 */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute h-1.5 w-1.5 rounded-full bg-white/80 blur-[1px]"
              style={{
                left: `${12 + i * 11}%`,
                top: `${8 + (i % 3) * 28}%`,
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>

        {/* 中间机身（金属质感渐变，移除灯泡纹路） */}
        <div className="relative -mt-3 flex h-32 w-72 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-zinc-300 bg-gradient-to-b from-zinc-400 via-slate-300 to-zinc-500 shadow-[0_8px_32px_rgba(0,0,0,0.15),inset_0_2px_8px_rgba(255,255,255,0.4)]">
          {/* 金属边框光泽效果 */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 via-transparent to-black/10" />
          {/* 模式标识 */}
          <span className="relative z-10 rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-sky-deep shadow-md backdrop-blur-sm">
            {mode === 'lucky' ? '🍀 幸运模式' : '🎯 精准模式'}
          </span>
          <div className="relative z-10 flex items-center gap-6">
            {/* 投币口（金属质感） */}
            <div className="h-2 w-10 rounded-full bg-gradient-to-r from-slate-500 via-slate-400 to-slate-600 shadow-inner" />
            {/* 扭蛋按钮（金属光泽，带按下效果） */}
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="h-10 w-10 cursor-pointer rounded-full bg-gradient-to-b from-coral to-blush shadow-[0_3px_10px_rgba(0,0,0,0.25),inset_0_2px_4px_rgba(255,255,255,0.3)]"
              onClick={onSpin}
            >
              <div className="absolute inset-1 rounded-full bg-gradient-to-t from-white/20 to-transparent" />
            </motion.div>
          </div>
        </div>

        {/* 底部出口（金属质感，简化设计） */}
        <div className="relative">
          <div className="h-5 w-28 rounded-b-2xl bg-gradient-to-b from-slate-600 to-slate-700 shadow-md" />
          {/* 出口装饰条 */}
          <div className="absolute inset-x-2 top-1 h-1 rounded-full bg-white/20" />
        </div>
      </div>

      {/* 抽中结果弹窗：左右打开跳出卡纸动画 */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => {}}
            />
            
            {/* 卡纸容器 */}
            <motion.div
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(0 0 0 0)' }}
              exit={{ clipPath: 'inset(0 100% 0 0)' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative z-20 w-72 overflow-hidden rounded-3xl bg-gradient-to-br from-butter/90 via-white to-blush/90 p-6 shadow-soft-lg backdrop-blur-md"
            >
              {/* 卡纸左边打开动画 */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-amber-100/50 to-transparent"
              />
              {/* 卡纸右边打开动画 */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-pink-100/50 to-transparent"
              />

              {/* 内容 */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                  className="mb-4"
                >
                  <Gift className="h-16 w-16 text-coral" />
                </motion.div>
                
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold text-slate-700"
                >
                  🎉 恭喜抽中！
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-3 text-lg font-bold text-sky-deep"
                >
                  {result.name}
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-2 flex items-center gap-2"
                >
                  <span className="rounded-full bg-sky-soft/30 px-3 py-1 text-sm font-medium text-sky-deep">
                    {result.cuisine}
                  </span>
                  <span className="text-sm font-bold text-coral">
                    ¥{result.avgPrice}
                  </span>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-6 flex gap-3"
                >
                  <Button variant="primary" className="rounded-full">
                    查看详情
                  </Button>
                  <Button variant="outline" className="rounded-full" onClick={() => {}}>
                    继续扭蛋
                  </Button>
                </motion.div>
              </div>

              {/* 闪光装饰 */}
              {[...Array(6)].map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 1 + i * 0.3 }}
                  className="absolute text-xl"
                  style={{
                    left: `${10 + i * 15}%`,
                    top: `${20 + (i % 2) * 60}%`,
                  }}
                >
                  ✨
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主 CTA：开始扭蛋（呼吸光晕 + whileTap 缩放） */}
      <Button
        size="lg"
        variant="primary"
        onClick={onSpin}
        disabled={isSpinning}
        className={cn('mt-8', !isSpinning && 'animate-breathe')}
      >
        <Sparkles className="h-5 w-5" />
        {isSpinning ? '🎲 扭蛋中...' : '🎲 开始今天的幸运扭蛋'}
      </Button>
    </motion.div>
  );
}
