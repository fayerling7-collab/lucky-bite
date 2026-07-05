// 默认标签库（按钮选择，不输入文字）

export interface TagGroup {
  category: string;
  tags: string[];
}

export const TAG_GROUPS: TagGroup[] = [
  {
    category: '菜系',
    tags: ['中餐', '粤菜', '川菜', '湘菜', '火锅', '烧烤', '日料', '韩餐', '西餐', '东南亚菜'],
  },
  {
    category: '类型',
    tags: ['咖啡', '甜品', 'Brunch', '下午茶', '酒吧'],
  },
  {
    category: '场合',
    tags: ['约会', '闺蜜', '家庭', '聚餐', '一个人', '庆祝', '拍照'],
  },
  {
    category: '氛围',
    tags: ['安静', '热闹', '高级', '烟火气'],
  },
  {
    category: '特色',
    tags: ['排队王', '隐藏小店'],
  },
];

export const ALL_TAGS: string[] = TAG_GROUPS.flatMap((g) => g.tags);
