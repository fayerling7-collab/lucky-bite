'use client';

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import type {
  Restaurant,
  RestaurantFilter,
  Player,
  Review,
  DiaryEntry,
  FoodParty,
  ScoringRule,
  NewRestaurantInput,
  NewPlayerInput,
  NewReviewInput,
} from '@/types';
import {
  restaurantRepository,
  playerRepository,
  reviewRepository,
  diaryRepository,
  partyRepository,
  scoringRuleRepository,
} from '@/lib/repositories';
import { SEED_RESTAURANTS } from '@/data/seedRestaurants';
import { DEFAULT_SCORING_RULES } from '@/data/scoringRules';
import { computeFinalRating, computeRecommenderPoints } from '@/lib/scoring';
import { genId } from '@/lib/utils';

interface AppState {
  ready: boolean;
  currentPlayer: Player | null;
  currentParty: FoodParty | null;
  players: Player[];
  restaurants: Restaurant[];
  reviews: Review[];
  diary: DiaryEntry[];
  scoringRules: ScoringRule[];
}

interface AppActions {
  initParty: (partyName: string, owner: NewPlayerInput) => Promise<void>;
  joinParty: (code: string, player: NewPlayerInput) => Promise<void>;
  setCurrentPlayer: (id: string) => void;
  refreshAll: () => Promise<void>;
  addRestaurant: (data: NewRestaurantInput) => Promise<Restaurant>;
  updateRestaurant: (id: string, data: Partial<Restaurant>) => Promise<void>;
  deleteRestaurant: (id: string) => Promise<void>;
  removeRestaurantFromPool: (id: string) => Promise<void>;
  toggleFavorite: (restaurantId: string) => Promise<void>;
  addReview: (data: NewReviewInput) => Promise<Review>;
  finalizeExperience: (restaurantId: string, reviews: Review[]) => Promise<void>;
  recordChampion: (playerId: string) => Promise<void>;
}

type AppContextValue = AppState & AppActions;

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

const CURRENT_PLAYER_KEY = 'lucky-bite-current-player';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    ready: false,
    currentPlayer: null,
    currentParty: null,
    players: [],
    restaurants: [],
    reviews: [],
    diary: [],
    scoringRules: DEFAULT_SCORING_RULES,
  });

  const loadAll = useCallback(async () => {
    const [players, restaurants, reviews, diary, parties, scoringRules] = await Promise.all([
      playerRepository.list(),
      restaurantRepository.list(),
      reviewRepository.listAll(),
      diaryRepository.list(),
      partyRepository.list(),
      scoringRuleRepository.list(),
    ]);

    // 首次启动：写入种子餐厅 + 默认积分规则
    if (restaurants.length === 0 && players.length === 0) {
      const now = new Date().toISOString();
      const seedPlayer: Player = {
        id: genId('p_'),
        nickname: '凌公主',
        avatar: '👧',
        joinedAt: now,
        points: 0,
        level: 1,
        badges: [],
        recommendCount: 0,
        experiencedCount: 0,
        championCount: 0,
        favoriteRestaurantIds: [],
      };
      await playerRepository.create(seedPlayer);
      for (const seed of SEED_RESTAURANTS) {
        await restaurantRepository.create({
          name: seed.name,
          branchName: seed.branchName,
          cuisine: seed.cuisine,
          district: seed.district,
          businessArea: seed.businessArea,
          address: seed.address,
          mapCoord: seed.mapCoord,
          businessHours: seed.businessHours,
          supportsLunch: seed.supportsLunch,
          supportsDinner: seed.supportsDinner,
          avgPrice: seed.avgPrice,
          officialRating: seed.officialRating,
          recommenderId: seedPlayer.id,
          recommendSource: seed.recommendSource,
          recommendReason: seed.recommendReason,
          tags: seed.tags,
          note: seed.note,
          inPool: seed.inPool,
          coverImage: seed.coverImage,
          photos: seed.photos,
        });
      }
      await scoringRuleRepository.ensureSeed();
      const refreshed = await Promise.all([
        playerRepository.list(),
        restaurantRepository.list(),
      ]);
      players.length = 0;
      players.push(...refreshed[0]);
      restaurants.length = 0;
      restaurants.push(...refreshed[1]);
    }

    const currentParty = parties[0] ?? null;
    const savedPlayerId =
      typeof window !== 'undefined'
        ? localStorage.getItem(CURRENT_PLAYER_KEY)
        : null;
    const currentPlayer =
      players.find((p) => p.id === savedPlayerId) ?? players[0] ?? null;

    setState({
      ready: true,
      currentPlayer,
      currentParty,
      players,
      restaurants,
      reviews,
      diary,
      scoringRules: scoringRules.length ? scoringRules : DEFAULT_SCORING_RULES,
    });
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // 注册 Service Worker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  const initParty = useCallback(
    async (partyName: string, owner: NewPlayerInput) => {
      const ownerPlayer = await playerRepository.create(owner);
      await partyRepository.create({ name: partyName, ownerId: ownerPlayer.id });
      localStorage.setItem(CURRENT_PLAYER_KEY, ownerPlayer.id);
      await loadAll();
    },
    [loadAll],
  );

  const joinParty = useCallback(
    async (code: string, player: NewPlayerInput) => {
      await partyRepository.joinByCode(code, player);
      await loadAll();
    },
    [loadAll],
  );

  const setCurrentPlayer = useCallback((id: string) => {
    const p = state.players.find((pl) => pl.id === id) ?? null;
    localStorage.setItem(CURRENT_PLAYER_KEY, id);
    setState((s) => ({ ...s, currentPlayer: p }));
  }, [state.players]);

  const refreshAll = useCallback(async () => {
    await loadAll();
  }, [loadAll]);

  const addRestaurant = useCallback(
    async (data: NewRestaurantInput): Promise<Restaurant> => {
      const r = await restaurantRepository.create(data);
      if (data.recommenderId) {
        await playerRepository.incrementRecommend(data.recommenderId);
      }
      setState((s) => ({ ...s, restaurants: [...s.restaurants, r] }));
      return r;
    },
    [],
  );

  const updateRestaurant = useCallback(
    async (id: string, data: Partial<Restaurant>) => {
      const updated = await restaurantRepository.update(id, data);
      setState((s) => ({
        ...s,
        restaurants: s.restaurants.map((r) => (r.id === id ? updated : r)),
      }));
    },
    [],
  );

  const deleteRestaurant = useCallback(async (id: string) => {
    await restaurantRepository.hardDelete(id);
    setState((s) => ({ ...s, restaurants: s.restaurants.filter((r) => r.id !== id) }));
  }, []);

  const removeRestaurantFromPool = useCallback(async (id: string) => {
    await restaurantRepository.softDelete(id);
    setState((s) => ({
      ...s,
      restaurants: s.restaurants.map((r) => (r.id === id ? { ...r, inPool: false } : r)),
    }));
  }, []);

  const toggleFavorite = useCallback(
    async (restaurantId: string) => {
      if (!state.currentPlayer) return;
      await playerRepository.toggleFavorite(state.currentPlayer.id, restaurantId);
      await loadAll();
    },
    [state.currentPlayer, loadAll],
  );

  const addReview = useCallback(async (data: NewReviewInput): Promise<Review> => {
    const review = await reviewRepository.create(data);
    setState((s) => ({ ...s, reviews: [...s.reviews, review] }));
    return review;
  }, []);

  const finalizeExperience = useCallback(
    async (restaurantId: string, reviews: Review[]) => {
      const restaurant = state.restaurants.find((r) => r.id === restaurantId);
      if (!restaurant) return;
      const finalRating = computeFinalRating(reviews);
      await restaurantRepository.update(restaurantId, {
        experienced: true,
        finalRating,
      });

      // 结算推荐人积分
      if (restaurant.recommenderId) {
        const points = computeRecommenderPoints(finalRating, state.scoringRules);
        await playerRepository.addPoints(restaurant.recommenderId, points);
      }

      // 写入美食日记
      await diaryRepository.createFromExperience(
        { ...restaurant, finalRating },
        reviews,
        restaurant.recommenderId,
      );

      await loadAll();
    },
    [state.restaurants, state.scoringRules, loadAll],
  );

  const recordChampion = useCallback(async (playerId: string) => {
    await playerRepository.recordChampion(playerId);
  }, []);

  const value: AppContextValue = {
    ...state,
    initParty,
    joinParty,
    setCurrentPlayer,
    refreshAll,
    addRestaurant,
    updateRestaurant,
    deleteRestaurant,
    removeRestaurantFromPool,
    toggleFavorite,
    addReview,
    finalizeExperience,
    recordChampion,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
