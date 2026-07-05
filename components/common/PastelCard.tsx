'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type PastelVariant = 'sky' | 'pink' | 'mint' | 'butter' | 'lavender' | 'coral';

const variantStyles: Record<PastelVariant, string> = {
  sky: 'bg-gradient-to-br from-sky-soft/70 to-sky-deep/40 border-white/70',
  pink: 'bg-gradient-to-br from-blush/70 to-coral/40 border-white/70',
  mint: 'bg-gradient-to-br from-mint/70 to-mint/40 border-white/70',
  butter: 'bg-gradient-to-br from-butter/70 to-butter/40 border-white/70',
  lavender: 'bg-gradient-to-br from-lavender/70 to-lavender/40 border-white/70',
  coral: 'bg-gradient-to-br from-coral/70 to-blush/40 border-white/70',
};

interface PastelCardProps {
  children: ReactNode;
  variant?: PastelVariant;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

/** 通用马卡龙渐变卡片 */
export function PastelCard({
  children,
  variant = 'sky',
  className,
  hover = false,
  onClick,
}: PastelCardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { scale: 1.03, y: -4 } : undefined}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      className={cn(
        'rounded-3xl border-2 p-5 shadow-soft backdrop-blur-md',
        variantStyles[variant],
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
