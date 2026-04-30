"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGame } from "@/contexts/game-context";
import { LEADERBOARD_DATA } from "@/lib/constants";
import type { LeaderboardEntry } from "@/types";
import BottomNav from "@/components/game/BottomNav";

type TabKey = 'power' | 'stages' | 'gacha';

const TABS: { key: TabKey; label: string; emoji: string; unit: string; color: string }[] = [
  { key: 'power',  label: 'Chiến Lực',   emoji: '⚔️',  unit: 'lực',  color: '#ff6600' },
  { key: 'stages', label: 'Ải Đã Qua',   emoji: '🗺️',  unit: 'ải',   color: '#4a9eff' },
  { key: 'gacha',  label: 'May Mắn',     emoji: '🍀',  unit: 'SSR',  color: '#ff6fff' },
];

const RANK_MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

function computePower(state: import('@/types').GameSave): number {
  const heroes = state.heroes.filter(h => h.isUnlocked);
  return heroes.reduce((sum, h) => sum + h.atk + h.def * 2 + Math.floor(h.maxHp / 10) + h.spd * 3, 0) * state.player.level;
}

function computeStages(state: import('@/types').GameSave): number {
  return Object.values(state.campaign).filter(v => v.stars > 0).length;
}

function computeGachaLuck(state: import('@/types').GameSave): number {
  return state.heroes.filter(h => h.isUnlocked && (h.rarity === 'KIM_CUONG' || h.rarity === 'CHI_TON')).length;
}

function LeaderboardRow({ entry, unit, color }: { entry: LeaderboardEntry; unit: string; color: string }) {
  const medal = RANK_MEDAL[entry.rank];
  return (
    <motion.div
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{
        background: entry.isPlayer ? `${color}10` : 'rgba(255,255,255,0.02)',
        border: entry.isPlayer ? `1.5px solid ${color}40` : '1px solid rgba(255,255,255,0.04)',
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: entry.rank * 0.05 }}
    >
      <div className="w-8 text-center font-cinzel font-black text-sm"
        style={{ color: medal ? undefined : '#6b7a99' }}>
        {medal ?? `#${entry.rank}`}
      </div>
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {entry.avatarEmoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold truncate" style={{ color: entry.isPlayer ? color : '#f0e6c8' }}>
          {entry.name} {entry.isPlayer && '(Bạn)'}
        </div>
      </div>
      <div className="text-right">
        <div className="font-cinzel font-black text-sm" style={{ color }}>
          {entry.value.toLocaleString()}
        </div>
        <div className="text-[10px] text-[#6b7a99]">{unit}</div>
      </div>
    </motion.div>
  );
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { state } = useGame();
  const [tab, setTab] = useState<TabKey>('power');

  const tabConf = TABS.find(t => t.key === tab)!;

  // Compute player's real value for current tab
  const playerValue = tab === 'power' ? computePower(state)
    : tab === 'stages' ? computeStages(state)
    : computeGachaLuck(state);

  const playerName = state.player.name;
  const playerEmoji = state.heroes.find(h => h.id === state.player.avatarHeroId)?.emoji ?? '👤';

  // Merge player into leaderboard
  const rawList = LEADERBOARD_DATA[tab];
  const playerEntry: LeaderboardEntry = {
    rank: 0, name: playerName, value: playerValue, avatarEmoji: playerEmoji, isPlayer: true,
  };

  let list: LeaderboardEntry[] = [...rawList];
  const insertIdx = list.findIndex(e => playerValue > e.value);
  if (insertIdx === -1) {
    playerEntry.rank = list.length + 1;
    list.push(playerEntry);
  } else {
    playerEntry.rank = insertIdx + 1;
    list = [...list.slice(0, insertIdx), playerEntry, ...list.slice(insertIdx).map(e => ({ ...e, rank: e.rank + 1 }))];
  }
  list = list.slice(0, 10);

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg,#05080f 0%,#030210 100%)' }}>
      <div className="px-3 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => router.push('/')} className="text-[#6b7a99]">◀</button>
          <h1 className="font-cinzel font-black text-lg text-[#ffd700]" style={{ textShadow: '0 0 10px rgba(255,215,0,0.4)' }}>
            🏆 BẢNG XẾP HẠNG
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 py-2 rounded-xl text-[11px] font-cinzel font-bold transition-all"
              style={{
                background: tab === t.key ? t.color + '15' : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${tab === t.key ? t.color + '50' : 'rgba(255,255,255,0.08)'}`,
                color: tab === t.key ? t.color : '#6b7a99',
              }}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Player summary */}
      <div className="mx-3 mb-4 px-4 py-3 rounded-2xl"
        style={{ background: `${tabConf.color}08`, border: `1px solid ${tabConf.color}30` }}>
        <div className="text-[11px] text-[#6b7a99] mb-0.5">Điểm của bạn</div>
        <div className="font-cinzel font-black text-2xl" style={{ color: tabConf.color }}>
          {playerValue.toLocaleString()} <span className="text-sm">{tabConf.unit}</span>
        </div>
      </div>

      {/* List */}
      <div className="px-3 space-y-2">
        {list.map((entry, i) => (
          <LeaderboardRow key={i} entry={entry} unit={tabConf.unit} color={tabConf.color} />
        ))}
      </div>

      <BottomNav active="leaderboard" />
    </div>
  );
}
