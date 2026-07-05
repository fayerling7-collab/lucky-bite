'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { RankingPeriod } from '@/types/scoring';

// 排行榜周期选项
const PERIODS: { value: RankingPeriod; label: string }[] = [
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'quarter', label: '本季' },
  { value: 'all', label: '全部' },
];

interface RankingTabsProps {
  period: RankingPeriod;
  onChange: (p: RankingPeriod) => void;
}

/** 排行榜周期切换 Tabs（圆角胶囊样式） */
export function RankingTabs({ period, onChange }: RankingTabsProps) {
  return (
    <Tabs
      value={period}
      onValueChange={(v) => onChange(v as RankingPeriod)}
    >
      <TabsList className="shadow-soft">
        {PERIODS.map((p) => (
          <TabsTrigger key={p.value} value={p.value} className="px-4 sm:px-5">
            {p.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
