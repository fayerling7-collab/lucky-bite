'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, JapaneseYen, Plus, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { simulateOnlineSearch } from '@/lib/search';
import { useApp } from '@/lib/appStore';
import { cuisineEmoji } from './RestaurantCard';

export interface SearchResultItem {
  name: string;
  branchName?: string;
  cuisine: string;
  district: string;
  businessArea?: string;
  address: string;
  businessHours: string;
  supportsLunch: boolean;
  supportsDinner: boolean;
  avgPrice: number;
  officialRating?: number;
}

export interface SearchBranchGroup {
  name: string;
  cuisine: string;
  branches: SearchResultItem[];
}

interface RestaurantSearchProps {
  onSelectBranch: (branch: SearchResultItem) => void;
  onManualCreate: (query: string) => void;
}

// 模拟上海门店数据（V1 本地数据，未来可替换为真实 API）
const SHANGHAI_BRANCH_DATA: Record<string, SearchBranchGroup> = {
  '点都德': {
    name: '点都德',
    cuisine: '粤菜',
    branches: [
      { name: '点都德', cuisine: '粤菜', district: '静安区', address: '上海市静安区南京西路1601号越洋广场L3层', businessHours: '10:00 - 22:00', supportsLunch: true, supportsDinner: true, avgPrice: 85 },
      { name: '点都德', cuisine: '粤菜', district: '徐汇区', address: '上海市徐汇区衡山路932号太平洋百货4层', businessHours: '10:00 - 22:00', supportsLunch: true, supportsDinner: true, avgPrice: 88 },
      { name: '点都德', cuisine: '粤菜', district: '浦东新区', address: '上海市浦东新区陆家嘴环路958号', businessHours: '10:00 - 22:00', supportsLunch: true, supportsDinner: true, avgPrice: 90 },
    ],
  },
  '山缓缓': {
    name: '山缓缓',
    cuisine: '西餐',
    branches: [
      { name: '山缓缓', cuisine: '西餐', district: '静安区', address: '上海市静安区愚园路1088号', businessHours: '11:00 - 21:30', supportsLunch: true, supportsDinner: true, avgPrice: 175 },
      { name: '山缓缓', cuisine: '西餐', district: '徐汇区', address: '上海市徐汇区衡山路888号', businessHours: '11:00 - 21:30', supportsLunch: true, supportsDinner: true, avgPrice: 180 },
      { name: '山缓缓', cuisine: '西餐', district: '长宁区', address: '上海市长宁区新华路688号', businessHours: '11:00 - 21:30', supportsLunch: true, supportsDinner: true, avgPrice: 178 },
    ],
  },
  '喜茶': {
    name: '喜茶',
    cuisine: '甜品',
    branches: [
      { name: '喜茶', cuisine: '甜品', district: '静安区', address: '上海市静安区南京西路1266号恒隆广场B1层', businessHours: '10:00 - 22:00', supportsLunch: false, supportsDinner: false, avgPrice: 28 },
      { name: '喜茶', cuisine: '甜品', district: '浦东新区', address: '上海市浦东新区世纪大道8号国金中心B1层', businessHours: '10:00 - 22:00', supportsLunch: false, supportsDinner: false, avgPrice: 25 },
      { name: '喜茶', cuisine: '甜品', district: '徐汇区', address: '上海市徐汇区漕溪北路8号', businessHours: '10:00 - 22:00', supportsLunch: false, supportsDinner: false, avgPrice: 26 },
    ],
  },
  '大龙燚': {
    name: '大龙燚火锅',
    cuisine: '火锅',
    branches: [
      { name: '大龙燚火锅', cuisine: '火锅', district: '长宁区', address: '上海市长宁区定西路1288号', businessHours: '11:00 - 02:00', supportsLunch: true, supportsDinner: true, avgPrice: 150 },
      { name: '大龙燚火锅', cuisine: '火锅', district: '静安区', address: '上海市静安区余姚路800号', businessHours: '11:00 - 02:00', supportsLunch: true, supportsDinner: true, avgPrice: 155 },
    ],
  },
  '木屋烧烤': {
    name: '木屋烧烤',
    cuisine: '烧烤',
    branches: [
      { name: '木屋烧烤', cuisine: '烧烤', district: '徐汇区', address: '上海市徐汇区天钥桥路323号', businessHours: '17:00 - 02:00', supportsLunch: false, supportsDinner: true, avgPrice: 100 },
      { name: '木屋烧烤', cuisine: '烧烤', district: '浦东新区', address: '上海市浦东新区张杨路628号', businessHours: '17:00 - 02:00', supportsLunch: false, supportsDinner: true, avgPrice: 95 },
    ],
  },
  '寿司郎': {
    name: '寿司郎',
    cuisine: '日料',
    branches: [
      { name: '寿司郎', cuisine: '日料', district: '静安区', address: '上海市静安区南京西路1699号', businessHours: '11:00 - 22:00', supportsLunch: true, supportsDinner: true, avgPrice: 75 },
      { name: '寿司郎', cuisine: '日料', district: '浦东新区', address: '上海市浦东新区陆家嘴正大广场3层', businessHours: '11:00 - 22:00', supportsLunch: true, supportsDinner: true, avgPrice: 78 },
    ],
  },
};

/** 智能模糊搜索组件（用于新增餐厅页）- 默认限定上海 */
export function RestaurantSearch({ onSelectBranch, onManualCreate }: RestaurantSearchProps) {
  const { restaurants } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchBranchGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    timerRef.current = setTimeout(() => {
      const matchedGroups: SearchBranchGroup[] = [];
      const qLower = q.toLowerCase();

      for (const [key, group] of Object.entries(SHANGHAI_BRANCH_DATA)) {
        const matchName = group.name.toLowerCase().includes(qLower);
        const matchCuisine = group.cuisine.toLowerCase().includes(qLower);
        const matchDistrict = group.branches.some(b => b.district.toLowerCase().includes(qLower));
        
        if (matchName || matchCuisine || matchDistrict) {
          matchedGroups.push(group);
        }
      }

      const localResults = simulateOnlineSearch(q, restaurants);
      for (const local of localResults) {
        if (!matchedGroups.some(g => g.name === local.name)) {
          matchedGroups.push({
            name: local.name,
            cuisine: local.cuisine,
            branches: [{ ...local, supportsLunch: true, supportsDinner: true }],
          });
        }
      }

      setResults(matchedGroups.slice(0, 6));
      setLoading(false);
    }, 280);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, restaurants]);

  const hasQuery = query.trim().length > 0;

  const handleSelectRestaurant = (group: SearchBranchGroup) => {
    if (group.branches.length === 1) {
      onSelectBranch(group.branches[0]);
    } else {
      setResults([group]);
    }
  };

  return (
    <div className="flex w-full flex-col gap-3">
      {/* 搜索输入框 */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-sky-deep" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索餐厅名 / 菜系 / 地区…（上海）"
          className={cn(
            'h-14 w-full rounded-full border-2 border-sky-soft/40 bg-white/70 pl-14 pr-4 text-base',
            'shadow-soft backdrop-blur-md placeholder:text-slate-400',
            'focus:outline-none focus:border-sky-soft',
          )}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-sky-soft/20 px-2 py-0.5 text-xs text-sky-deep">
          📍 上海
        </span>
      </div>

      {/* 搜索结果列表 */}
      <AnimatePresence>
        {hasQuery && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col gap-2 rounded-3xl bg-white/60 p-2 shadow-soft backdrop-blur-md"
          >
            {loading && (
              <p className="px-4 py-6 text-center text-sm text-slate-400">
                正在搜索上海餐厅…
              </p>
            )}

            {!loading && results.length === 0 && (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-slate-400">
                  上海暂未找到「{query}」相关餐厅
                </p>
                <button
                  type="button"
                  onClick={() => onManualCreate(query)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-mint to-mint px-4 py-2 text-sm font-bold text-emerald-700 shadow-pop transition hover:brightness-105 active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  手动创建 ➕
                </button>
              </div>
            )}

            {!loading && results.map((group) => (
              <motion.div
                key={group.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-transparent bg-white/70 transition hover:border-sky-soft/40"
              >
                {group.branches.length === 1 ? (
                  <button
                    type="button"
                    onClick={() => onSelectBranch(group.branches[0])}
                    className="flex w-full items-center gap-3 rounded-2xl p-3 text-left"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-soft/60 to-sky-deep/40 text-2xl">
                      {cuisineEmoji(group.cuisine)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-bold text-slate-700">{group.name}</span>
                        <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-sky-soft/20 px-2 py-0.5 text-xs text-sky-deep">
                          <Utensils className="h-3 w-3" />
                          {group.cuisine}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="h-3 w-3" />
                          {group.branches[0].district}
                        </span>
                        <span className="flex items-center gap-0.5 font-medium text-coral">
                          <JapaneseYen className="h-3 w-3" />
                          {group.branches[0].avgPrice}
                        </span>
                      </div>
                    </div>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSelectRestaurant(group)}
                      className="flex w-full items-center gap-3 rounded-2xl p-3 text-left"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-soft/60 to-sky-deep/40 text-2xl">
                        {cuisineEmoji(group.cuisine)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-bold text-slate-700">{group.name}</span>
                          <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-sky-soft/20 px-2 py-0.5 text-xs text-sky-deep">
                            <Utensils className="h-3 w-3" />
                            {group.cuisine}
                          </span>
                          <span className="rounded-full bg-butter/40 px-2 py-0.5 text-xs text-amber-600">
                            {group.branches.length} 家门店
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" />
                            {group.branches.map(b => b.district).join(' · ')}
                          </span>
                        </div>
                      </div>
                      <span className="text-slate-300">›</span>
                    </button>

                    {/* 门店列表 */}
                    <div className="border-t border-white/40">
                      {group.branches.map((branch, idx) => (
                        <button
                          key={`${branch.district}-${idx}`}
                          type="button"
                          onClick={() => onSelectBranch(branch)}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-white/50"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-soft/30 text-sm">
                            {cuisineEmoji(branch.cuisine)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-700">{branch.branchName || branch.name}</span>
                              <span className="rounded-full bg-sky-soft/20 px-1.5 py-0.5 text-[10px] text-sky-deep">
                                {branch.district}
                              </span>
                            </div>
                            <div className="mt-0.5 text-[10px] text-slate-400 truncate">{branch.address}</div>
                          </div>
                          <span className="text-xs font-medium text-coral">¥{branch.avgPrice}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            ))}

            {!loading && results.length > 0 && (
              <button
                type="button"
                onClick={() => onManualCreate(query)}
                className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-white/50 px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-white/80"
              >
                <Plus className="h-4 w-4" />
                没找到？手动创建
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
