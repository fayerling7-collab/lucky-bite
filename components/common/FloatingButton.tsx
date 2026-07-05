'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface FloatingButtonProps {
  href: string;
  icon: string;
  label?: string;
  variant?: 'primary' | 'pink' | 'mint';
}

/** 右下角漂浮按钮（FAB） */
export function FloatingButton({
  href,
  icon,
  label,
  variant = 'primary',
}: FloatingButtonProps) {
  const colors: Record<string, string> = {
    primary: 'from-sky-soft to-sky-deep',
    pink: 'from-blush to-coral',
    mint: 'from-mint to-mint',
  };
  return (
    <motion.div
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.4 }}
      className="fixed bottom-6 right-6 z-40 safe-bottom"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Link href={href} aria-label={label ?? '新增'}>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b ${colors[variant]} text-3xl text-white shadow-soft-lg border-4 border-white/80`}
          >
            {icon}
          </motion.button>
        </Link>
      </motion.div>
      {label && (
        <div className="mt-1 text-center text-xs font-bold text-slate-500 drop-shadow">
          {label}
        </div>
      )}
    </motion.div>
  );
}
