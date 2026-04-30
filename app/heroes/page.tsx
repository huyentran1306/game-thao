"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGame } from "@/contexts/game-context";
import { RARITY_CONFIG, ELEMENT_CONFIG, CLASS_CONFIG, ATTACK_TYPE_CONFIG, SUB_STAT_POOL, SUB_STAT_RARITY_COLOR, STAR_UPGRADE_COST } from "@/lib/constants";
import type { Hero, HeroRarity, StarLevel } from "@/types";
import BottomNav from "@/components/game/BottomNav";

const RARITY_TABS: { key: HeroRarity; }[] = [
  { key: 'DONG' }, { key: 'BAC' }, { key: 'VANG' }, { key: 'KIM_CUONG' }, { key: 'CHI_TON' },
];

function StarRow({ stars, max = 6 }: { stars: StarLevel; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className="text-[10px]" style={{ opacity: i < stars ? 1 : 0.2 }}>⭐</span>
      ))}
    </div>
  );
}

function HeroCard({ hero, unlocked, onPress }: { hero: Hero; unlocked: boolean; onPress: () => void }) {
  const rarity = RARITY_CONFIG[hero.rarity];
  const elem = ELEMENT_CONFIG[hero.element];
  return (
    <motion.div
      className="glass-card p-3 relative overflow-hidden cursor-pointer"
      style={{
        border: `1.5px solid ${unlocked ? rarity.color + '35' : 'rgba(255,255,255,0.06)'}`,
        opacity: unlocked ? 1 : 0.55,
      }}
      whileTap={{ scale: 0.96 }}
      onClick={onPress}
    >
      {unlocked && (
        <div className="absolute inset-0 opacity-5"
          style={{ background: `radial-gradient(circle at top left, ${rarity.color}, transparent 60%)` }} />
      )}

      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 relative"
          style={{
            background: unlocked ? `radial-gradient(circle,${elem.color}20,rgba(10,14,26,0.9))` : 'rgba(10,14,26,0.6)',
            border: `2px solid ${unlocked ? rarity.color + '50' : 'rgba(255,255,255,0.06)'}`,
            boxShadow: unlocked ? `0 0 16px ${rarity.color}30` : 'none',
          }}>
          {unlocked ? hero.emoji : '🔒'}
          {/* Rarity badge */}
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black"
            style={{ background: rarity.color, color: '#000', fontSize: '10px' }}>
            {rarity.emoji}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-cinzel font-bold text-sm truncate" style={{ color: unlocked ? '#f0e6c8' : '#6b7a99' }}>
              {hero.name}
            </span>
          </div>
          {unlocked && <StarRow stars={hero.stars} />}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
              style={{ color: elem.color, background: elem.color + '15' }}>
              {elem.emoji} {elem.label}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
              style={{ color: CLASS_CONFIG[hero.heroClass].color, background: CLASS_CONFIG[hero.heroClass].color + '15' }}>
              {CLASS_CONFIG[hero.heroClass].emoji} {CLASS_CONFIG[hero.heroClass].label}
            </span>
            <span className="text-[10px] px-1 py-0.5 rounded font-bold"
              style={{ color: ATTACK_TYPE_CONFIG[hero.attackType].color, background: ATTACK_TYPE_CONFIG[hero.attackType].color + '12' }}>
              {ATTACK_TYPE_CONFIG[hero.attackType].emoji}
            </span>
          </div>
          {unlocked && (
            <div className="flex gap-3 mt-1 text-[10px] text-[#6b7a99]">
              <span>⚔️ {hero.atk}</span>
              <span>🛡️ {hero.def}</span>
              <span>❤️ {hero.maxHp}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-bold" style={{ color: rarity.color }}>{rarity.label}</span>
          {unlocked && <span className="text-[10px] text-[#6b7a99]">Lv.{hero.level}</span>}
          {!unlocked && (
            <span className="text-[9px] px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#4a5568' }}>Khóa</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function HeroDetailSheet({ hero, open, onClose }: { hero: Hero | null; open: boolean; onClose: () => void }) {
  const { state, upgradeHeroStars } = useGame();
  if (!hero) return null;
  const unlocked = hero.isUnlocked;
  const rarity = RARITY_CONFIG[hero.rarity];
  const elem = ELEMENT_CONFIG[hero.element];
  const nextStar = hero.stars < 6 ? (hero.stars + 1) as StarLevel : null;
  const upgradeCost = nextStar ? STAR_UPGRADE_COST[nextStar] : 0;
  const canUpgrade = unlocked && nextStar !== null && state.player.gold >= upgradeCost;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/80" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-[400px] glass-card p-5 max-h-[85vh] overflow-y-auto"
            style={{ border: `2px solid ${rarity.color}40` }}
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={{ type: 'spring', damping: 20 }}
          >
            {/* Hero header */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
                style={{
                  background: `radial-gradient(circle,${elem.color}25,rgba(5,8,15,0.9))`,
                  border: `2px solid ${rarity.color}50`,
                  boxShadow: `0 0 20px ${rarity.color}30`,
                  filter: unlocked ? undefined : 'grayscale(1)',
                }}>
                {unlocked ? hero.emoji : '🔒'}
              </div>
              <div className="flex-1">
                <h3 className="font-cinzel font-black text-lg" style={{ color: rarity.color }}>{hero.name}</h3>
                <StarRow stars={hero.stars} />
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  <span className="text-[10px] font-bold" style={{ color: elem.color }}>{elem.emoji} {elem.label}</span>
                  <span className="text-[10px] font-bold" style={{ color: CLASS_CONFIG[hero.heroClass].color }}>{CLASS_CONFIG[hero.heroClass].label}</span>
                  <span className="text-[10px] font-bold" style={{ color: rarity.color }}>{rarity.emoji} {rarity.label}</span>
                  <span className="text-[10px] font-bold" style={{ color: ATTACK_TYPE_CONFIG[hero.attackType].color }}>
                    {ATTACK_TYPE_CONFIG[hero.attackType].emoji} {ATTACK_TYPE_CONFIG[hero.attackType].label}
                  </span>
                </div>
              </div>
            </div>

            {hero.lore && (
              <p className="text-[11px] text-[#6b7a99] italic mb-4 leading-relaxed border-l-2 pl-3"
                style={{ borderColor: rarity.color + '40' }}>{hero.lore}</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { label: 'HP', value: hero.maxHp, icon: '❤️', color: '#39ff14' },
                { label: 'ATK', value: hero.atk, icon: '⚔️', color: '#ff0066' },
                { label: 'DEF', value: hero.def, icon: '🛡️', color: '#4a9eff' },
                { label: 'SPD', value: hero.spd, icon: '⚡', color: '#ffe333' },
              ].map(stat => (
                <div key={stat.label} className="glass-card p-2.5 flex items-center gap-2"
                  style={{ border: `1px solid ${stat.color}20` }}>
                  <span className="text-base">{stat.icon}</span>
                  <div>
                    <div className="text-[9px] text-[#6b7a99]">{stat.label}</div>
                    <div className="text-sm font-bold" style={{ color: stat.color }}>{stat.value.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sub-stats */}
            {unlocked && hero.subStats.length > 0 && (
              <div className="mb-4">
                <h4 className="font-cinzel text-[11px] font-bold mb-2 tracking-wider" style={{ color: '#ff6fff' }}>
                  ✨ THUỘC TÍNH ĐẶC BIỆT
                </h4>
                <div className="space-y-1.5">
                  {hero.subStats.map((s, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${SUB_STAT_RARITY_COLOR[s.rarity]}25` }}>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{SUB_STAT_POOL[s.key].emoji}</span>
                        <div>
                          <div className="text-[11px] font-bold" style={{ color: SUB_STAT_RARITY_COLOR[s.rarity] }}>
                            {SUB_STAT_POOL[s.key].label}
                          </div>
                          <div className="text-[9px]" style={{ color: SUB_STAT_RARITY_COLOR[s.rarity] }}>
                            {s.rarity === 'epic' ? 'Sử Thi' : s.rarity === 'rare' ? 'Hiếm' : 'Thường'}
                          </div>
                        </div>
                      </div>
                      <span className="font-black text-sm" style={{ color: SUB_STAT_RARITY_COLOR[s.rarity] }}>
                        +{s.value}{SUB_STAT_POOL[s.key].unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Star upgrade */}
            {unlocked && nextStar && (
              <div className="mb-4 glass-card p-3"
                style={{ border: `1px solid ${rarity.color}30`, background: rarity.color + '05' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-cinzel font-bold text-xs" style={{ color: rarity.color }}>
                    NÂNG SAO → {nextStar}⭐
                  </span>
                  <span className="text-xs text-[#ffd700]">🪙 {upgradeCost.toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-[#6b7a99] mb-2">
                  Hệ số tăng: ×{RARITY_CONFIG[hero.rarity].starMultiplier[nextStar - 1]}
                  • Nhận thêm 1 thuộc tính đặc biệt
                </div>
                <button
                  onClick={() => upgradeHeroStars(hero.id)}
                  disabled={!canUpgrade}
                  className="w-full py-2 rounded-xl font-bold text-sm transition-all"
                  style={{
                    background: canUpgrade ? rarity.color + '20' : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${canUpgrade ? rarity.color + '60' : 'rgba(255,255,255,0.08)'}`,
                    color: canUpgrade ? rarity.color : '#4a5568',
                  }}>
                  {canUpgrade ? '✨ NÂNG SAO' : `Cần ${upgradeCost.toLocaleString()} 🪙`}
                </button>
              </div>
            )}
            {unlocked && hero.stars >= 6 && (
              <div className="mb-4 text-center text-xs font-bold text-[#ffd700]">
                ⭐⭐⭐⭐⭐⭐ ĐÃ ĐẠT TỐI ĐA!
              </div>
            )}

            {/* Skills */}
            <h4 className="font-cinzel text-[#ffd700] text-xs font-bold mb-2 tracking-wider">KỸ NĂNG</h4>
            <div className="space-y-2">
              {hero.skills.map(skill => (
                <div key={skill.id} className="glass-card p-3 flex items-start gap-3"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
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
              <div className="mt-4 text-center text-[#6b7a99] text-xs">
                🎲 Mở khóa qua Triệu Hồi hoặc hoàn thành hầm ngục
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function HeroesPage() {
  const { state } = useGame();
  const [tab, setTab] = useState<HeroRarity>('DONG');
  const [selected, setSelected] = useState<Hero | null>(null);
  const router = useRouter();

  const filtered = state.heroes.filter(h => h.rarity === tab);
  const unlockedCount = state.heroes.filter(h => h.isUnlocked).length;

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg,#05080f 0%,#0a0820 100%)' }}>
      <div className="px-3 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => router.push('/')} className="text-[#6b7a99]">◀</button>
          <h1 className="font-cinzel font-black text-lg text-[#ffd700]" style={{ textShadow: '0 0 10px rgba(255,215,0,0.4)' }}>
            👑 TƯỚNG SĨ
          </h1>
          <div className="ml-auto text-xs text-[#6b7a99]">
            {unlockedCount}/{state.heroes.length}
          </div>
        </div>

        {/* Rarity Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {RARITY_TABS.map(t => {
            const conf = RARITY_CONFIG[t.key];
            const isActive = tab === t.key;
            const count = state.heroes.filter(h => h.rarity === t.key).length;
            const ownedCount = state.heroes.filter(h => h.rarity === t.key && h.isUnlocked).length;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-[10px] font-cinzel font-bold transition-all"
                style={{
                  background: isActive ? conf.color + '18' : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${isActive ? conf.color + '50' : 'rgba(255,255,255,0.08)'}`,
                  color: isActive ? conf.color : '#6b7a99',
                }}
              >
                <span className="text-lg">{conf.emoji}</span>
                <span>{conf.label}</span>
                <span className="text-[9px] mt-0.5" style={{ color: isActive ? conf.color + 'aa' : '#4a5568' }}>
                  {ownedCount}/{count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-3 space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-8 text-[#6b7a99] text-sm">
            Chưa có tướng cấp {RARITY_CONFIG[tab].label}
          </div>
        )}
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
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
