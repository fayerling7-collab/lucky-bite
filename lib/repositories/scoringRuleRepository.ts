import type { ScoringRule } from '@/types/scoring';
import { dbAll, dbPut } from '@/lib/storage/indexedDB';
import { DEFAULT_SCORING_RULES } from '@/data/scoringRules';

export interface ScoringRuleRepository {
  list(): Promise<ScoringRule[]>;
  save(rule: ScoringRule): Promise<void>;
  saveAll(rules: ScoringRule[]): Promise<void>;
  ensureSeed(): Promise<void>;
}

export const scoringRuleRepository: ScoringRuleRepository = {
  async list(): Promise<ScoringRule[]> {
    const all = await dbAll('scoringRules');
    if (all.length === 0) return DEFAULT_SCORING_RULES;
    return all;
  },

  async save(rule: ScoringRule): Promise<void> {
    await dbPut('scoringRules', rule);
  },

  async saveAll(rules: ScoringRule[]): Promise<void> {
    for (const r of rules) {
      await dbPut('scoringRules', r);
    }
  },

  async ensureSeed(): Promise<void> {
    const all = await dbAll('scoringRules');
    if (all.length === 0) {
      await scoringRuleRepository.saveAll(DEFAULT_SCORING_RULES);
    }
  },
};
