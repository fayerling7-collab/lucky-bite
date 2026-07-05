import type { FoodParty, NewPartyInput } from '@/types/party';
import type { NewPlayerInput } from '@/types/player';
import { dbAll, dbPut, dbGet, dbGetByIndex } from '@/lib/storage/indexedDB';
import { genId } from '@/lib/utils';
import { playerRepository } from './playerRepository';

export interface PartyRepository {
  list(): Promise<FoodParty[]>;
  getCurrent(): Promise<FoodParty | null>;
  getById(id: string): Promise<FoodParty | null>;
  create(data: NewPartyInput): Promise<FoodParty>;
  joinByCode(code: string, player: NewPlayerInput): Promise<{ party: FoodParty; player: import('@/types/player').Player }>;
  addMember(partyId: string, playerId: string): Promise<void>;
  getByCode(code: string): Promise<FoodParty | null>;
}

function genInviteCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export const partyRepository: PartyRepository = {
  async list(): Promise<FoodParty[]> {
    return dbAll('parties');
  },

  async getCurrent(): Promise<FoodParty | null> {
    const all = await dbAll('parties');
    return all[0] ?? null;
  },

  async getById(id: string): Promise<FoodParty | null> {
    const p = await dbGet('parties', id);
    return p ?? null;
  },

  async create(data: NewPartyInput): Promise<FoodParty> {
    const party: FoodParty = {
      id: genId('party_'),
      name: data.name,
      inviteCode: genInviteCode(),
      ownerId: data.ownerId,
      memberIds: [data.ownerId],
      createdAt: new Date().toISOString(),
    };
    await dbPut('parties', party);
    return party;
  },

  async joinByCode(code: string, playerInput: NewPlayerInput) {
    const parties = await dbGetByIndex('parties', 'by-code', code.toUpperCase());
    const party = parties[0];
    if (!party) throw new Error('邀请码无效');
    const player = await playerRepository.create(playerInput);
    player.partyId = party.id;
    await playerRepository.update(player.id, { partyId: party.id });
    party.memberIds.push(player.id);
    await dbPut('parties', party);
    return { party, player };
  },

  async addMember(partyId: string, playerId: string): Promise<void> {
    const p = await dbGet('parties', partyId);
    if (!p) return;
    if (!p.memberIds.includes(playerId)) {
      p.memberIds.push(playerId);
      await dbPut('parties', p);
    }
  },

  async getByCode(code: string): Promise<FoodParty | null> {
    const parties = await dbGetByIndex('parties', 'by-code', code.toUpperCase());
    return parties[0] ?? null;
  },
};
