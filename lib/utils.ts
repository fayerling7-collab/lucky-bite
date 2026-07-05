import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** 合并 tailwind 类名 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 生成唯一 ID */
export function genId(prefix = ''): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}${ts}${rand}`;
}
