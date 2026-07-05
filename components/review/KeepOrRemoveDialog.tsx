'use client';

import { useEffect, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { StarRating } from './StarRating';
import type { Restaurant } from '@/types';

interface KeepOrRemoveDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  restaurant: Restaurant | null;
  finalRating?: number;
  onKeep: () => void;
  onRemove: () => void;
}

/** 体验完成后的去留决策弹窗：最终评分 count-up + 保留/移出 */
export function KeepOrRemoveDialog({
  open, onOpenChange, restaurant, finalRating = 0, onKeep, onRemove,
}: KeepOrRemoveDialogProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => v.toFixed(1));

  // count-up 动画：打开时从 0 增长到 finalRating（600ms）
  useEffect(() => {
    if (!open) {
      count.set(0);
      return;
    }
    const controls = animate(count, finalRating, { duration: 0.6, ease: 'easeOut' });
    return () => controls.stop();
  }, [open, finalRating, count]);

  const handleKeep = () => {
    onKeep();
    onOpenChange(false);
  };

  const handleRemoveConfirm = () => {
    onRemove();
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent showClose={false} className="max-w-md overflow-hidden rounded-4xl p-0">
          <AnimatePresence>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className="flex flex-col items-center gap-4 p-7 text-center"
            >
              <DialogTitle className="text-2xl">体验完成！🎉</DialogTitle>

              {/* 最终评分（count-up） */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-end gap-1">
                  <motion.span className="text-6xl font-bold text-amber-500">
                    {rounded}
                  </motion.span>
                  <span className="mb-2 text-lg text-slate-400">/ 5</span>
                </div>
                <StarRating value={finalRating} size="sm" />
              </div>

              <DialogDescription className="text-base text-slate-500">
                {restaurant?.name} 要继续留在扭蛋池吗？
              </DialogDescription>

              {/* 两个大按钮 */}
              <div className="mt-2 flex w-full flex-col gap-3">
                <motion.button
                  type="button"
                  onClick={handleKeep}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-3 rounded-3xl bg-gradient-to-r from-mint to-mint p-4 text-left text-emerald-700 shadow-pop"
                >
                  <span className="text-3xl">🍀</span>
                  <div>
                    <p className="font-bold">继续保留</p>
                    <p className="text-xs text-emerald-600/80">继续参与以后所有随机</p>
                  </div>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-3 rounded-3xl bg-gradient-to-r from-coral to-blush p-4 text-left text-white shadow-pop"
                >
                  <span className="text-3xl">🗑</span>
                  <div>
                    <p className="font-bold">移出扭蛋池</p>
                    <p className="text-xs text-white/80">永久删除，不会再抽到</p>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* 移出二次确认 */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="确认移出扭蛋池？"
        description="删除后，该餐厅将永久移出抽奖池，不再参与随机抽取。"
        confirmText="确认移出"
        cancelText="再想想"
        variant="danger"
        icon="🗑"
        onConfirm={handleRemoveConfirm}
      />
    </>
  );
}
