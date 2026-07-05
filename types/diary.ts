// 美食日记相关类型定义

export interface DiaryEntry {
  id: string;
  restaurantId: string;
  restaurantName: string;       // 冗余存储，防止餐厅被删除后日记丢失信息
  restaurantCuisine?: string;
  participantIds: string[];
  reviewIds: string[];
  finalRating: number;
  recommenderId: string;
  experienceDate: string;       // ISO date
  createdAt: string;
  feeling?: string;             // 汇总感受
}
