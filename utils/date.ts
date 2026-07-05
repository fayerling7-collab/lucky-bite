/** 日期格式化工具 */

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

export function formatDateChinese(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

export function relativeTime(iso: string): string {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diff = now - t;
  const min = Math.floor(diff / 60000);
  const hour = Math.floor(diff / 3600000);
  const day = Math.floor(diff / 86400000);
  if (min < 1) return '刚刚';
  if (min < 60) return `${min} 分钟前`;
  if (hour < 24) return `${hour} 小时前`;
  if (day < 7) return `${day} 天前`;
  return formatDate(iso);
}

export function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear()
    && da.getMonth() === db.getMonth()
    && da.getDate() === db.getDate();
}

export function isToday(iso: string): boolean {
  return isSameDay(iso, new Date().toISOString());
}

export function startOfPeriod(period: 'week' | 'month' | 'quarter' | 'all'): number {
  const now = new Date();
  if (period === 'all') return 0;
  if (period === 'week') {
    const day = now.getDay() || 7; // 周日为 0 -> 7
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + 1);
    monday.setHours(0, 0, 0, 0);
    return monday.getTime();
  }
  if (period === 'month') {
    return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  }
  // quarter
  const q = Math.floor(now.getMonth() / 3);
  return new Date(now.getFullYear(), q * 3, 1).getTime();
}
