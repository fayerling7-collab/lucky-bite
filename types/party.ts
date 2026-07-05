// Food Party 小队相关类型定义

export interface FoodParty {
  id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
  memberIds: string[];
  createdAt: string;
}

export interface NewPartyInput {
  name: string;
  ownerId: string;
}
