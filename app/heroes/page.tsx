"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGame } from "@/contexts/game-context";
import { HEROES_DATA, ELEMENT_CONFIG, CLASS_CONFIG } from "@/lib/constants";
import type { Hero, HeroRarity } from "@/types";
import BottomNav from "@/components/game/BottomNav";

const RARITY_LABEL: Record<HeroRarity, string> = { NORMAL: 'Thường', UPGRADED: 'Nâng Cấp', S: 'Tướng S' };
const RARITY_COLOR: Record<HeroRarity, string> = { NORMAL: '#6b7a99', UPGRADED: '#4a9eff', S: '#ffd700' };

function HeroCard({ hero, unlocked, onPress }: { hero: Hero; unlocked: boolean; onPress: () => void }) {
  return (
    <motion.div
      className="glass-card p-3 relative overflow-hidden cursor-pointer"
      style={{
        border: `1.5px solid ${unlocked ? ELEMENT_CONFIG[hero.element].color + '30' : 'rgba(255,255,255,0.06)'}`,
        opacity: unlocked ? 1 : 0.5,
      }}
      whileTap={{ scale: 0.96 }}
      onClick={onPress}
    >
      {/* Rarity glow */}
      {hero.rarity === 'S' && unlocked && (
        <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at top,${ELEMENT_CONFIG[hero.element].color},transparent 70%)` }} />
      )}

      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 relative"
          style={{
            background: unlocked
              ? `radial-gradient(circle,${ELEMENT_CONFIG[hero.element].color}20,rgba(10,14,26,0.9))`
              : 'rgba(10,14,26,0.6)',
            border: `2px solid ${unlocked ? ELEMENT_CONFIG[hero.element].color + '50' : 'rgba(255,255,255,0.06)'}`,
            boxShadow: unlocked ? `0 0 16px ${ELEMENT_CONFIG[hero.element].color}30` : 'none',
          }}
        >
          {unlocked ? hero.emoji : '🔒'}
          {hero.rarity === 'S' && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ffd700] flex items-center justify-center text-[9px] font-black text-black">S</div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-cinzel font-bold text-sm truncate" style={{ color: unlocked ? '#f0e6c8' : '#6b7a99' }}>
              {hero.name}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold el-wind" style={{ ...(ELEMENT_CONFIG[hero.element] ? { color: ELEMENT_CONFIG[hero.element].color, background: ELEMENT_CONFIG[hero.element].color + '15' } : {}) }}>
              {ELEMENT_CONFIG[hero.element].emoji} {ELEMENT_CONFIG[hero.element].label}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ color: CLASS_CONFIG[hero.heroClass].color, background: CLASS_CONFIG[hero.heroClass].color + '15' }}>
              {CLASS_CONFIG[hero.heroClass].emoji} {CLASS_CONFIG[hero.heroClass].label}
            </span>
          </div>
          {unlocked && (
            <div className="flex gap-3 mt-1.5 text-[10px] text-[#6b7a99]">
              <span>⚔️ {hero.atk}</span>
              <span>🛡️ {hero.def}</span>
              <span>❤️ {hero.maxHp}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-bold" style={{ color: RARITY_COLOR[hero.rarity] }}>
            {RARITY_LABEL[hero.rarity]}
          </span>
          {unlocked && <span className="text-[10px] text-[#6b7a99]">Lv.{hero.level}</span>}
        </div>
      </div>
    </motion.div>
  );
}

function HeroDetailSheet({ hero, unlocked, open, onClose }: { hero: Hero | null; unlocked: boolean; open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && hero && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/80" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-[400px] glass-card gold-border p-5 max-h-[80vh] overflow-y-auto"
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={{ type: 'spring', damping: 20 }}
          >
            {/* Hero header */}
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl" style={{ filter: `drop-shadow(0 0 15px ${ELEMENT_CONFIG[hero.element].color})` }}>
                {unlocked ? hero.emoji : '🔒'}
              </div>
              <div>
                <h3 className="font-cinzel font-black text-lg" style={{ color: ELEMENT_CONFIG[hero.element].color }}>{hero.name}</h3>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] font-bold" style={{ color: ELEMENT_CONFIG[hero.element].color }}>{ELEMENT_CONFIG[hero.element].emoji} {ELEMENT_CONFIG[hero.element].label}</span>
                  <span className="text-[10px] font-bold" style={{ color: CLASS_CONFIG[hero.heroClass].color }}>{CLASS_CONFIG[hero.heroClass].label}</span>
                  <span className="text-[10px] font-bold" style={{ color: RARITY_COLOR[hero.rarity] }}>{RARITY_LABEL[hero.rarity]}</span>
                </div>
              </div>
            </div>

            {hero.lore && (
              <p className="text-[11px] text-[#6b7a99] italic mb-4 leading-relaxed border-l-2 border-[rgba(255,215,0,0.2)] pl-3">{hero.lore}</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { label: 'HP', value: hero.maxHp, icon: '❤️', color: '#39ff14' },
                { label: 'ATK', value: hero.atk, icon: '⚔️', color: '#ff0066' },
                { label: 'DEF', value: hero.def, icon: '🛡️', color: '#4a9eff' },
                { label: 'SPD', value: hero.spd, icon: '⚡', color: '#ffe333' },
              ].map(stat => (
                <div key={stat.label} className="glass-card p-2.5 flex items-center gap-2" style={{ border: `1px solid ${stat.color}20` }}>
                  <span className="text-base">{stat.icon}</span>
                  <div>
                    <div className="text-[9px] text-[#6b7a99]">{stat.label}</div>
                    <div className="text-sm font-bold" style={{ color: stat.color }}>{stat.value.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <h4 className="font-cinzel text-[#ffd700] text-xs font-bold mb-2 tracking-wider">KỸ NĂNG</h4>
            <div className="space-y-2">
              {hero.skills.map(skill => (
                <div key={skill.id} className="glass-card p-3 flex items-start gap-3" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-2xl flex-shrink-0">{skill.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-xs text-[#f0e6c8]">{skill.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded" style={{
                        color: skill.type === 'ATTACK' ? '#ff0066' : skill.type === 'DEFENSE' ? '#4a9eff' : '#39ff14',
                        background: skill.type === 'ATTACK' ? '#ff006615' : skill.type === 'DEFENSE' ? '#4a9eff15' : '#39ff1415',
                      }}>
                        {skill.type === 'ATTACK' ? 'Tấn Công' : skill.type === 'DEFENSE' ? 'Phòng Thủ' : 'Hỗ Trợ'}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#6b7a99]">{skill.description}</p>
                    {skill.cooldown > 0 && <p className="text-[10px] text-[#ffd700]/60 mt-0.5">CD: {skill.cooldown}s</p>}
                  </div>
                </div>
              ))}
            </div>

            {!unlocked && (
              <div className="mt-4 text-center text-[#6b7a99] text-xs">🔒 Hoàn thành hầm ngục hoặc thu thập mảnh tướng để mở khóa</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function HeroesPage() {
  const { state } = useGame();
  const [tab, setTab] = useState<HeroRarity>('NORMAL');
  const [selected, setSelected] = useState<Hero | null>(null);
  const router = useRouter();

  const tabs: { key: HeroRarity; label: string; color: string }[] = [
    { key: 'NORMAL', label: 'Tướng Thường', color: '#6b7a99' },
    { key: 'UPGRADED', label: 'Nâng Cấp', color: '#4a9eff' },
    { key: 'S', label: '⭐ Tướng S', color: '#ffd700' },
  ];

  const filtered = state.heroes.filter(h => h.rarity === tab);

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg,#05080f 0%,#0a0820 100%)' }}>
      <div className="px-3 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => router.push('/')} className="text-[#6b7a99]">◀</button>
          <h1 className="font-cinzel font-black text-lg text-[#ffd700]" style={{ textShadow: '0 0 10px rgba(255,215,0,0.4)' }}>
            👑 MỞ TƯỚNG
          </h1>
          <div className="ml-auto text-xs text-[#6b7a99]">
            {state.heroes.filter(h => h.isUnlocked).length}/{state.heroes.length} tướng
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 py-2 rounded-xl text-[11px] font-cinzel font-bold transition-all"
              style={{
                background: tab === t.key ? t.color + '15' : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${tab === t.key ? t.color + '40' : 'rgba(255,255,255,0.08)'}`,
                color: tab === t.key ? t.color : '#6b7a99',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-3 space-y-2">
        {filtered.map(hero => (
          <HeroCard
            key={hero.id}
            hero={hero}
            unlocked={hero.isUnlocked}
            onPress={() => setSelected(hero)}
          />
        ))}
      </div>

      <BottomNav active="heroes" />
      <HeroDetailSheet
        hero={selected}
        unlocked={selected?.isUnlocked ?? false}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
