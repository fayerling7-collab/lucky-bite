'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, JapaneseYen, Sun, Moon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cuisineEmoji } from './RestaurantCard';

export interface RestaurantBranch {
  name: string;
  branchName: string;
  cuisine: string;
  district: string;
  address: string;
  businessHours: string;
  supportsLunch: boolean;
  supportsDinner: boolean;
  avgPrice: number;
}

interface BranchSelectorProps {
  restaurantName: string;
  branches: RestaurantBranch[];
  onSelect: (branch: RestaurantBranch) => void;
  onBack: () => void;
}

/** 门店选择组件 */
export function BranchSelector({ restaurantName, branches, onSelect, onBack }: BranchSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-4"
    >
      {/* 返回按钮 */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
      >
        ← 返回搜索
      </button>

      {/* 标题 */}
      <div className="text-center">
        <p className="text-sm text-slate-400">已找到「{restaurantName}」的门店</p>
        <p className="text-lg font-bold text-slate-700">请选择具体门店</p>
      </div>

      {/* 门店列表 */}
      <div className="flex flex-col gap-3">
        {branches.map((branch, index) => (
          <motion.button
            key={`${branch.district}-${branch.branchName}-${index}`}
            type="button"
            onClick={() => onSelect(branch)}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center gap-4 rounded-3xl border-2 border-sky-soft/30 bg-white/70 p-4 text-left transition hover:border-sky-soft hover:bg-white"
          >
            {/* 菜系图标 */}
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-soft/60 to-sky-deep/40 text-3xl">
              {cuisineEmoji(branch.cuisine)}
            </span>

            {/* 门店信息 */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">{branch.branchName}</span>
                <span className="rounded-full bg-sky-soft/20 px-2 py-0.5 text-xs text-sky-deep">
                  {branch.district}
                </span>
              </div>

              {/* 详细信息 */}
              <div className="mt-2 space-y-1 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{branch.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {branch.businessHours}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-coral">
                    <JapaneseYen className="h-3 w-3" />
                    {branch.avgPrice}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {branch.supportsLunch && (
                    <span className="flex items-center gap-0.5 rounded-full bg-mint/40 px-2 py-0.5 text-emerald-600">
                      <Sun className="h-2.5 w-2.5" /> 午市
                    </span>
                  )}
                  {branch.supportsDinner && (
                    <span className="flex items-center gap-0.5 rounded-full bg-lavender/40 px-2 py-0.5 text-purple-600">
                      <Moon className="h-2.5 w-2.5" /> 晚市
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 箭头 */}
            <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
          </motion.button>
        ))}
      </div>

      {/* 提示 */}
      <div className="rounded-2xl bg-butter/30 p-3 text-center">
        <p className="text-xs text-amber-700">📍 所有门店均位于上海市</p>
      </div>
    </motion.div>
  );
}
