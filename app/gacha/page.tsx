"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGame } from "@/contexts/game-context";
import { GACHA_CHESTS, RARITY_CONFIG, ELEMENT_CONFIG, CLASS_CONFIG, SUB_STAT_POOL, SUB_STAT_RARITY_COLOR, WORLD_BOSS_SCHEDULE } from "@/lib/constants";
import type { Hero, GachaChest, HeroRarity } from "@/types";
import BottomNav from "@/components/game/BottomNav";

type PullResult = { hero: Hero; isDupe: boolean; goldBonus: number };

// ─── World Boss Countdown ─────────────────────────────────────────────────────
function WorldBossBanner() {
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState('--:--:--');
  const [activeBoss, setActiveBoss] = useState<typeof WORLD_BOSS_SCHEDULE[0] | null>(null);
  const [nextBoss, setNextBoss] = useState(WORLD_BOSS_SCHEDULE[0]);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const now = new Date();
      const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
      const totalSecs = h * 3600 + m * 60 + s;
      const active = WORLD_BOSS_SCHEDULE.find(b => h === b.hour && m < 60);
      setActiveBoss(active ?? null);
      const upcoming = WORLD_BOSS_SCHEDULE.find(b => b.hour * 3600 > totalSecs) ?? WORLD_BOSS_SCHEDULE[0];
      setNextBoss(upcoming);
      let secsLeft = upcoming.hour * 3600 - totalSecs;
      if (secsLeft < 0) secsLeft += 86400;
      const hh = Math.floor(secsLeft / 3600);
      const mm = Math.floor((secsLeft % 3600) / 60);
      const ss = secsLeft % 60;
      setCountdown(`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`);
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  if (!mounted) {
    return (
      <div className="mx-3 mb-4 rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg,rgba(155,48,255,0.15),rgba(0,100,255,0.1))', border: '1px solid rgba(155,48,255,0.3)', height: 66 }} />
    );
  }

  if (activeBoss) {
    return (
      <motion.div className="mx-3 mb-4 rounded-2xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg,rgba(255,50,0,0.25),rgba(155,48,255,0.2))', border: '1.5px solid rgba(255,80,0,0.5)' }}
        animate={{ boxShadow: ['0 0 12px rgba(255,80,0,0.3)', '0 0 28px rgba(255,80,0,0.6)', '0 0 12px rgba(255,80,0,0.3)'] }}
        transition={{ duration: 1.2, repeat: Infinity }}>
        <div className="px-4 py-3 flex items-center gap-3">
          <motion.span className="text-3xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
            {activeBoss.emoji}
          </motion.span>
          <div className="flex-1">
            <div className="font-cinzel font-bold text-sm text-[#ff4400]">🔴 BOSS ĐANG XUẤT HIỆN!</div>
            <div className="text-[11px] text-[#f0e6c8] font-bold">{activeBoss.name}</div>
            <div className="text-[10px] text-[#ffd700]">Thưởng: {activeBoss.reward}</div>
          </div>
          <div className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ background: 'rgba(255,68,0,0.2)', color: '#ff6600', border: '1px solid rgba(255,68,0,0.4)' }}>
            ĐANG DIỄN RA
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mx-3 mb-4 rounded-2xl overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg,rgba(155,48,255,0.15),rgba(0,100,255,0.1))', border: '1px solid rgba(155,48,255,0.3)' }}>
      <div className="px-4 py-3 flex items-center gap-3">
        <span className="text-3xl">{nextBoss?.emoji ?? '🐲'}</span>
        <div className="flex-1">
          <div className="font-cinzel font-bold text-xs text-[#ff6fff]">Boss Thế Giới Tiếp Theo</div>
          <div className="text-[11px] text-[#f0e6c8]">{nextBoss?.name} • {nextBoss?.hour}:00</div>
          <div className="text-[10px] text-[#6b7a99]">{nextBoss?.reward}</div>
        </div>
        <div className="text-center">
          <div className="text-[9px] text-[#6b7a99]">Còn lại</div>
          <div className="font-cinzel font-black text-sm text-[#ffd700]">{countdown}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Rate Table ───────────────────────────────────────────────────────────────
function RateTable({ chest }: { chest: GachaChest }) {
  return (
    <div className="space-y-1 mt-2">
      {(Object.entries(chest.dropRates) as [HeroRarity, number][])
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

// ─── Single Pull Result Modal ─────────────────────────────────────────────────
function PullResultModal({ result, onClose }: { result: PullResult | null; onClose: () => void }) {
  if (!result) return null;
  const { hero, isDupe, goldBonus } = result;
  const rarityConf = RARITY_CONFIG[hero.rarity];
  const elemConf = ELEMENT_CONFIG[hero.element];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-6"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/85" />
        {/* Rarity flash */}
        <motion.div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 40%, ${rarityConf.color}30, transparent 65%)` }}
          initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.5, 1, 0] }}
          transition={{ duration: 0.8, times: [0, 0.2, 0.4, 0.6, 1] }} />
        <motion.div
          className="relative w-full max-w-[340px] rounded-2xl overflow-hidden"
          style={{ background: 'rgba(8,10,20,0.98)', border: `2px solid ${rarityConf.color}60` }}
          initial={{ scale: 0.3, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="absolute inset-0 opacity-20"
            style={{ background: `radial-gradient(circle at 50% 30%, ${rarityConf.color}, transparent 70%)` }} />

          <div className="px-4 pt-4 pb-2 text-center relative">
            <div className="text-xs font-bold tracking-widest mb-1" style={{ color: rarityConf.color }}>
              {isDupe ? '⚠️ TƯỚNG TRÙNG' : '🎉 TƯỚNG MỚI!'}
            </div>
            <div className="text-[11px] px-3 py-1 rounded-full inline-block font-bold"
              style={{ background: rarityConf.color + '20', color: rarityConf.color, border: `1px solid ${rarityConf.color}40` }}>
              {rarityConf.emoji} {rarityConf.label}
            </div>
          </div>

          <div className="flex flex-col items-center px-4 py-3">
            <motion.div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl mb-3"
              style={{
                background: `radial-gradient(circle, ${elemConf.color}25, rgba(5,8,15,0.9))`,
                border: `2px solid ${rarityConf.color}60`,
                boxShadow: `0 0 30px ${rarityConf.color}40`,
              }}
              animate={{ boxShadow: [`0 0 20px ${rarityConf.color}40`, `0 0 60px ${rarityConf.color}90`, `0 0 20px ${rarityConf.color}40`] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {hero.emoji}
            </motion.div>

            <h2 className="font-cinzel font-black text-xl mb-1" style={{ color: rarityConf.color }}>{hero.name}</h2>
            <div className="flex gap-2 mb-3">
              <span className="text-[11px] px-2 py-0.5 rounded" style={{ color: elemConf.color, background: elemConf.color + '15' }}>
                {elemConf.emoji} {elemConf.label}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded" style={{ color: CLASS_CONFIG[hero.heroClass].color, background: CLASS_CONFIG[hero.heroClass].color + '15' }}>
                {CLASS_CONFIG[hero.heroClass].emoji} {CLASS_CONFIG[hero.heroClass].label}
              </span>
            </div>

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

          <button onClick={onClose} className="w-full py-3 font-cinzel font-bold text-sm"
            style={{ background: rarityConf.color + '20', color: rarityConf.color, borderTop: `1px solid ${rarityConf.color}30` }}>
            XÁC NHẬN
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── 10-Pull Results Modal ────────────────────────────────────────────────────
function TenPullModal({ results, onClose }: { results: PullResult[]; onClose: () => void }) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (revealed >= results.length) return;
    const t = setTimeout(() => setRevealed(r => r + 1), revealed === 0 ? 200 : 120);
    return () => clearTimeout(t);
  }, [revealed, results.length]);

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/92" onClick={revealed >= results.length ? onClose : undefined} />

        <motion.div className="relative w-full max-w-[400px]"
          initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', damping: 16 }}>
          <div className="text-center mb-4">
            <h2 className="font-cinzel font-black text-xl text-[#ffd700]" style={{ textShadow: '0 0 20px #ffd70080' }}>
              🎲 KẾT QUẢ TRIỆU HỒI × 10
            </h2>
          </div>

          <div className="grid grid-cols-5 gap-2 mb-4">
            {results.map((r, i) => {
              const rc = RARITY_CONFIG[r.hero.rarity];
              const isShown = i < revealed;
              return (
                <motion.div key={i}
                  initial={{ scale: 0, rotateY: 180 }}
                  animate={isShown ? { scale: 1, rotateY: 0 } : {}}
                  transition={{ type: 'spring', damping: 14, stiffness: 260 }}
                  className="flex flex-col items-center gap-1">
                  <div className="w-full aspect-square rounded-xl flex items-center justify-center text-2xl relative"
                    style={{
                      background: isShown ? `radial-gradient(circle, ${rc.color}25, rgba(5,8,15,0.95))` : 'rgba(10,14,26,0.8)',
                      border: `1.5px solid ${isShown ? rc.color + '60' : 'rgba(255,255,255,0.08)'}`,
                      boxShadow: isShown && (r.hero.rarity === 'CHI_TON' || r.hero.rarity === 'KIM_CUONG')
                        ? `0 0 16px ${rc.color}60` : 'none',
                    }}>
                    {isShown ? (
                      <>
                        <motion.span
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}>
                          {r.hero.emoji}
                        </motion.span>
                        {(r.hero.rarity === 'CHI_TON' || r.hero.rarity === 'KIM_CUONG') && (
                          <motion.div className="absolute inset-0 rounded-xl"
                            style={{ background: `radial-gradient(circle, ${rc.color}30, transparent)` }}
                            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity }} />
                        )}
                      </>
                    ) : '?'}
                  </div>
                  {isShown && (
                    <div className="text-[8px] font-bold text-center truncate w-full px-0.5"
                      style={{ color: rc.color }}>
                      {rc.emoji}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Summary */}
          {revealed >= results.length && (
            <motion.div className="glass-card p-3 mb-4" style={{ border: '1px solid rgba(255,215,0,0.2)' }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-center text-xs text-[#6b7a99] mb-2">Tổng kết</div>
              <div className="flex justify-center gap-4 flex-wrap">
                {(['CHI_TON', 'KIM_CUONG', 'VANG', 'BAC', 'DONG'] as (keyof typeof RARITY_CONFIG)[]).map(r => {
                  const count = results.filter(x => x.hero.rarity === r).length;
                  if (!count) return null;
                  const rc = RARITY_CONFIG[r];
                  return (
                    <div key={r} className="flex items-center gap-1">
                      <span className="text-sm">{rc.emoji}</span>
                      <span className="text-xs font-bold" style={{ color: rc.color }}>{count}</span>
                    </div>
                  );
                })}
              </div>
              {results.some(r => r.hero.rarity === 'CHI_TON') && (
                <motion.div className="text-center mt-2 text-sm font-cinzel font-black text-[#ff6fff]"
                  animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                  ✨ CHÍ TÔN ĐÃ XUẤT HIỆN! ✨
                </motion.div>
              )}
            </motion.div>
          )}

          {revealed >= results.length ? (
            <button onClick={onClose} className="w-full py-3 rounded-2xl font-cinzel font-bold text-sm"
              style={{ background: 'linear-gradient(135deg,#b8860b,#ffd700)', color: '#05080f' }}>
              ĐÓNG
            </button>
          ) : (
            <button onClick={() => setRevealed(results.length)}
              className="w-full py-3 rounded-2xl font-cinzel font-bold text-xs text-[#6b7a99]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              Bỏ qua animation
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Chest Card ───────────────────────────────────────────────────────────────
function ChestCard({ chest, onPull, onPull10 }: { chest: GachaChest; onPull: (chest: GachaChest) => void; onPull10: (chest: GachaChest) => void }) {
  const [showRates, setShowRates] = useState(false);
  const { state } = useGame();
  const cost1 = chest.cost.gold ?? 0;
  const costDia = chest.cost.diamond ?? 0;
  const cost10Gold = cost1 > 0 ? cost1 * 9 : 0; // 10% discount on x10
  const cost10Diamond = costDia > 0 ? costDia * 9 : 0;

  const canAfford1 = cost1 <= state.player.gold && costDia <= state.player.diamond;
  const canAfford10 = cost10Gold <= state.player.gold && cost10Diamond <= state.player.diamond;

  return (
    <div className="glass-card p-4 relative overflow-hidden"
      style={{ border: `1.5px solid ${chest.color}25` }}>
      <div className="absolute inset-0 opacity-5"
        style={{ background: `radial-gradient(circle at top right, ${chest.color}, transparent 60%)` }} />

      <div className="flex items-start gap-3 relative">
        <motion.div className="text-5xl flex-shrink-0"
          animate={{ y: [0, -4, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
          {chest.emoji}
        </motion.div>
        <div className="flex-1">
          <h3 className="font-cinzel font-bold text-sm mb-0.5" style={{ color: chest.color }}>{chest.name}</h3>
          <div className="text-[11px] text-[#6b7a99] mb-2">
            Bảo đảm: <span style={{ color: RARITY_CONFIG[chest.guaranteedRarity].color }}>
              {RARITY_CONFIG[chest.guaranteedRarity].emoji} {RARITY_CONFIG[chest.guaranteedRarity].label}+
            </span>
          </div>

          <div className="flex gap-2 mb-3">
            {/* x1 button */}
            <button onClick={() => onPull(chest)} disabled={!canAfford1}
              className="flex-1 py-2 rounded-xl text-[12px] font-bold font-cinzel transition-all"
              style={{
                background: canAfford1 ? chest.color + '25' : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${canAfford1 ? chest.color + '60' : 'rgba(255,255,255,0.08)'}`,
                color: canAfford1 ? chest.color : '#4a5568',
              }}>
              Mở 1
              <div className="text-[9px] opacity-70">
                {cost1 ? `🪙${cost1.toLocaleString()}` : `💎${costDia}`}
              </div>
            </button>

            {/* x10 button */}
            <button onClick={() => onPull10(chest)} disabled={!canAfford10}
              className="flex-1 py-2 rounded-xl text-[12px] font-bold font-cinzel transition-all relative overflow-hidden"
              style={{
                background: canAfford10 ? `linear-gradient(135deg, ${chest.color}30, ${chest.color}15)` : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${canAfford10 ? chest.color + '80' : 'rgba(255,255,255,0.08)'}`,
                color: canAfford10 ? chest.color : '#4a5568',
              }}>
              {canAfford10 && (
                <div className="absolute -top-0.5 -right-0.5 text-[7px] font-black px-1 rounded-bl-lg rounded-tr-xl"
                  style={{ background: '#ff0066', color: '#fff' }}>-10%</div>
              )}
              Mở 10
              <div className="text-[9px] opacity-70">
                {cost10Gold ? `🪙${cost10Gold.toLocaleString()}` : `💎${cost10Diamond}`}
              </div>
            </button>

            <button onClick={() => setShowRates(v => !v)}
              className="px-2.5 py-2 rounded-xl text-[11px]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7a99' }}>
              {showRates ? '▲' : 'Tỉ lệ'}
            </button>
          </div>
          {showRates && <RateTable chest={chest} />}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GachaPage() {
  const router = useRouter();
  const { state, openChest, tickDailyQuest } = useGame();
  const [pulling, setPulling] = useState(false);
  const [singleResult, setSingleResult] = useState<PullResult | null>(null);
  const [tenResults, setTenResults] = useState<PullResult[] | null>(null);

  // Simulate a draw from chest data (mirrors reducer logic)
  const simulateDraw = useCallback((chest: GachaChest): PullResult => {
    const rarities = Object.entries(chest.dropRates) as [HeroRarity, number][];
    const roll = Math.random() * 100;
    let cum = 0;
    let drawnRarity: HeroRarity = rarities[0][0];
    for (const [r, w] of rarities) { cum += w; if (roll < cum) { drawnRarity = r; break; } }
    const pool = state.heroes.filter(h => h.rarity === drawnRarity);
    const drawn = pool.length ? pool[Math.floor(Math.random() * pool.length)] : state.heroes[0];
    const isDupe = drawn.isUnlocked;
    const goldBonus = isDupe ? (
      drawnRarity === 'CHI_TON' ? 3000 : drawnRarity === 'KIM_CUONG' ? 1000 :
      drawnRarity === 'VANG' ? 400 : drawnRarity === 'BAC' ? 150 : 50
    ) : 0;
    return { hero: drawn, isDupe, goldBonus };
  }, [state.heroes]);

  const handlePull = useCallback((chest: GachaChest) => {
    if (pulling) return;
    const { gold = 0, diamond = 0 } = chest.cost;
    if (state.player.gold < gold || state.player.diamond < diamond) return;
    setPulling(true);
    openChest(chest.id);
    tickDailyQuest('chests', 1);
    setTimeout(() => {
      const result = simulateDraw(chest);
      setSingleResult(result);
      setPulling(false);
    }, 700);
  }, [pulling, state.player, openChest, tickDailyQuest, simulateDraw]);

  const handlePull10 = useCallback((chest: GachaChest) => {
    if (pulling) return;
    const cost1Gold = chest.cost.gold ?? 0;
    const cost1Dia = chest.cost.diamond ?? 0;
    const cost10Gold = cost1Gold * 9;
    const cost10Dia = cost1Dia * 9;
    if (state.player.gold < cost10Gold || state.player.diamond < cost10Dia) return;
    setPulling(true);

    // Execute 10 pulls
    for (let i = 0; i < 10; i++) {
      openChest(chest.id);
    }
    tickDailyQuest('chests', 10);

    setTimeout(() => {
      // Simulate 10 results for display
      const results: PullResult[] = Array.from({ length: 10 }, () => simulateDraw(chest));
      // Guarantee at least 1 rare+ on x10
      const hasHighRarity = results.some(r => r.hero.rarity === 'VANG' || r.hero.rarity === 'KIM_CUONG' || r.hero.rarity === 'CHI_TON');
      if (!hasHighRarity) {
        const rarePlus = state.heroes.filter(h => h.rarity === 'VANG' || h.rarity === 'KIM_CUONG');
        if (rarePlus.length) {
          const replacement = rarePlus[Math.floor(Math.random() * rarePlus.length)];
          results[9] = { hero: replacement, isDupe: replacement.isUnlocked, goldBonus: replacement.isUnlocked ? 400 : 0 };
        }
      }
      setTenResults(results);
      setPulling(false);
    }, 800);
  }, [pulling, state.player, state.heroes, openChest, tickDailyQuest, simulateDraw]);

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

      <WorldBossBanner />

      {/* Chest grid */}
      <div className="px-3 space-y-3">
        {GACHA_CHESTS.map(chest => (
          <ChestCard key={chest.id} chest={chest} onPull={handlePull} onPull10={handlePull10} />
        ))}
      </div>

      {/* Rarity explanation */}
      <div className="mx-3 mt-4 glass-card p-4" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="font-cinzel text-[#ffd700] text-xs font-bold mb-3 tracking-wider">CẤP ĐỘ TƯỚNG</div>
        <div className="space-y-2">
          {(Object.entries(RARITY_CONFIG) as [HeroRarity, typeof RARITY_CONFIG[keyof typeof RARITY_CONFIG]][]).map(([key, conf]) => (
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

      {/* Pulling animation */}
      {pulling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <motion.div className="flex flex-col items-center gap-4">
            <motion.div className="text-6xl"
              animate={{ rotate: [0, 15, -15, 10, -10, 5, -5, 0], scale: [1, 1.3, 0.95, 1.2, 0.98, 1.1, 0.99, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}>
              📦
            </motion.div>
            <motion.div className="text-[#ffd700] font-cinzel font-bold text-sm"
              animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 0.6, repeat: Infinity }}>
              Đang triệu hồi...
            </motion.div>
          </motion.div>
        </div>
      )}

      <PullResultModal result={singleResult} onClose={() => setSingleResult(null)} />
      {tenResults && <TenPullModal results={tenResults} onClose={() => setTenResults(null)} />}
    </div>
  );
}
