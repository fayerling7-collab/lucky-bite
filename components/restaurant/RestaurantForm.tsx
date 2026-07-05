'use client';

import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { TAG_GROUPS } from '@/data/tags';
import type { Restaurant, NewRestaurantInput } from '@/types/restaurant';
import type { Player } from '@/types/player';

interface RestaurantFormProps {
  initial?: Partial<Restaurant>;
  recommenders: Player[];
  onSubmit: (data: NewRestaurantInput) => Promise<void>;
  onCancel: () => void;
  defaultRecommenderId?: string;
}

const inputCls =
  'w-full rounded-2xl border-2 border-sky-soft/40 bg-white/70 px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-sky-soft transition';

const CUISINE_OPTIONS = TAG_GROUPS[0]?.tags ?? [];

/** 新增/编辑餐厅表单（简化版） */
export function RestaurantForm({
  initial,
  recommenders,
  onSubmit,
  onCancel,
  defaultRecommenderId,
}: RestaurantFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const initialRecommender = initial?.recommenderId ?? defaultRecommenderId ?? (recommenders.length === 1 ? recommenders[0]?.id : '');

  const [form, setForm] = useState({
    name: initial?.name ?? '',
    branchName: initial?.branchName ?? '',
    cuisine: initial?.cuisine ?? '',
    district: initial?.district ?? '',
    address: initial?.address ?? '',
    businessHours: initial?.businessHours ?? '',
    supportsLunch: initial?.supportsLunch ?? true,
    supportsDinner: initial?.supportsDinner ?? true,
    avgPrice: initial?.avgPrice ?? 0,
    recommenderId: initialRecommender,
    inPool: initial?.inPool ?? true,
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  // 必填：餐厅名称、菜系、详细地址、营业时间、午市/晚市、推荐人
  // 非必填：门店名称、所在地区、人均价格
  const canSubmit = form.name.trim() && form.cuisine.trim() && form.address.trim() && form.businessHours.trim() && form.recommenderId && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        branchName: form.branchName.trim() || undefined,
        cuisine: form.cuisine.trim(),
        district: form.district.trim() || undefined,
        address: form.address.trim(),
        businessHours: form.businessHours.trim(),
        supportsLunch: form.supportsLunch,
        supportsDinner: form.supportsDinner,
        avgPrice: Number(form.avgPrice) || 0,
        recommenderId: form.recommenderId,
        inPool: form.inPool,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const Field = ({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) => (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-bold text-slate-500">{label}{required && <span className="text-coral"> *</span>}</span>
      {children}
    </label>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* 餐厅名称 + 门店名 */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="餐厅名称" required>
          <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="必填" />
        </Field>
        <Field label="门店名称">
          <input className={inputCls} value={form.branchName} onChange={(e) => set('branchName', e.target.value)} placeholder="选填，如：静安寺店" />
        </Field>
      </div>

      {/* 菜系 + 地区 */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="菜系" required>
          <input className={inputCls} list="cuisine-list" value={form.cuisine} onChange={(e) => set('cuisine', e.target.value)} placeholder="必填，如：粤菜" />
          <datalist id="cuisine-list">
            {CUISINE_OPTIONS.map((c) => <option key={c} value={c} />)}
          </datalist>
        </Field>
        <Field label="所在地区">
          <input className={inputCls} value={form.district} onChange={(e) => set('district', e.target.value)} placeholder="选填，如：静安区" />
        </Field>
      </div>

      {/* 详细地址 */}
      <Field label="详细地址" required>
        <input className={inputCls} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="必填，如：上海市静安区南京西路1601号" />
      </Field>

      {/* 营业时间 */}
      <Field label="营业时间" required>
        <input className={inputCls} value={form.businessHours} onChange={(e) => set('businessHours', e.target.value)} placeholder="必填，如：11:00 - 22:00" />
      </Field>

      {/* 午市/晚市 + 人均 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-slate-500">午市 / 晚市 <span className="text-coral">*</span></span>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-500"><Switch checked={form.supportsLunch} onCheckedChange={(v) => set('supportsLunch', v)} /> 午市</label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-500"><Switch checked={form.supportsDinner} onCheckedChange={(v) => set('supportsDinner', v)} /> 晚市</label>
          </div>
        </div>
        <Field label="人均价格">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">¥</span>
            <input type="number" min={0} className={inputCls} value={form.avgPrice} onChange={(e) => set('avgPrice', Number(e.target.value))} placeholder="选填" />
          </div>
        </Field>
      </div>

      {/* 推荐人 */}
      <Field label="推荐人" required>
        <div className="flex flex-wrap gap-2">
          {recommenders.map((p) => (
            <motion.button
              key={p.id} type="button" whileTap={{ scale: 0.9 }}
              onClick={() => set('recommenderId', p.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition',
                form.recommenderId === p.id
                  ? 'bg-gradient-to-r from-lavender to-lavender text-purple-700 shadow-pop'
                  : 'border-2 border-sky-soft/40 bg-white/70 text-slate-500',
              )}
            >
              <span>{p.avatar}</span>{p.nickname}
            </motion.button>
          ))}
        </div>
      </Field>

      {/* 加入扭蛋池 */}
      <label className="flex items-center gap-2 text-sm font-bold text-slate-500">
        <Switch checked={form.inPool} onCheckedChange={(v) => set('inPool', v)} /> 加入扭蛋池
      </label>

      {/* 操作按钮 */}
      <div className="flex gap-3 pt-2">
        <Button variant="ghost" className="flex-1" onClick={onCancel} disabled={submitting}>取消</Button>
        <Button variant="primary" size="lg" className="flex-1" onClick={handleSubmit} disabled={!canSubmit}>
          {submitting ? '保存中…' : initial ? '保存修改' : '添加餐厅'}
        </Button>
      </div>
    </div>
  );
}
