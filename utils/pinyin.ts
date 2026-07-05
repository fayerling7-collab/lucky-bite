import { pinyin } from 'pinyin-pro';

/** 将中文转换为无声调拼音 */
export function toPinyin(text: string): string {
  return pinyin(text, { toneType: 'none', type: 'array' }).join('');
}

/** 取首字母 */
export function pinyinInitials(text: string): string {
  return pinyin(text, { pattern: 'first', toneType: 'none', type: 'array' }).join('');
}

/**
 * 模糊匹配：支持中文、拼音全拼、拼音首字母、英文
 */
export function fuzzyMatch(target: string, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase();
  if (t.includes(q)) return true;
  // 拼音全拼匹配
  const full = toPinyin(target).toLowerCase();
  if (full.includes(q)) return true;
  // 首字母匹配
  const initials = pinyinInitials(target).toLowerCase();
  if (initials.includes(q)) return true;
  return false;
}
