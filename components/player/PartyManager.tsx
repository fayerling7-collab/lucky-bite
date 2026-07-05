'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Users, Plus, LogIn } from 'lucide-react';
import { useApp } from '@/lib/appStore';
import { Button } from '@/components/ui/button';
import { PlayerCard } from './PlayerCard';
import { AvatarPicker } from './AvatarPicker';
import type { FoodParty, Player } from '@/types';

interface PartyManagerProps {
  party: FoodParty | null;
  players: Player[];
  currentPlayer: Player | null;
  onSetCurrent: (id: string) => void;
}

export function PartyManager({
  party,
  players,
  currentPlayer,
  onSetCurrent,
}: PartyManagerProps) {
  const { initParty, joinParty } = useApp();
  const [copied, setCopied] = useState(false);

  // 创建表单
  const [partyName, setPartyName] = useState('');
  const [createNickname, setCreateNickname] = useState('');
  const [createAvatar, setCreateAvatar] = useState('👧');

  // 加入表单
  const [inviteCode, setInviteCode] = useState('');
  const [joinNickname, setJoinNickname] = useState('');
  const [joinAvatar, setJoinAvatar] = useState('👩');

  const handleCopy = () => {
    if (!party) return;
    navigator.clipboard?.writeText(party.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCreate = async () => {
    if (!partyName.trim() || !createNickname.trim()) return;
    await initParty(partyName.trim(), {
      nickname: createNickname.trim(),
      avatar: createAvatar,
    });
  };

  const handleJoin = async () => {
    if (!inviteCode.trim() || !joinNickname.trim()) return;
    await joinParty(inviteCode.trim(), {
      nickname: joinNickname.trim(),
      avatar: joinAvatar,
    });
  };

  // 已有小队
  if (party) {
    const members = players.filter((p) => party.memberIds.includes(p.id));
    return (
      <div className="flex flex-col gap-4">
        {/* 小队信息 */}
        <div className="rounded-3xl border-2 border-white/70 bg-gradient-to-br from-sky-soft/40 to-lavender/40 p-5 shadow-soft backdrop-blur">
          <div className="flex items-center gap-2 text-slate-500">
            <Users className="h-4 w-4" />
            <span className="text-xs font-bold">当前小队</span>
          </div>
          <h2 className="mt-1 font-display text-2xl font-extrabold text-slate-700">
            {party.name}
          </h2>

          {/* 邀请码 */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 rounded-2xl bg-white/70 p-3">
              <p className="text-xs text-slate-400">邀请码</p>
              <p className="font-display text-xl font-extrabold tracking-[0.3em] text-sky-deep">
                {party.inviteCode}
              </p>
            </div>
            <Button variant="primary" size="icon" onClick={handleCopy}>
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* 成员列表 */}
        <div>
          <p className="mb-2 text-xs font-bold text-slate-500">
            小队成员（{members.length}）· 点击切换当前玩家
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {members.map((p) => (
              <PlayerCard
                key={p.id}
                player={p}
                selected={currentPlayer?.id === p.id}
                onClick={() => onSetCurrent(p.id)}
                compact
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 未有小队：创建 / 加入表单
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* 创建小队 */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-3xl border-2 border-white/70 bg-gradient-to-br from-blush/50 to-coral/30 p-5 shadow-soft backdrop-blur"
      >
        <div className="mb-3 flex items-center gap-2">
          <Plus className="h-5 w-5 text-coral" />
          <h3 className="font-display text-lg font-bold text-slate-700">创建新小队</h3>
        </div>
        <div className="flex flex-col gap-3">
          <input
            value={partyName}
            onChange={(e) => setPartyName(e.target.value)}
            placeholder="小队名称"
            className="rounded-2xl border-2 border-white/70 bg-white/70 px-4 py-2 text-sm outline-none focus:border-sky-soft"
          />
          <input
            value={createNickname}
            onChange={(e) => setCreateNickname(e.target.value)}
            placeholder="你的昵称"
            className="rounded-2xl border-2 border-white/70 bg-white/70 px-4 py-2 text-sm outline-none focus:border-sky-soft"
          />
          <div>
            <p className="mb-1.5 text-xs text-slate-500">选择头像</p>
            <AvatarPicker value={createAvatar} onChange={setCreateAvatar} />
          </div>
          <Button
            variant="pink"
            onClick={handleCreate}
            disabled={!partyName.trim() || !createNickname.trim()}
          >
            <Plus className="h-4 w-4" /> 创建
          </Button>
        </div>
      </motion.div>

      {/* 加入小队 */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-3xl border-2 border-white/70 bg-gradient-to-br from-mint/50 to-sky-soft/30 p-5 shadow-soft backdrop-blur"
      >
        <div className="mb-3 flex items-center gap-2">
          <LogIn className="h-5 w-5 text-emerald-600" />
          <h3 className="font-display text-lg font-bold text-slate-700">加入小队</h3>
        </div>
        <div className="flex flex-col gap-3">
          <input
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="邀请码"
            className="rounded-2xl border-2 border-white/70 bg-white/70 px-4 py-2 text-sm outline-none focus:border-sky-soft"
          />
          <input
            value={joinNickname}
            onChange={(e) => setJoinNickname(e.target.value)}
            placeholder="你的昵称"
            className="rounded-2xl border-2 border-white/70 bg-white/70 px-4 py-2 text-sm outline-none focus:border-sky-soft"
          />
          <div>
            <p className="mb-1.5 text-xs text-slate-500">选择头像</p>
            <AvatarPicker value={joinAvatar} onChange={setJoinAvatar} />
          </div>
          <Button
            variant="mint"
            onClick={handleJoin}
            disabled={!inviteCode.trim() || !joinNickname.trim()}
          >
            <LogIn className="h-4 w-4" /> 加入
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
