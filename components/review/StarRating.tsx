'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeMap = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

/** 星级评分：支持只读与交互模式，逐颗点亮带弹出动画（stagger） */
export function StarRating({ value, onChange, size = 'md', label }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const interactive = !!onChange;
  // 交互模式：hover 预览优先；只读模式：直接取 value
  const display = interactive ? hover || value : value;

  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="min-w-[3.5rem] text-sm font-bold text-slate-500">{label}</span>
      )}
      <div
        className="flex gap-1"
        onMouseLeave={() => interactive && setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const lit = star <= display;
          // 只在「实际设定的值」范围内的星星才弹出动效
          const settled = star <= value;
          return (
            <motion.button
              key={star}
              type="button"
              disabled={!interactive}
              onMouseEnter={() => interactive && setHover(star)}
              onClick={() => onChange?.(star)}
              whileTap={interactive ? { scale: 0.8 } : undefined}
              whileHover={interactive ? { scale: 1.15 } : undefined}
              className={cn(interactive ? 'cursor-pointer' : 'cursor-default')}
              aria-label={`${star} 星`}
            >
              {/* key 含 value：值变化时重挂载，触发逐颗 stagger 弹出 */}
              <motion.span
                key={`v${value}-${star}`}
                initial={settled ? { scale: 0.4, rotate: -20, opacity: 0 } : false}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 14,
                  delay: settled ? (star - 1) * 0.05 : 0,
                }}
                className="inline-flex"
              >
                <Star
                  className={cn(
                    sizeMap[size],
                    'transition-colors',
                    lit ? 'text-amber-400' : 'text-slate-300',
                  )}
                  fill={lit ? 'currentColor' : 'none'}
                  strokeWidth={2}
                />
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
