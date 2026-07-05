'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'pink' | 'mint' | 'danger';
  onConfirm: () => void | Promise<void>;
  icon?: string;
}

/** 通用确认弹窗（毛玻璃 + 缩放动画） */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = '确定',
  cancelText = '取消',
  variant = 'primary',
  onConfirm,
  icon,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={false} className="max-w-sm overflow-hidden p-0">
        <AnimatePresence>
          {icon && (
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex justify-center pt-8 text-5xl"
            >
              {icon}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="px-6 pb-6 pt-4 text-center">
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
          {description && (
            <DialogDescription className="mt-3 text-center leading-relaxed">
              {description}
            </DialogDescription>
          )}
          <div className="mt-6 flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              {cancelText}
            </Button>
            <Button variant={variant} className="flex-1" onClick={handleConfirm}>
              {confirmText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
