'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// 可爱 emoji 头像池
const AVATARS = [
  '👧', '🧒', '👦', '👩', '🧑', '👨', '👸', '🦸',
  '🦄', '🐱', '🐰', '🐻', '🐼', '🦊', '🐨', '🐯',
];

interface AvatarPickerProps {
  value: string;
  onChange: (a: string) => void;
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-8 gap-2">
      {AVATARS.map((a) => {
        const isSelected = a === value;
        return (
          <motion.button
            key={a}
            type="button"
            onClick={() => onChange(a)}
            whileTap={{ scale: 0.85 }}
            whileHover={{ y: -2 }}
            className={cn(
              'relative flex h-11 w-11 items-center justify-center rounded-2xl text-2xl transition-colors',
              isSelected
                ? 'bg-gradient-to-br from-sky-soft to-sky-deep shadow-pop ring-2 ring-sky-deep'
                : 'bg-white/70 hover:bg-white',
            )}
          >
            <span>{a}</span>
            {isSelected && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-coral text-white"
              >
                <Check className="h-2.5 w-2.5" strokeWidth={4} />
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
