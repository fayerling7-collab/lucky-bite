'use client';

import { useMemo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RotateCcw, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/lib/appStore';
import { cn } from '@/lib/utils';
import { TAG_GROUPS } from '@/data/tags';
import type { RestaurantFilter, Restaurant } from '@/types';

const CUISINE_OPTIONS = ['中餐', '粤菜', '川菜', '湘菜', '火锅', '烧烤', '日料', '韩餐', '西餐', '东南亚菜', '咖啡', '甜品'];

const BUDGET_OPTIONS: Array<{ key: string; label: string; max?: number; min?: number }> = [
  { key: 'all', label: '不限' },
  { key: '50', label: '<50', max: 50 },
  { key: '100', label: '<100', max: 100 },
  { key: '150', label: '<150', max: 150 },
  { key: '200', label: '<200', max: 200 },
  { key: '200+', label: '>200', min: 200 },
];

const OCCASION_OPTIONS = TAG_GROUPS.find((g) => g.category === '场合')?.tags ?? [];
const ALL_TAG_OPTIONS = TAG_GROUPS.flatMap((g) => g.tags);

interface MoodFilterPanelProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  filter: RestaurantFilter;
  onFilterChange: (f: RestaurantFilter) => void;
  poolCount: number;
  onApply: () => void;
  onReset: () => void;
}

function applyFilter(restaurants: Restaurant[], filter: RestaurantFilter): Restaurant[] {
  return restaurants.filter((r) => {
    if (!r.inPool) return false;
    if (filter.cuisine?.length && !filter.cuisine.includes(r.cuisine)) return false;
    if (filter.district?.length && !filter.district.includes(r.district)) return false;
    if (filter.maxBudget != null && r.avgPrice > filter.maxBudget) return false;
    if (filter.minBudget != null && r.avgPrice < filter.minBudget) return false;
    if (filter.lunch && !r.supportsLunch) return false;
    if (filter.dinner && !r.supportsDinner) return false;
    if (filter.occasion?.length && !filter.occasion.some((o) => r.tags.includes(o))) return false;
    if (filter.tags?.length && !filter.tags.some((t) => r.tags.includes(t))) return false;
    return true;
  });
}

/** 「今天想吃什么？」筛选浮层（必须至少选择一项才能开始扭蛋） */
export function MoodFilterPanel({
  open, onOpenChange, filter, onFilterChange, onApply, onReset,
}: MoodFilterPanelProps) {
  const { restaurants } = useApp();
  const liveCount = useMemo(() => applyFilter(restaurants, filter).length, [restaurants, filter]);
  const districts = useMemo(
    () => Array.from(new Set(restaurants.map((r) => r.district).filter(Boolean))),
    [restaurants],
  );

  const hasRequiredFilter = !!(
    filter.cuisine?.length || filter.district?.length || filter.lunch || filter.dinner
  );

  const hasOptionalFilter = !!(
    filter.maxBudget != null || filter.minBudget != null || filter.occasion?.length || filter.tags?.length
  );

  const hasAnyFilter = hasRequiredFilter || hasOptionalFilter;

  const toggle = (key: 'cuisine' | 'district' | 'occasion' | 'tags', value: string) => {
    const arr = filter[key] ?? [];
    const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    onFilterChange({ ...filter, [key]: next.length ? next : undefined });
  };

  const isOn = (key: 'cuisine' | 'district' | 'occasion' | 'tags', value: string) =>
    (filter[key] ?? []).includes(value);

  const isBudgetActive = (opt: (typeof BUDGET_OPTIONS)[number]) => {
    if (opt.key === 'all') return filter.maxBudget == null && filter.minBudget == null;
    if (opt.key === '200+') return filter.minBudget === 200;
    return filter.maxBudget === opt.max;
  };

  const setBudget = (opt: (typeof BUDGET_OPTIONS)[number]) =>
    onFilterChange({ ...filter, maxBudget: opt.max, minBudget: opt.min });

  const handleReset = () => { onFilterChange({}); onReset(); };
  const handleApply = () => { if (hasRequiredFilter) { onApply(); onOpenChange(false); } };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-md overflow-y-auto rounded-4xl p-0">
        <div className="flex flex-col gap-5 p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-butter" />
            <DialogTitle className="text-xl">今天想吃什么？</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-slate-500">
            请至少选择一项，开始今天的幸运扭蛋～
          </DialogDescription>

          {/* 必填筛选区域 */}
          <div className="rounded-2xl bg-gradient-to-r from-sky-soft/30 to-mint/30 p-3">
            <p className="mb-3 text-sm font-bold text-sky-deep flex items-center gap-2">
              <span>✨</span> 必须选择（至少一项）
            </p>

            <Section title="菜系">
              {CUISINE_OPTIONS.map((c) => (
                <Chip key={c} active={isOn('cuisine', c)} onClick={() => toggle('cuisine', c)}>{c}</Chip>
              ))}
            </Section>

            <Section title="地区">
              {districts.map((d) => (
                <Chip key={d} active={isOn('district', d)} onClick={() => toggle('district', d)}>{d}</Chip>
              ))}
              {districts.length === 0 && <p className="text-xs text-slate-400">暂无地区数据</p>}
            </Section>

            <Section title="午市 / 晚市">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <Switch checked={!!filter.lunch} onCheckedChange={(v) => onFilterChange({ ...filter, lunch: v || undefined })} />
                仅看支持午市
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <Switch checked={!!filter.dinner} onCheckedChange={(v) => onFilterChange({ ...filter, dinner: v || undefined })} />
                仅看支持晚市
              </label>
            </Section>
          </div>

          {/* 选填筛选区域 */}
          <div className="rounded-2xl bg-white/40 p-3">
            <p className="mb-3 text-sm font-bold text-slate-500 flex items-center gap-2">
              <span>💡</span> 可选条件（可跳过）
            </p>

            <Section title="人均预算">
              {BUDGET_OPTIONS.map((b) => (
                <Chip key={b.key} active={isBudgetActive(b)} onClick={() => setBudget(b)}>{b.label}</Chip>
              ))}
            </Section>

            <Section title="场合">
              {OCCASION_OPTIONS.map((o) => (
                <Chip key={o} active={isOn('occasion', o)} onClick={() => toggle('occasion', o)}>{o}</Chip>
              ))}
            </Section>

            <Section title="标签">
              {ALL_TAG_OPTIONS.map((t) => (
                <Chip key={t} active={isOn('tags', t)} onClick={() => toggle('tags', t)}>{t}</Chip>
              ))}
            </Section>
          </div>

          {/* 底部：数量 + 模式 + 操作 */}
          <div className="sticky bottom-0 -mx-6 -mb-6 mt-2 flex flex-col gap-3 border-t border-white/60 bg-white/80 px-6 py-4 backdrop-blur">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">
                本次共有 <b className="text-sky-deep">{liveCount}</b> 家餐厅参与扭蛋
              </span>
              <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', hasAnyFilter ? 'bg-butter/60 text-amber-700' : 'bg-mint/60 text-emerald-700')}>
                {hasAnyFilter ? '🎯 精准模式' : '🍀 幸运模式'}
              </span>
            </div>
            
            {!hasRequiredFilter && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-coral/20 p-2 text-center"
              >
                <p className="text-xs text-coral">请至少选择一项：菜系 / 地区 / 午市 / 晚市</p>
              </motion.div>
            )}
            
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />重置
              </Button>
              <Button 
                variant="primary" 
                className="flex-1" 
                onClick={handleApply}
                disabled={!hasRequiredFilter}
              >
                <Check className="h-4 w-4" />确定
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-3">
      <p className="mb-2 text-xs font-bold text-slate-500">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className={cn(
        'rounded-full px-3.5 py-1.5 text-sm font-medium transition-all',
        active
          ? 'bg-gradient-to-r from-sky-soft to-sky-deep text-white shadow-pop'
          : 'border-2 border-sky-soft/40 bg-white/70 text-slate-500 hover:border-sky-soft',
      )}
    >
      {children}
    </motion.button>
  );
}
