'use client';

import { cn } from '@/lib/utils';
import type { Restaurant } from '@/types/restaurant';
import type { Player } from '@/types/player';
import { RestaurantCard } from './RestaurantCard';

interface RestaurantCardColumnProps {
  restaurants: Restaurant[];
  players: Player[];
  direction?: 'up' | 'down';
  onSelect?: (r: Restaurant) => void;
}

/** 根据推荐人 id 查找玩家 */
function findPlayer(players: Player[], id: string): Player | undefined {
  return players.find((p) => p.id === id);
}

/** 餐厅卡无限纵向滚动列 */
export function RestaurantCardColumn({
  restaurants,
  players,
  direction = 'up',
  onSelect,
}: RestaurantCardColumnProps) {
  // 餐厅数少于 4 个时不滚动，直接展示
  const shouldScroll = restaurants.length >= 4;

  // 复制一份拼接，配合 CSS 动画实现无缝循环
  const loopList = shouldScroll ? [...restaurants, ...restaurants] : restaurants;

  // direction 'up'：内容向上移动（translateY 0 → -50%）→ infinite-scroll
  // direction 'down'：内容向下移动（translateY -50% → 0）→ infinite-scroll-reverse
  const animClass =
    direction === 'up' ? 'infinite-scroll' : 'infinite-scroll-reverse';

  return (
    <div
      className={cn(
        'h-full w-72 overflow-hidden',
        // 滚动列左右用渐变遮罩淡化边缘
        '[mask-image:linear-gradient(to_bottom,transparent_0,#000_8%,#000_92%,transparent_100%)]',
      )}
    >
      <div
        className={cn(
          'flex flex-col gap-4',
          shouldScroll && animClass,
          shouldScroll && 'no-scrollbar',
        )}
      >
        {loopList.map((r, i) => (
          <RestaurantCard
            key={`${r.id}-${i}`}
            restaurant={r}
            recommender={findPlayer(players, r.recommenderId)}
            onClick={onSelect ? () => onSelect(r) : undefined}
            index={i % restaurants.length}
          />
        ))}
      </div>
    </div>
  );
}
