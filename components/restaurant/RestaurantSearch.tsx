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
export const SHANGHAI_BRANCH_DATA: Record<string, SearchBranchGroup> = {
  '点都德': {
    name: '点都德',
    cuisine: '粤菜',
    branches: [
      { name: '点都德', branchName: '静安寺店', cuisine: '粤菜', district: '静安区', address: '上海市静安区南京西路1601号越洋广场L3层', businessHours: '10:00 - 22:00', supportsLunch: true, supportsDinner: true, avgPrice: 85 },
      { name: '点都德', branchName: '徐家汇店', cuisine: '粤菜', district: '徐汇区', address: '上海市徐汇区衡山路932号太平洋百货4层', businessHours: '10:00 - 22:00', supportsLunch: true, supportsDinner: true, avgPrice: 88 },
      { name: '点都德', branchName: '陆家嘴店', cuisine: '粤菜', district: '浦东新区', address: '上海市浦东新区陆家嘴环路958号', businessHours: '10:00 - 22:00', supportsLunch: true, supportsDinner: true, avgPrice: 90 },
    ],
  },
  '山缓缓': {
    name: '山缓缓',
    cuisine: '西餐',
    branches: [
      { name: '山缓缓', branchName: '静安寺店', cuisine: '西餐', district: '静安区', address: '上海市静安区愚园路1088号', businessHours: '11:00 - 21:30', supportsLunch: true, supportsDinner: true, avgPrice: 175 },
      { name: '山缓缓', branchName: '衡山路店', cuisine: '西餐', district: '徐汇区', address: '上海市徐汇区衡山路888号', businessHours: '11:00 - 21:30', supportsLunch: true, supportsDinner: true, avgPrice: 180 },
      { name: '山缓缓', branchName: '新华路店', cuisine: '西餐', district: '长宁区', address: '上海市长宁区新华路688号', businessHours: '11:00 - 21:30', supportsLunch: true, supportsDinner: true, avgPrice: 178 },
    ],
  },
  '喜茶': {
    name: '喜茶',
    cuisine: '甜品',
    branches: [
      { name: '喜茶', branchName: '恒隆广场店', cuisine: '甜品', district: '静安区', address: '上海市静安区南京西路1266号恒隆广场B1层', businessHours: '10:00 - 22:00', supportsLunch: false, supportsDinner: false, avgPrice: 28 },
      { name: '喜茶', branchName: '国金中心店', cuisine: '甜品', district: '浦东新区', address: '上海市浦东新区世纪大道8号国金中心B1层', businessHours: '10:00 - 22:00', supportsLunch: false, supportsDinner: false, avgPrice: 25 },
      { name: '喜茶', branchName: '美罗城店', cuisine: '甜品', district: '徐汇区', address: '上海市徐汇区漕溪北路8号美罗城1层', businessHours: '10:00 - 22:00', supportsLunch: false, supportsDinner: false, avgPrice: 26 },
    ],
  },
  '奈雪的茶': {
    name: '奈雪的茶',
    cuisine: '甜品',
    branches: [
      { name: '奈雪的茶', branchName: '来福士店', cuisine: '甜品', district: '黄浦区', address: '上海市黄浦区西藏中路268号来福士广场1层', businessHours: '10:00 - 22:00', supportsLunch: false, supportsDinner: false, avgPrice: 30 },
      { name: '奈雪的茶', branchName: '正大广场店', cuisine: '甜品', district: '浦东新区', address: '上海市浦东新区陆家嘴西路168号正大广场1层', businessHours: '10:00 - 22:00', supportsLunch: false, supportsDinner: false, avgPrice: 28 },
    ],
  },
  '星巴克': {
    name: '星巴克',
    cuisine: '甜品',
    branches: [
      { name: '星巴克', branchName: '南京西路店', cuisine: '甜品', district: '静安区', address: '上海市静安区南京西路1376号上海商城1层', businessHours: '07:00 - 22:00', supportsLunch: false, supportsDinner: false, avgPrice: 38 },
      { name: '星巴克', branchName: '外滩源店', cuisine: '甜品', district: '黄浦区', address: '上海市黄浦区圆明园路169号', businessHours: '08:00 - 22:00', supportsLunch: false, supportsDinner: false, avgPrice: 40 },
    ],
  },
  '大龙燚火锅': {
    name: '大龙燚火锅',
    cuisine: '火锅',
    branches: [
      { name: '大龙燚火锅', branchName: '定西路店', cuisine: '火锅', district: '长宁区', address: '上海市长宁区定西路1288号', businessHours: '11:00 - 02:00', supportsLunch: true, supportsDinner: true, avgPrice: 150 },
      { name: '大龙燚火锅', branchName: '长寿路店', cuisine: '火锅', district: '静安区', address: '上海市静安区长寿路658号', businessHours: '11:00 - 02:00', supportsLunch: true, supportsDinner: true, avgPrice: 155 },
    ],
  },
  '海底捞': {
    name: '海底捞',
    cuisine: '火锅',
    branches: [
      { name: '海底捞', branchName: '五角场店', cuisine: '火锅', district: '杨浦区', address: '上海市杨浦区邯郸路600号万达广场5层', businessHours: '10:00 - 03:00', supportsLunch: true, supportsDinner: true, avgPrice: 140 },
      { name: '海底捞', branchName: '人民广场店', cuisine: '火锅', district: '黄浦区', address: '上海市黄浦区西藏中路180号高盛商厦3层', businessHours: '10:00 - 03:00', supportsLunch: true, supportsDinner: true, avgPrice: 138 },
      { name: '海底捞', branchName: '徐家汇店', cuisine: '火锅', district: '徐汇区', address: '上海市徐汇区漕溪北路595号上海电影广场2层', businessHours: '10:00 - 03:00', supportsLunch: true, supportsDinner: true, avgPrice: 142 },
    ],
  },
  '太二酸菜鱼': {
    name: '太二酸菜鱼',
    cuisine: '川菜',
    branches: [
      { name: '太二酸菜鱼', branchName: '新天地店', cuisine: '川菜', district: '黄浦区', address: '上海市黄浦区马当路245号新天地时尚B1层', businessHours: '11:00 - 21:30', supportsLunch: true, supportsDinner: true, avgPrice: 95 },
      { name: '太二酸菜鱼', branchName: '五角场店', cuisine: '川菜', district: '杨浦区', address: '上海市杨浦区邯郸路600号万达广场3层', businessHours: '11:00 - 21:30', supportsLunch: true, supportsDinner: true, avgPrice: 92 },
    ],
  },
  '木屋烧烤': {
    name: '木屋烧烤',
    cuisine: '烧烤',
    branches: [
      { name: '木屋烧烤', branchName: '天钥桥路店', cuisine: '烧烤', district: '徐汇区', address: '上海市徐汇区天钥桥路323号', businessHours: '17:00 - 02:00', supportsLunch: false, supportsDinner: true, avgPrice: 100 },
      { name: '木屋烧烤', branchName: '张杨路店', cuisine: '烧烤', district: '浦东新区', address: '上海市浦东新区张杨路628号', businessHours: '17:00 - 02:00', supportsLunch: false, supportsDinner: true, avgPrice: 95 },
    ],
  },
  '寿司郎': {
    name: '寿司郎',
    cuisine: '日料',
    branches: [
      { name: '寿司郎', branchName: '静安寺店', cuisine: '日料', district: '静安区', address: '上海市静安区南京西路1699号伊美时尚广场B1层', businessHours: '11:00 - 22:00', supportsLunch: true, supportsDinner: true, avgPrice: 75 },
      { name: '寿司郎', branchName: '正大广场店', cuisine: '日料', district: '浦东新区', address: '上海市浦东新区陆家嘴西路168号正大广场3层', businessHours: '11:00 - 22:00', supportsLunch: true, supportsDinner: true, avgPrice: 78 },
    ],
  },
  '西贝莜面村': {
    name: '西贝莜面村',
    cuisine: '西北菜',
    branches: [
      { name: '西贝莜面村', branchName: '浦东嘉里城店', cuisine: '西北菜', district: '浦东新区', address: '上海市浦东新区花木路1378号浦东嘉里城B1层', businessHours: '11:00 - 21:30', supportsLunch: true, supportsDinner: true, avgPrice: 95 },
      { name: '西贝莜面村', branchName: '南京东路店', cuisine: '西北菜', district: '黄浦区', address: '上海市黄浦区南京东路300号恒基名人购物中心5层', businessHours: '11:00 - 21:30', supportsLunch: true, supportsDinner: true, avgPrice: 92 },
    ],
  },
  '外婆家': {
    name: '外婆家',
    cuisine: '江浙菜',
    branches: [
      { name: '外婆家', branchName: '南京西路店', cuisine: '江浙菜', district: '静安区', address: '上海市静安区南京西路1618号久光百货B1层', businessHours: '10:30 - 21:30', supportsLunch: true, supportsDinner: true, avgPrice: 70 },
      { name: '外婆家', branchName: '五角场店', cuisine: '江浙菜', district: '杨浦区', address: '上海市杨浦区邯郸路600号万达广场4层', businessHours: '10:30 - 21:30', supportsLunch: true, supportsDinner: true, avgPrice: 68 },
    ],
  },
  '绿茶餐厅': {
    name: '绿茶餐厅',
    cuisine: '江浙菜',
    branches: [
      { name: '绿茶餐厅', branchName: '人民广场店', cuisine: '江浙菜', district: '黄浦区', address: '上海市黄浦区西藏中路268号来福士广场4层', businessHours: '10:30 - 21:30', supportsLunch: true, supportsDinner: true, avgPrice: 75 },
      { name: '绿茶餐厅', branchName: '浦东八佰伴店', cuisine: '江浙菜', district: '浦东新区', address: '上海市浦东新区张杨路501号第一八佰伴8层', businessHours: '10:30 - 21:30', supportsLunch: true, supportsDinner: true, avgPrice: 72 },
    ],
  },
  '麦当劳': {
    name: '麦当劳',
    cuisine: '快餐',
    branches: [
      { name: '麦当劳', branchName: '南京路步行街店', cuisine: '快餐', district: '黄浦区', address: '上海市黄浦区南京东路720号第一食品商店2层', businessHours: '06:00 - 23:00', supportsLunch: true, supportsDinner: true, avgPrice: 35 },
      { name: '麦当劳', branchName: '陆家嘴店', cuisine: '快餐', district: '浦东新区', address: '上海市浦东新区陆家嘴环路1000号恒生银行大厦1层', businessHours: '07:00 - 22:00', supportsLunch: true, supportsDinner: true, avgPrice: 32 },
    ],
  },
  '肯德基': {
    name: '肯德基',
    cuisine: '快餐',
    branches: [
      { name: '肯德基', branchName: '人民广场店', cuisine: '快餐', district: '黄浦区', address: '上海市黄浦区西藏中路180号1层', businessHours: '06:00 - 23:00', supportsLunch: true, supportsDinner: true, avgPrice: 38 },
      { name: '肯德基', branchName: '徐家汇店', cuisine: '快餐', district: '徐汇区', address: '上海市徐汇区漕溪北路595号1层', businessHours: '06:00 - 23:00', supportsLunch: true, supportsDinner: true, avgPrice: 36 },
    ],
  },
  '汉堡王': {
    name: '汉堡王',
    cuisine: '快餐',
    branches: [
      { name: '汉堡王', branchName: '月星环球港店', cuisine: '快餐', district: '普陀区', address: '上海市普陀区中山北路3300号月星环球港B1层', businessHours: '10:00 - 22:00', supportsLunch: true, supportsDinner: true, avgPrice: 40 },
    ],
  },
  '必胜客': {
    name: '必胜客',
    cuisine: '西餐',
    branches: [
      { name: '必胜客', branchName: '徐家汇店', cuisine: '西餐', district: '徐汇区', address: '上海市徐汇区衡山路932号太平洋百货1层', businessHours: '10:00 - 22:00', supportsLunch: true, supportsDinner: true, avgPrice: 85 },
    ],
  },
  '鼎泰丰': {
    name: '鼎泰丰',
    cuisine: '川菜',
    branches: [
      { name: '鼎泰丰', branchName: '新天地店', cuisine: '川菜', district: '黄浦区', address: '上海市黄浦区马当路245号新天地时尚L2层', businessHours: '11:00 - 21:30', supportsLunch: true, supportsDinner: true, avgPrice: 150 },
      { name: '鼎泰丰', branchName: '国金中心店', cuisine: '川菜', district: '浦东新区', address: '上海市浦东新区世纪大道8号国金中心L3层', businessHours: '11:00 - 21:30', supportsLunch: true, supportsDinner: true, avgPrice: 145 },
    ],
  },
  '小南国': {
    name: '小南国',
    cuisine: '本帮菜',
    branches: [
      { name: '小南国', branchName: '衡山路店', cuisine: '本帮菜', district: '徐汇区', address: '上海市徐汇区衡山路516号富豪环球东亚酒店内', businessHours: '11:00 - 22:00', supportsLunch: true, supportsDinner: true, avgPrice: 180 },
    ],
  },
  '大董': {
    name: '大董',
    cuisine: '本帮菜',
    branches: [
      { name: '大董', branchName: '越洋广场店', cuisine: '本帮菜', district: '静安区', address: '上海市静安区南京西路1601号越洋广场4层', businessHours: '11:00 - 22:00', supportsLunch: true, supportsDinner: true, avgPrice: 350 },
    ],
  },
  '左庭右院': {
    name: '左庭右院鲜牛肉火锅',
    cuisine: '火锅',
    branches: [
      { name: '左庭右院鲜牛肉火锅', branchName: '日月光中心店', cuisine: '火锅', district: '黄浦区', address: '上海市黄浦区徐家汇路618号日月光中心B2层', businessHours: '10:30 - 22:00', supportsLunch: true, supportsDinner: true, avgPrice: 120 },
      { name: '左庭右院鲜牛肉火锅', branchName: '五角场店', cuisine: '火锅', district: '杨浦区', address: '上海市杨浦区邯郸路600号万达广场4层', businessHours: '10:30 - 22:00', supportsLunch: true, supportsDinner: true, avgPrice: 115 },
    ],
  },
  '捞王': {
    name: '捞王锅物料理',
    cuisine: '火锅',
    branches: [
      { name: '捞王锅物料理', branchName: '静安店', cuisine: '火锅', district: '静安区', address: '上海市静安区南京西路1788号1788国际中心3层', businessHours: '11:00 - 23:00', supportsLunch: true, supportsDinner: true, avgPrice: 130 },
      { name: '捞王锅物料理', branchName: '徐家汇店', cuisine: '火锅', district: '徐汇区', address: '上海市徐汇区肇嘉浜路1111号美罗城6层', businessHours: '11:00 - 23:00', supportsLunch: true, supportsDinner: true, avgPrice: 128 },
    ],
  },
  '哥老官': {
    name: '哥老官重庆美蛙鱼头',
    cuisine: '川菜',
    branches: [
      { name: '哥老官重庆美蛙鱼头', branchName: '日月光店', cuisine: '川菜', district: '黄浦区', address: '上海市黄浦区徐家汇路618号日月光中心B2层', businessHours: '11:00 - 22:30', supportsLunch: true, supportsDinner: true, avgPrice: 135 },
      { name: '哥老官重庆美蛙鱼头', branchName: '五角场店', cuisine: '川菜', district: '杨浦区', address: '上海市杨浦区邯郸路600号万达广场4层', businessHours: '11:00 - 22:30', supportsLunch: true, supportsDinner: true, avgPrice: 130 },
    ],
  },
  '一风堂': {
    name: '一风堂',
    cuisine: '日料',
    branches: [
      { name: '一风堂', branchName: '静安嘉里中心店', cuisine: '日料', district: '静安区', address: '上海市静安区南京西路1515号静安嘉里中心B1层', businessHours: '11:00 - 22:00', supportsLunch: true, supportsDinner: true, avgPrice: 85 },
    ],
  },
  '元气寿司': {
    name: '元气寿司',
    cuisine: '日料',
    branches: [
      { name: '元气寿司', branchName: '龙之梦购物中心店', cuisine: '日料', district: '长宁区', address: '上海市长宁区长宁路1018号龙之梦购物中心B1层', businessHours: '11:00 - 22:00', supportsLunch: true, supportsDinner: true, avgPrice: 80 },
    ],
  },
  'Manner': {
    name: 'Manner Coffee',
    cuisine: '甜品',
    branches: [
      { name: 'Manner Coffee', branchName: '南京西路店', cuisine: '甜品', district: '静安区', address: '上海市静安区南京西路1266号恒隆广场1层', businessHours: '07:30 - 21:00', supportsLunch: false, supportsDinner: false, avgPrice: 20 },
      { name: 'Manner Coffee', branchName: '陆家嘴店', cuisine: '甜品', district: '浦东新区', address: '上海市浦东新区陆家嘴环路1000号恒生银行大厦1层', businessHours: '07:30 - 21:00', supportsLunch: false, supportsDinner: false, avgPrice: 22 },
    ],
  },
  'M Stand': {
    name: 'M Stand',
    cuisine: '甜品',
    branches: [
      { name: 'M Stand', branchName: '衡山路店', cuisine: '甜品', district: '徐汇区', address: '上海市徐汇区衡山路888号', businessHours: '08:00 - 22:00', supportsLunch: false, supportsDinner: false, avgPrice: 35 },
    ],
  },
  '瑞幸': {
    name: '瑞幸咖啡',
    cuisine: '甜品',
    branches: [
      { name: '瑞幸咖啡', branchName: '人民广场店', cuisine: '甜品', district: '黄浦区', address: '上海市黄浦区西藏中路180号1层', businessHours: '07:00 - 22:00', supportsLunch: false, supportsDinner: false, avgPrice: 18 },
      { name: '瑞幸咖啡', branchName: '徐家汇店', cuisine: '甜品', district: '徐汇区', address: '上海市徐汇区漕溪北路595号1层', businessHours: '07:00 - 22:00', supportsLunch: false, supportsDinner: false, avgPrice: 16 },
    ],
  },
  '很久以前羊肉串': {
    name: '很久以前羊肉串',
    cuisine: '烧烤',
    branches: [
      { name: '很久以前羊肉串', branchName: '五角场店', cuisine: '烧烤', district: '杨浦区', address: '上海市杨浦区邯郸路399号', businessHours: '16:00 - 03:00', supportsLunch: false, supportsDinner: true, avgPrice: 110 },
    ],
  },
  '丰茂烤串': {
    name: '丰茂烤串',
    cuisine: '烧烤',
    branches: [
      { name: '丰茂烤串', branchName: '江苏路店', cuisine: '烧烤', district: '长宁区', address: '上海市长宁区江苏路458号', businessHours: '11:00 - 02:00', supportsLunch: true, supportsDinner: true, avgPrice: 105 },
    ],
  },
  '桂满陇': {
    name: '桂满陇',
    cuisine: '江浙菜',
    branches: [
      { name: '桂满陇', branchName: '徐家汇店', cuisine: '江浙菜', district: '徐汇区', address: '上海市徐汇区衡山路932号太平洋百货6层', businessHours: '10:30 - 21:30', supportsLunch: true, supportsDinner: true, avgPrice: 80 },
      { name: '桂满陇', branchName: '陆家嘴店', cuisine: '江浙菜', district: '浦东新区', address: '上海市浦东新区陆家嘴西路168号正大广场6层', businessHours: '10:30 - 21:30', supportsLunch: true, supportsDinner: true, avgPrice: 78 },
    ],
  },
  '南京大排档': {
    name: '南京大牌档',
    cuisine: '江浙菜',
    branches: [
      { name: '南京大牌档', branchName: '人民广场店', cuisine: '江浙菜', district: '黄浦区', address: '上海市黄浦区西藏中路268号来福士广场6层', businessHours: '11:00 - 21:30', supportsLunch: true, supportsDinner: true, avgPrice: 70 },
    ],
  },
  '萨莉亚': {
    name: '萨莉亚',
    cuisine: '西餐',
    branches: [
      { name: '萨莉亚', branchName: '南京东路店', cuisine: '西餐', district: '黄浦区', address: '上海市黄浦区南京东路300号恒基名人购物中心B1层', businessHours: '10:00 - 22:00', supportsLunch: true, supportsDinner: true, avgPrice: 50 },
    ],
  },
  'Wagas': {
    name: 'Wagas',
    cuisine: '西餐',
    branches: [
      { name: 'Wagas', branchName: '静安嘉里中心店', cuisine: '西餐', district: '静安区', address: '上海市静安区南京西路1515号静安嘉里中心B1层', businessHours: '08:00 - 22:00', supportsLunch: true, supportsDinner: true, avgPrice: 100 },
    ],
  },
  '和府捞面': {
    name: '和府捞面',
    cuisine: '快餐',
    branches: [
      { name: '和府捞面', branchName: '南京西路店', cuisine: '快餐', district: '静安区', address: '上海市静安区南京西路1618号久光百货B1层', businessHours: '10:00 - 22:00', supportsLunch: true, supportsDinner: true, avgPrice: 45 },
    ],
  },
  '味千拉面': {
    name: '味千拉面',
    cuisine: '日料',
    branches: [
      { name: '味千拉面', branchName: '徐家汇店', cuisine: '日料', district: '徐汇区', address: '上海市徐汇区衡山路932号太平洋百货B1层', businessHours: '10:00 - 22:00', supportsLunch: true, supportsDinner: true, avgPrice: 40 },
    ],
  },
  '云海肴': {
    name: '云海肴云南菜',
    cuisine: '滇菜',
    branches: [
      { name: '云海肴云南菜', branchName: '五角场店', cuisine: '滇菜', district: '杨浦区', address: '上海市杨浦区邯郸路600号万达广场4层', businessHours: '11:00 - 21:30', supportsLunch: true, supportsDinner: true, avgPrice: 95 },
    ],
  },
  '望湘园': {
    name: '望湘园',
    cuisine: '湘菜',
    branches: [
      { name: '望湘园', branchName: '人民广场店', cuisine: '湘菜', district: '黄浦区', address: '上海市黄浦区西藏中路268号来福士广场5层', businessHours: '10:30 - 21:30', supportsLunch: true, supportsDinner: true, avgPrice: 85 },
    ],
  },
  '大馥烧肉': {
    name: '大馥烧肉酒场',
    cuisine: '韩餐',
    branches: [
      { name: '大馥烧肉酒场', branchName: '静安寺店', cuisine: '韩餐', district: '静安区', address: '上海市静安区南京西路1699号伊美时尚广场3层', businessHours: '11:00 - 23:00', supportsLunch: true, supportsDinner: true, avgPrice: 150 },
    ],
  },
  '姜虎东白丁': {
    name: '姜虎东白丁烤肉',
    cuisine: '韩餐',
    branches: [
      { name: '姜虎东白丁烤肉', branchName: '虹泉路店', cuisine: '韩餐', district: '闵行区', address: '上海市闵行区虹泉路1078号井亭天地3层', businessHours: '11:00 - 23:00', supportsLunch: true, supportsDinner: true, avgPrice: 135 },
    ],
  },
  '小杨生煎': {
    name: '小杨生煎',
    cuisine: '快餐',
    branches: [
      { name: '小杨生煎', branchName: '南京东路店', cuisine: '快餐', district: '黄浦区', address: '上海市黄浦区南京东路720号第一食品商店1层', businessHours: '06:30 - 22:00', supportsLunch: true, supportsDinner: true, avgPrice: 25 },
      { name: '小杨生煎', branchName: '陆家嘴店', cuisine: '快餐', district: '浦东新区', address: '上海市浦东新区陆家嘴西路168号正大广场B2层', businessHours: '07:00 - 22:00', supportsLunch: true, supportsDinner: true, avgPrice: 28 },
    ],
  },
  '南翔馒头店': {
    name: '南翔馒头店',
    cuisine: '本帮菜',
    branches: [
      { name: '南翔馒头店', branchName: '豫园店', cuisine: '本帮菜', district: '黄浦区', address: '上海市黄浦区豫园路85号', businessHours: '07:30 - 21:00', supportsLunch: true, supportsDinner: true, avgPrice: 60 },
    ],
  },
  '和民': {
    name: '和民居酒屋',
    cuisine: '日料',
    branches: [
      { name: '和民居酒屋', branchName: '新天地店', cuisine: '日料', district: '黄浦区', address: '上海市黄浦区马当路245号新天地时尚L2层', businessHours: '11:00 - 23:30', supportsLunch: true, supportsDinner: true, avgPrice: 120 },
    ],
  },
  '巴奴毛肚火锅': {
    name: '巴奴毛肚火锅',
    cuisine: '火锅',
    branches: [
      { name: '巴奴毛肚火锅', branchName: '徐家汇店', cuisine: '火锅', district: '徐汇区', address: '上海市徐汇区肇嘉浜路1111号美罗城6层', businessHours: '11:00 - 02:00', supportsLunch: true, supportsDinner: true, avgPrice: 160 },
    ],
  },
  '凑凑火锅': {
    name: '湊湊火锅·茶憩',
    cuisine: '火锅',
    branches: [
      { name: '湊湊火锅·茶憩', branchName: '静安嘉里中心店', cuisine: '火锅', district: '静安区', address: '上海市静安区南京西路1515号静安嘉里中心4层', businessHours: '11:00 - 02:00', supportsLunch: true, supportsDinner: true, avgPrice: 155 },
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
        const matchKey = key.toLowerCase().includes(qLower);
        
        if (matchName || matchCuisine || matchDistrict || matchKey) {
          matchedGroups.push(group);
        }
      }

      matchedGroups.sort((a, b) => {
        const aExact = a.name.toLowerCase() === qLower || a.name.toLowerCase().startsWith(qLower);
        const bExact = b.name.toLowerCase() === qLower || b.name.toLowerCase().startsWith(qLower);
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return 0;
      });

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

      setResults(matchedGroups.slice(0, 10));
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
                        <span className="truncate text-base font-bold text-slate-700">{group.name}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-0.5">
                          <Utensils className="h-3 w-3" />
                          {group.cuisine}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="h-3 w-3" />
                          {group.branches[0].district}
                        </span>
                        <span className="flex items-center gap-0.5 font-medium text-coral">
                          <JapaneseYen className="h-3 w-3" />
                          ¥{group.branches[0].avgPrice}
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
                          <span className="truncate text-base font-bold text-slate-700">{group.name}</span>
                          <span className="shrink-0 rounded-full bg-butter/40 px-2 py-0.5 text-xs text-amber-600">
                            {group.branches.length} 家门店
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-0.5">
                            <Utensils className="h-3 w-3" />
                            {group.cuisine}
                          </span>
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
