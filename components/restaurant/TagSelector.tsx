'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TAG_GROUPS } from '@/data/tags';

interface TagSelectorProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

// 标签分组对应的选中渐变（循环取色，营造马卡龙缤纷感）
const GROUP_GRADIENTS = [
  'bg-gradient-to-r from-sky-soft to-sky-deep text-white',
  'bg-gradient-to-r from-blush to-coral text-white',
  'bg-gradient-to-r from-mint to-mint text-emerald-700',
  'bg-gradient-to-r from-butter to-butter text-amber-700',
  'bg-gradient-to-r from-lavender to-lavender text-purple-700',
];

/** 标签按钮组选择器：按 TAG_GROUPS 分组，多选 */
export function TagSelector({ selected, onChange }: TagSelectorProps) {
  const toggle = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {TAG_GROUPS.map((group, gi) => {
        const activeCls = GROUP_GRADIENTS[gi % GROUP_GRADIENTS.length];
        return (
          <div key={group.category}>
            <p className="mb-2 text-xs font-bold text-slate-400">
              {group.category}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.tags.map((tag) => {
                const active = selected.includes(tag);
                return (
                  <motion.button
                    key={tag}
                    type="button"
                    onClick={() => toggle(tag)}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      'rounded-full px-3.5 py-1.5 text-sm font-medium transition-all',
                      active
                        ? cn(activeCls, 'shadow-pop')
                        : 'border-2 border-sky-soft/40 bg-white/70 text-slate-500 hover:border-sky-soft',
                    )}
                  >
                    {tag}
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
