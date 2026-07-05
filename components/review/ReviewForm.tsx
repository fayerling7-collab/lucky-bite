'use client';

import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Utensils, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StarRating } from './StarRating';
import { useApp } from '@/lib/appStore';
import { cn } from '@/lib/utils';
import type { Restaurant, NewReviewInput } from '@/types';

// 菜系封面 emoji 映射
const CUISINE_EMOJI: Record<string, string> = {
  '中餐': '🥘', '粤菜': '🍜', '川菜': '🌶️', '湘菜': '🌶️', '火锅': '🍲',
  '烧烤': '🍢', '日料': '🍣', '韩餐': '🍱', '西餐': '🍝', '东南亚菜': '🍛',
  '咖啡': '☕', '甜品': '🍰',
};

interface ReviewFormProps {
  restaurant: Restaurant;
  onSubmit: (review: NewReviewInput) => Promise<void>;
  onCancel?: () => void;
}

const DIMENSIONS = [
  { key: 'food', label: '菜品' },
  { key: 'environment', label: '环境' },
  { key: 'service', label: '服务' },
  { key: 'value', label: '性价比' },
] as const;

type ScoreKey = (typeof DIMENSIONS)[number]['key'];

/** 餐厅评价表单：四维评分 + 去留意向 + 感受 */
export function ReviewForm({ restaurant, onSubmit, onCancel }: ReviewFormProps) {
  const { currentPlayer } = useApp();
  const [scores, setScores] = useState<Record<ScoreKey, number>>({
    food: 0, environment: 0, service: 0, value: 0,
  });
  const [wouldReturn, setWouldReturn] = useState(true);
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [feeling, setFeeling] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    !!currentPlayer &&
    scores.food > 0 && scores.environment > 0 &&
    scores.service > 0 && scores.value > 0 && !submitting;

  const handleSubmit = async () => {
    if (!currentPlayer || !canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit({
        restaurantId: restaurant.id,
        playerId: currentPlayer.id,
        food: scores.food,
        environment: scores.environment,
        service: scores.service,
        value: scores.value,
        wouldReturn,
        wouldRecommend,
        feeling: feeling.trim() || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 未选择玩家时提示
  if (!currentPlayer) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl bg-white/70 p-8 text-center">
        <UserCircle className="h-12 w-12 text-lavender" />
        <p className="font-bold text-slate-600">请先选择当前玩家</p>
        <p className="text-sm text-slate-400">评价需要关联一位玩家，请先选定 currentPlayer 后再评价</p>
      </div>
    );
  }

  const emoji = CUISINE_EMOJI[restaurant.cuisine] ?? '🍽️';

  return (
    <div className="flex flex-col gap-5">
      {/* 餐厅头部 */}
      <div className="flex items-center gap-3 rounded-3xl bg-gradient-to-r from-sky-soft/60 to-lavender/50 p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-3xl shadow-soft">
          {emoji}
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-slate-700">{restaurant.name}</p>
          <p className="flex items-center gap-1 text-xs text-slate-500">
            <Utensils className="h-3 w-3" />{restaurant.cuisine} · {restaurant.district}
          </p>
        </div>
      </div>

      {/* 四维评分 */}
      <div className="flex flex-col gap-3 rounded-3xl bg-white/60 p-4">
        {DIMENSIONS.map((d) => (
          <StarRating
            key={d.key}
            label={d.label}
            value={scores[d.key]}
            onChange={(v) => setScores((s) => ({ ...s, [d.key]: v }))}
          />
        ))}
      </div>

      {/* 去留意向 */}
      <div className="flex flex-col gap-3">
        <div>
          <p className="mb-1.5 text-sm font-bold text-slate-500">是否值得再次体验？</p>
          <ChoiceToggle value={wouldReturn} onChoose={setWouldReturn} yesLabel="会再来" noLabel="不再来" />
        </div>
        <div>
          <p className="mb-1.5 text-sm font-bold text-slate-500">是否推荐朋友？</p>
          <ChoiceToggle value={wouldRecommend} onChoose={setWouldRecommend} yesLabel="推荐" noLabel="不推荐" />
        </div>
      </div>

      {/* 文字感受 */}
      <textarea
        rows={3}
        value={feeling}
        onChange={(e) => setFeeling(e.target.value)}
        placeholder="本次体验感受…"
        className="w-full resize-none rounded-2xl border-2 border-sky-soft/40 bg-white/70 px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-sky-soft transition"
      />

      {/* 提交 / 取消 */}
      <div className="flex gap-3">
        {onCancel && (
          <Button variant="ghost" className="flex-1" onClick={onCancel} disabled={submitting}>
            取消
          </Button>
        )}
        <Button variant="mint" size="lg" className="flex-1" onClick={handleSubmit} disabled={!canSubmit}>
          {submitting ? '提交中…' : '提交评价'}
        </Button>
      </div>
    </div>
  );
}

/** 二选一按钮组：可切换 yes / no */
function ChoiceToggle({
  value, onChoose, yesLabel, noLabel,
}: { value: boolean; onChoose: (v: boolean) => void; yesLabel: string; noLabel: string }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <ChoiceBtn
        active={value === true}
        onClick={() => onChoose(true)}
        icon={<ThumbsUp className="h-4 w-4" />}
        label={yesLabel}
        activeCls="bg-gradient-to-r from-mint to-mint text-emerald-700"
      />
      <ChoiceBtn
        active={value === false}
        onClick={() => onChoose(false)}
        icon={<ThumbsDown className="h-4 w-4" />}
        label={noLabel}
        activeCls="bg-gradient-to-r from-coral to-blush text-white"
      />
    </div>
  );
}

function ChoiceBtn({
  active, onClick, icon, label, activeCls,
}: { active: boolean; onClick: () => void; icon: ReactNode; label: string; activeCls: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all',
        active ? cn(activeCls, 'shadow-pop') : 'border-2 border-sky-soft/40 bg-white/70 text-slate-500',
      )}
    >
      {icon}{label}
    </motion.button>
  );
}
