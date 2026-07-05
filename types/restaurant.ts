// 餐厅相关类型定义

export interface MapCoord {
  lat: number;
  lng: number;
}

export interface Restaurant {
  id: string;
  name: string;
  branchName?: string;
  cuisine: string;
  district: string;
  businessArea?: string;
  address: string;
  mapCoord?: MapCoord;
  businessHours: string;
  supportsLunch: boolean;
  supportsDinner: boolean;
  avgPrice: number;
  officialRating?: number;
  recommenderId: string;
  recommendSource?: string;
  recommendReason?: string;
  tags: string[];
  note?: string;
  inPool: boolean;
  experienced: boolean;
  finalRating?: number;
  coverImage?: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NewRestaurantInput {
  name: string;
  branchName?: string;
  cuisine: string;
  district: string;
  businessArea?: string;
  address: string;
  mapCoord?: MapCoord;
  businessHours: string;
  supportsLunch: boolean;
  supportsDinner: boolean;
  avgPrice: number;
  officialRating?: number;
  recommenderId: string;
  recommendSource?: string;
  recommendReason?: string;
  tags?: string[];
  note?: string;
  inPool: boolean;
  coverImage?: string;
  photos?: string[];
}

export interface RestaurantFilter {
  cuisine?: string[];
  district?: string[];
  maxBudget?: number;
  minBudget?: number;
  lunch?: boolean;
  dinner?: boolean;
  occasion?: string[];
  queueTime?: 'short' | 'medium' | 'long';
  reservationRequired?: boolean;
  tags?: string[];
}
