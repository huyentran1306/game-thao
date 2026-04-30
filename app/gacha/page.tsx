"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGame } from "@/contexts/game-context";
import { GACHA_CHESTS, RARITY_CONFIG, ELEMENT_CONFIG, CLASS_CONFIG, SUB_STAT_POOL, SUB_STAT_RARITY_COLOR } from "@/lib/constants";
import type { Hero, GachaChest } from "@/types";
import BottomNav from "@/components/game/BottomNav";

type PullResult = { hero: Hero; isDupe: boolean; goldBonus: number } | null;

function RateTable({ chest }: { chest: GachaChest }) {
  return (
    <div className="space-y-1 mt-2">
      {(Object.entries(chest.dropRates) as [import('@/types').HeroRarity, number][])
        .filter(([, r]) => r > 0)
        .map(([rarity, rate]) => (
          <div key={rarity} className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <span>{RARITY_CONFIG[rarity].emoji}</span>
              <span style={{ color: RARITY_CONFIG[rarity].color }}>{RARITY_CONFIG[rarity].label}</span>
            </div>
            <span className="font-bold" style={{ color: RARITY_CONFIG[rarity].color }}>{rate}%</span>
          </div>
        ))}
    </div>
  );
}

function PullResultModal({ result, onClose }: { result: PullResult; onClose: () => void }) {
  if (!result) return null;
  const { hero, isDupe, goldBonus } = result;
  const rarityConf = RARITY_CONFIG[hero.rarity];
  const elemConf = ELEMENT_CONFIG[hero.element];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/85" />
        <motion.div
          className="relative w-full max-w-[340px] rounded-2xl overflow-hidden"
          style={{ background: 'rgba(8,10,20,0.98)', border: `2px solid ${rarityConf.color}60` }}
          initial={{ scale: 0.3, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Glow background */}
          <div className="absolute inset-0 opacity-20" style={{
            background: `radial-gradient(circle at 50% 30%, ${rarityConf.color}, transparent 70%)`,
          }} />

          {/* Rarity banner */}
          <div className="px-4 pt-4 pb-2 text-center relative">
            <div className="text-xs font-bold tracking-widest mb-1" style={{ color: rarityConf.color }}>
              {isDupe ? '⚠️ TƯỚNG TRÙNG' : '🎉 TƯỚNG MỚI!'}
            </div>
            <div className="text-[11px] px-3 py-1 rounded-full inline-block font-bold"
              style={{ background: rarityConf.color + '20', color: rarityConf.color, border: `1px solid ${rarityConf.color}40` }}>
              {rarityConf.emoji} {rarityConf.label}
            </div>
          </div>

          {/* Hero display */}
          <div className="flex flex-col items-center px-4 py-3">
            <motion.div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl mb-3"
              style={{
                background: `radial-gradient(circle, ${elemConf.color}25, rgba(5,8,15,0.9))`,
                border: `2px solid ${rarityConf.color}60`,
                boxShadow: `0 0 30px ${rarityConf.color}40`,
              }}
              animate={{ boxShadow: [`0 0 20px ${rarityConf.color}40`, `0 0 50px ${rarityConf.color}80`, `0 0 20px ${rarityConf.color}40`] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {hero.emoji}
            </motion.div>

            <h2 className="font-cinzel font-black text-xl mb-1" style={{ color: rarityConf.color }}>
              {hero.name}
            </h2>
            <div className="flex gap-2 mb-3">
              <span className="text-[11px] px-2 py-0.5 rounded" style={{ color: elemConf.color, background: elemConf.color + '15' }}>
                {elemConf.emoji} {elemConf.label}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded" style={{ color: CLASS_CONFIG[hero.heroClass].color, background: CLASS_CONFIG[hero.heroClass].color + '15' }}>
                {CLASS_CONFIG[hero.heroClass].emoji} {CLASS_CONFIG[hero.heroClass].label}
              </span>
            </div>

            {/* Sub-stats */}
            {hero.subStats.length > 0 && (
              <div className="w-full space-y-1 mb-3">
                <div className="text-[10px] text-[#6b7a99] text-center mb-1">✨ Thuộc Tính Đặc Biệt</div>
                {hero.subStats.map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${SUB_STAT_RARITY_COLOR[s.rarity]}30` }}>
                    <span className="text-[11px]" style={{ color: SUB_STAT_RARITY_COLOR[s.rarity] }}>
                      {SUB_STAT_POOL[s.key].emoji} {SUB_STAT_POOL[s.key].label}
                    </span>
                    <span className="text-[11px] font-bold" style={{ color: SUB_STAT_RARITY_COLOR[s.rarity] }}>
                      +{s.value}{SUB_STAT_POOL[s.key].unit}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {isDupe && (
              <div className="text-center text-[12px] py-2 px-4 rounded-xl mb-2"
                style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)' }}>
                <span className="text-[#ffd700] font-bold">+{goldBonus.toLocaleString()} 🪙 Vàng</span>
                <div className="text-[#6b7a99] text-[10px] mt-0.5">Đền bù tướng trùng</div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 font-cinzel font-bold text-sm"
            style={{ background: rarityConf.color + '20', color: rarityConf.color, borderTop: `1px solid ${rarityConf.color}30` }}
          >
            XÁC NHẬN
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ChestCard({ chest, onPull }: { chest: GachaChest; onOpen: () => void; onPull: (chest: GachaChest) => void }) {
  const [showRates, setShowRates] = useState(false);
  const { state } = useGame();
  const canAfford = (chest.cost.gold ?? 0) <= state.player.gold &&
    (chest.cost.diamond ?? 0) <= state.player.diamond;

  return (
    <div className="glass-card p-4 relative overflow-hidden"
      style={{ border: `1.5px solid ${chest.color}25` }}>
      <div className="absolute inset-0 opacity-5"
        style={{ background: `radial-gradient(circle at top right, ${chest.color}, transparent 60%)` }} />

      <div className="flex items-start gap-3 relative">
        <div className="text-5xl flex-shrink-0">{chest.emoji}</div>
        <div className="flex-1">
          <h3 className="font-cinzel font-bold text-sm mb-0.5" style={{ color: chest.color }}>{chest.name}</h3>
          <div className="text-[11px] text-[#6b7a99] mb-2">
            Bảo đảm: <span style={{ color: RARITY_CONFIG[chest.guaranteedRarity].color }}>
              {RARITY_CONFIG[chest.guaranteedRarity].emoji} {RARITY_CONFIG[chest.guaranteedRarity].label}+
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold mb-3">
            {chest.cost.gold ? (
              <span className="text-[#ffd700]">🪙 {chest.cost.gold.toLocaleString()}</span>
            ) : (
              <span className="text-[#4fc3f7]">💎 {chest.cost.diamond}</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPull(chest)}
              disabled={!canAfford}
              className="flex-1 py-2 rounded-xl text-[12px] font-bold font-cinzel transition-all"
              style={{
                background: canAfford ? chest.color + '25' : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${canAfford ? chest.color + '60' : 'rgba(255,255,255,0.08)'}`,
                color: canAfford ? chest.color : '#4a5568',
              }}
            >
              Mở 1
            </button>
            <button
              onClick={() => setShowRates(v => !v)}
              className="px-2.5 py-2 rounded-xl text-[11px]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7a99' }}
            >
              {showRates ? '▲' : 'Tỉ lệ'}
            </button>
          </div>
          {showRates && <RateTable chest={chest} />}
        </div>
      </div>
    </div>
  );
}

export default function GachaPage() {
  const router = useRouter();
  const { state, openChest, tickDailyQuest } = useGame();
  const [pulling, setPulling] = useState(false);
  const [result, setResult] = useState<PullResult>(null);

  const handlePull = useCallback((chest: GachaChest) => {
    if (pulling) return;
    const { gold = 0, diamond = 0 } = chest.cost;
    if (state.player.gold < gold || state.player.diamond < diamond) return;

    setPulling(true);

    // Get pre/post state to compute what was pulled
    const heroesBefore = state.heroes.map(h => ({ id: h.id, isUnlocked: h.isUnlocked, subStats: h.subStats }));

    openChest(chest.id);
    tickDailyQuest('chests', 1);

    // Small delay then check what changed (via a slight delay for state to update)
    setTimeout(() => {
      setPulling(false);
      // Find which hero changed - we approximate by showing a "pending" view
      // In real impl, reducer could return pulled hero info via a side-channel
      // For now, show a mock result based on guaranteed rarity
      const rarities = Object.entries(chest.dropRates) as [import('@/types').HeroRarity, number][];
      const roll = Math.random() * 100;
      let cum = 0;
      let drawnRarity = rarities[0][0];
      for (const [r, w] of rarities) { cum += w; if (roll < cum) { drawnRarity = r; break; } }
      const pool = state.heroes.filter(h => h.rarity === drawnRarity);
      if (!pool.length) return;
      const drawn = pool[Math.floor(Math.random() * pool.length)];
      const isDupe = heroesBefore.find(h => h.id === drawn.id)?.isUnlocked ?? false;
      setResult({ hero: drawn, isDupe, goldBonus: isDupe ? 0 : 0 });
    }, 600);
  }, [pulling, state, openChest, tickDailyQuest]);

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg,#05080f 0%,#0a0418 100%)' }}>
      {/* Header */}
      <div className="px-3 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <button onClick={() => router.push('/')} className="text-[#6b7a99]">◀</button>
          <h1 className="font-cinzel font-black text-lg text-[#ffd700]" style={{ textShadow: '0 0 10px rgba(255,215,0,0.4)' }}>
            🎲 TRIỆU HỒI TƯỚNG
          </h1>
        </div>
        <div className="flex gap-3 text-xs mt-2">
          <span className="text-[#ffd700]">🪙 {state.player.gold.toLocaleString()}</span>
          <span className="text-[#4fc3f7]">💎 {state.player.diamond}</span>
        </div>
      </div>

      {/* World Boss Banner */}
      <div className="mx-3 mb-4 rounded-2xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, rgba(155,48,255,0.2), rgba(255,0,102,0.15))', border: '1px solid rgba(155,48,255,0.3)' }}>
        <div className="px-4 py-3 flex items-center gap-3">
          <span className="text-3xl">🐲</span>
          <div>
            <div className="font-cinzel font-bold text-sm text-[#ff6fff]">Boss Thế Giới Hôm Nay</div>
            <div className="text-[11px] text-[#6b7a99]">21:00 — Hư Không Chí Tôn • Thưởng: Tướng Chí Tôn</div>
          </div>
          <div className="ml-auto text-2xl">🌀</div>
        </div>
      </div>

      {/* Chest grid */}
      <div className="px-3 space-y-3">
        {GACHA_CHESTS.map(chest => (
          <ChestCard
            key={chest.id}
            chest={chest}
            onOpen={() => {}}
            onPull={handlePull}
          />
        ))}
      </div>

      {/* Rarity explanation */}
      <div className="mx-3 mt-4 glass-card p-4" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="font-cinzel text-[#ffd700] text-xs font-bold mb-3 tracking-wider">CẤP ĐỘ TƯỚNG</div>
        <div className="space-y-2">
          {(Object.entries(RARITY_CONFIG) as [import('@/types').HeroRarity, typeof RARITY_CONFIG[keyof typeof RARITY_CONFIG]][]).map(([key, conf]) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{conf.emoji}</span>
                <span className="text-[12px] font-bold" style={{ color: conf.color }}>{conf.label}</span>
              </div>
              <div className="flex gap-0.5">
                {conf.starMultiplier.map((m, i) => (
                  <div key={i} className="text-[8px] px-1 rounded"
                    style={{ background: conf.color + '15', color: conf.color }}>
                    {i + 1}★ ×{m}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="gacha" />

      {pulling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <motion.div
            className="text-6xl"
            animate={{ rotate: [0, 15, -15, 10, -10, 0], scale: [1, 1.3, 0.9, 1.2, 0.95, 1] }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            📦
          </motion.div>
        </div>
      )}

      <PullResultModal result={result} onClose={() => setResult(null)} />
    </div>
  );
}
