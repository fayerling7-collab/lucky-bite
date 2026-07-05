import type { Restaurant } from '@/types/restaurant';
import { fuzzyMatch } from '@/utils/pinyin';

export interface SearchResult {
  restaurant: Restaurant;
  score: number;
}

/**
 * 模糊搜索餐厅：支持中文、拼音全拼、拼音首字母、英文、关键词
 * 对名称、菜系、标签、地区、商圈做多字段加权匹配
 */
export function searchRestaurants(
  restaurants: Restaurant[],
  query: string,
  limit = 8,
): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: SearchResult[] = [];

  for (const r of restaurants) {
    let score = 0;
    // 名称匹配（权重最高）
    if (fuzzyMatch(r.name, q)) score += 10;
    // 门店名匹配
    if (r.branchName && fuzzyMatch(r.branchName, q)) score += 5;
    // 菜系匹配
    if (fuzzyMatch(r.cuisine, q)) score += 4;
    // 标签匹配
    if (r.tags.some((t) => fuzzyMatch(t, q))) score += 3;
    // 地区匹配
    if (fuzzyMatch(r.district, q)) score += 2;
    // 商圈匹配
    if (r.businessArea && fuzzyMatch(r.businessArea, q)) score += 2;
    // 地址匹配
    if (fuzzyMatch(r.address, q)) score += 1;

    if (score > 0) {
      results.push({ restaurant: r, score });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** 模拟在线搜索（V1 本地数据，未来可替换为真实 API） */
export function simulateOnlineSearch(
  query: string,
  localRestaurants: Restaurant[],
): Array<{
  name: string;
  cuisine: string;
  district: string;
  businessArea?: string;
  address: string;
  businessHours: string;
  avgPrice: number;
  officialRating?: number;
}> {
  // V1：返回本地餐厅中匹配的（排除已添加的）
  const local = searchRestaurants(localRestaurants, query, 5).map((r) => r.restaurant);
  return local.map((r) => ({
    name: r.name,
    cuisine: r.cuisine,
    district: r.district,
    businessArea: r.businessArea,
    address: r.address,
    businessHours: r.businessHours,
    avgPrice: r.avgPrice,
    officialRating: r.officialRating,
  }));
}
