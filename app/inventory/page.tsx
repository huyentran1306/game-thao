"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/contexts/game-context";
import { HEROES_DATA, ELEMENT_CONFIG } from "@/lib/constants";
import type { Hero } from "@/types";
import BottomNav from "@/components/game/BottomNav";

const EQUIP_SLOTS = [
  { key: 'head', label: '⛑️', name: 'Mũ' },
  { key: 'body', label: '🧥', name: 'Giáp' },
  { key: 'weapon', label: '⚔️', name: 'Vũ Khí' },
  { key: 'shoes', label: '👟', name: 'Giày' },
  { key: 'ring', label: '💍', name: 'Nhẫn' },
  { key: 'charm', label: '🔮', name: 'Linh Bài' },
];

const INV_TABS = [
  { key: 'skills', label: 'Kỹ Năng', icon: '⚡', unlockLv: 1 },
  { key: 'equip', label: 'Trang Bị', icon: '🛡️', unlockLv: 10 },
  { key: 'sacred', label: 'Thánh Vật', icon: '🔮', unlockLv: 20 },
  { key: 'companion', label: 'Đồng Hành', icon: '🐉', unlockLv: 30 },
  { key: 'mining', label: 'Đào Khoáng', icon: '⛏️', unlockLv: 40 },
  { key: 'home', label: 'Gia Viên', icon: '🏯', unlockLv: 50 },
];

export default function InventoryPage() {
  const { state } = useGame();
  const [heroIdx, setHeroIdx] = useState(0);
  const [tab, setTab] = useState('skills');

  const unlockedHeroes = state.heroes.filter(h => h.isUnlocked);
  const selectedHero = unlockedHeroes[heroIdx] ?? null;

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg,#05080f 0%,#0a0820 100%)' }}>
      <div className="px-3 pt-4 pb-2">
        <h1 className="font-cinzel font-black text-lg text-[#ffd700] mb-3" style={{ textShadow: '0 0 10px rgba(255,215,0,0.4)' }}>
          🎒 HÀNH TRANG
        </h1>

        {/* Hero selector row */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-3">
          {unlockedHeroes.map((hero, i) => (
            <button
              key={hero.id}
              onClick={() => setHeroIdx(i)}
              className="flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
              style={{
                background: heroIdx === i ? ELEMENT_CONFIG[hero.element].color + '15' : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${heroIdx === i ? ELEMENT_CONFIG[hero.element].color + '50' : 'rgba(255,255,255,0.08)'}`,
                minWidth: 64,
              }}
            >
              <span className="text-2xl">{hero.emoji}</span>
              <span className="text-[9px] text-[#a0a8c0] truncate w-14 text-center">{hero.name}</span>
              <span className="text-[9px] font-bold" style={{ color: ELEMENT_CONFIG[hero.element].color }}>Lv.{hero.level}</span>
            </button>
          ))}
        </div>

        {/* Selected hero equipment grid */}
        {selectedHero && (
          <div className="glass-card p-3 mb-3" style={{ border: `1.5px solid ${ELEMENT_CONFIG[selectedHero.element].color}20` }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">{selectedHero.emoji}</span>
              <div>
                <div className="font-cinzel font-bold text-sm" style={{ color: ELEMENT_CONFIG[selectedHero.element].color }}>{selectedHero.name}</div>
                <div className="text-[10px] text-[#6b7a99]">Lv.{selectedHero.level} · ATK {selectedHero.atk} · DEF {selectedHero.def}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {EQUIP_SLOTS.map(slot => (
                <div
                  key={slot.key}
                  className="glass-card p-2 flex flex-col items-center gap-1"
                  style={{ border: '1px dashed rgba(255,255,255,0.1)' }}
                >
                  <span className="text-xl">{slot.label}</span>
                  <span className="text-[9px] text-[#6b7a99]">{slot.name}</span>
                  <span className="text-[9px] text-[#ff0066]/60">Trống</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {INV_TABS.map(t => {
            const locked = state.player.level < t.unlockLv;
            return (
              <button
                key={t.key}
                onClick={() => !locked && setTab(t.key)}
                className="flex-shrink-0 flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all"
                style={{
                  background: tab === t.key && !locked ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${tab === t.key && !locked ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  opacity: locked ? 0.4 : 1,
                }}
              >
                <span className="text-sm">{t.icon}</span>
                <span className="text-[9px]" style={{ color: tab === t.key && !locked ? '#ffd700' : '#6b7a99' }}>{t.label}</span>
                {locked && <span className="text-[8px] text-[#6b7a99]">Lv{t.unlockLv}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-3">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {tab === 'skills' && selectedHero && (
              <div className="space-y-2">
                {selectedHero.skills.map(skill => (
                  <div key={skill.id} className="glass-card p-3 flex items-start gap-3" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                    <span className="text-2xl flex-shrink-0">{skill.icon}</span>
                    <div>
                      <div className="font-bold text-xs text-[#f0e6c8] mb-0.5">{skill.name}</div>
                      <p className="text-[10px] text-[#6b7a99]">{skill.description}</p>
                      {(skill.damage ?? 0) > 0 && <p className="text-[10px] text-[#ff0066]/80 mt-0.5">Sát thương: x{skill.damage}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {tab !== 'skills' && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-5xl mb-3">{INV_TABS.find(t => t.key === tab)?.icon}</div>
                <div className="text-[#6b7a99] text-sm font-bold">{INV_TABS.find(t => t.key === tab)?.label}</div>
                <div className="text-[#6b7a99]/60 text-xs mt-1">Tính năng đang phát triển...</div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav active="inventory" />
    </div>
  );
}
