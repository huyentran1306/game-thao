"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGame } from "@/contexts/game-context";
import { CLASS_CONFIG, ELEMENT_CONFIG } from "@/lib/constants";
import type { Difficulty } from "@/types";
import BottomNav from "@/components/game/BottomNav";

function TopBar() {
  const { state, openStarBox, canOpenStarBox } = useGame();
  const { player, heroes } = state;
  const avatar = heroes.find((h) => h.id === player.avatarHeroId);
  const expPercent = Math.floor((player.exp / player.maxExp) * 100);
  return (
    <div className="glass-card gold-border mx-3 mt-3 px-3 py-2.5 flex items-center gap-2">
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center text-2xl flex-shrink-0 border-2"
        style={{
          borderColor: avatar ? ELEMENT_CONFIG[avatar.element].color : "#ffd700",
          boxShadow: `0 0 8px ${avatar ? ELEMENT_CONFIG[avatar.element].color : "#ffd700"}60`,
          background: "rgba(10,14,26,0.8)",
        }}
      >
        {avatar?.emoji ?? "⚔️"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-cinzel text-[#ffd700] text-xs font-bold truncate">{player.name}</span>
          <span className="text-[#6b7a99] text-[10px] flex-shrink-0">Lv.{player.level}</span>
        </div>
        <div className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full mt-1 overflow-hidden">
          <div className="exp-bar-fill h-full rounded-full" style={{ width: `${expPercent}%` }} />
        </div>
        <div className="text-[10px] text-[#6b7a99] mt-0.5">{player.exp}/{player.maxExp} EXP</div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-[#ffd700] text-xs">⭐ {player.totalStars}</span>
        </div>
        <motion.button
          onClick={openStarBox}
          disabled={!canOpenStarBox()}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold"
          style={{
            background: canOpenStarBox() ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${canOpenStarBox() ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.08)"}`,
            color: canOpenStarBox() ? "#ffd700" : "#6b7a99",
          }}
          animate={canOpenStarBox() ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          🎁 {player.starBoxCount}/5
        </motion.button>
      </div>
    </div>
  );
}

function ResourceBar() {
  const { state } = useGame();
  return (
    <div className="flex gap-2 mx-3 mt-2">
      {[
        { icon: "🪙", value: state.player.gold, label: "Vàng" },
        { icon: "💎", value: state.player.diamond, label: "Kim Cương" },
        { icon: "✨", value: state.player.essence, label: "Tinh Hoa" },
      ].map((item) => (
        <div key={item.label} className="flex-1 glass-card py-1.5 px-2 flex items-center gap-1.5 gold-border">
          <span className="text-base">{item.icon}</span>
          <div>
            <div className="text-[10px] text-[#6b7a99]">{item.label}</div>
            <div className="text-xs font-bold text-[#f0e6c8]">{item.value.toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DifficultyModal({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (d: Difficulty) => void }) {
  const difficulties: { key: Difficulty; label: string; emoji: string; desc: string; color: string }[] = [
    { key: "EASY",   label: "Dễ",      emoji: "🌱", desc: "Thích hợp cho người mới, quái yếu hơn 25%", color: "#39ff14" },
    { key: "NORMAL", label: "Thường",  emoji: "⚔️", desc: "Độ khó cân bằng, phần thưởng tiêu chuẩn",  color: "#ffd700" },
    { key: "ELITE",  label: "Tinh Anh",emoji: "💀", desc: "Cực khó, quái mạnh hơn 50%, thưởng gấp đôi", color: "#ff0066" },
  ];
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/70" onClick={onClose} />
          <motion.div className="relative w-full max-w-[400px] glass-card gold-border p-5" initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ type: "spring", damping: 20 }}>
            <h3 className="font-cinzel text-[#ffd700] text-center text-base font-bold mb-4 tracking-wider">⚔️ CHỌN ĐỘ KHÓ</h3>
            <div className="space-y-3">
              {difficulties.map((d) => (
                <motion.button key={d.key} onClick={() => onSelect(d.key)} className="w-full glass-card p-3.5 flex items-center gap-3 text-left" style={{ border: `1px solid ${d.color}25` }} whileTap={{ scale: 0.97 }}>
                  <span className="text-2xl">{d.emoji}</span>
                  <div className="flex-1">
                    <div className="font-cinzel font-bold text-sm" style={{ color: d.color }}>{d.label}</div>
                    <div className="text-[11px] text-[#6b7a99] mt-0.5">{d.desc}</div>
                  </div>
                  <span className="text-[#ffd700] text-lg">▶</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function HubPage() {
  const router = useRouter();
  const { state } = useGame();
  const [diffModal, setDiffModal] = useState(false);
  const handleDiff = (d: Difficulty) => { setDiffModal(false); router.push(`/battle?stage=s1_1&difficulty=${d}`); };
  const unlockedHeroes = state.heroes.filter((h) => h.isUnlocked).slice(0, 5);

  return (
    <div className="min-h-screen pb-24 flex flex-col" style={{ background: "linear-gradient(180deg, #05080f 0%, #0a0820 50%, #05080f 100%)" }}>
      <TopBar />
      <ResourceBar />

      {/* Hero banner */}
      <div className="mx-3 mt-3 glass-card gold-border p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "repeating-linear-gradient(45deg,#ffd700 0,#ffd700 1px,transparent 0,transparent 50%)", backgroundSize: "20px 20px" }} />
        <p className="font-cinzel text-[#ffd700]/60 text-[10px] tracking-widest text-center mb-3">ĐỘI HÌNH HIỆN TẠI</p>
        <div className="flex justify-center gap-2">
          {unlockedHeroes.map((hero, i) => (
            <motion.div key={hero.id} className="flex flex-col items-center gap-1" animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `radial-gradient(circle,${ELEMENT_CONFIG[hero.element].color}15,rgba(10,14,26,0.8))`, border: `1px solid ${ELEMENT_CONFIG[hero.element].color}40`, boxShadow: `0 0 12px ${ELEMENT_CONFIG[hero.element].color}30` }}>
                {hero.emoji}
              </div>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: CLASS_CONFIG[hero.heroClass].color }} />
            </motion.div>
          ))}
          {unlockedHeroes.length < 5 && Array.from({ length: 5 - unlockedHeroes.length }).map((_, i) => (
            <div key={`e${i}`} className="w-12 h-12 rounded-xl flex items-center justify-center text-[#6b7a99]/30 border border-dashed border-[#6b7a99]/20">+</div>
          ))}
        </div>
      </div>

      {/* BATTLE BUTTON */}
      <div className="mx-3 mt-4">
        <motion.button
          onClick={() => setDiffModal(true)}
          className="w-full relative overflow-hidden rounded-2xl py-5 flex flex-col items-center justify-center gap-1"
          style={{ background: "linear-gradient(135deg,#1a0a05 0%,#3d1500 40%,#1a0a05 100%)", border: "2px solid rgba(255,100,0,0.4)", boxShadow: "0 0 30px rgba(255,80,0,0.2),inset 0 1px 0 rgba(255,180,0,0.1)" }}
          whileTap={{ scale: 0.97 }}
          animate={{ boxShadow: ["0 0 20px rgba(255,80,0,0.15)", "0 0 40px rgba(255,80,0,0.3)", "0 0 20px rgba(255,80,0,0.15)"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div className="absolute inset-0 opacity-0" style={{ background: "linear-gradient(105deg,transparent 30%,rgba(255,200,0,0.1) 50%,transparent 70%)" }} animate={{ opacity: [0, 1, 0], x: ["-100%", "100%"] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} />
          <span className="text-4xl" style={{ filter: "drop-shadow(0 0 15px #ff6600)" }}>⚔️</span>
          <span className="font-cinzel font-black text-xl tracking-widest" style={{ color: "#ffd700", textShadow: "0 0 15px rgba(255,215,0,0.6)" }}>THAM GIA CHIẾN</span>
          <span className="text-[#f0e6c8]/50 text-xs font-cinzel tracking-widest">NHẤN ĐỂ VÀO TRẬN</span>
        </motion.button>
      </div>

      {/* Quick stats */}
      <div className="mx-3 mt-3 grid grid-cols-2 gap-2">
        <div className="glass-card gold-border p-3 text-center">
          <div className="text-lg">🏆</div>
          <div className="text-[#ffd700] font-bold text-base mt-0.5">{state.player.totalStars}</div>
          <div className="text-[#6b7a99] text-[10px]">Tổng Sao</div>
        </div>
        <div className="glass-card gold-border p-3 text-center">
          <div className="text-lg">⚔️</div>
          <div className="text-[#f0e6c8] font-bold text-base mt-0.5">{Object.values(state.campaign).filter((c) => c.stars > 0).length}</div>
          <div className="text-[#6b7a99] text-[10px]">Ải Đã Qua</div>
        </div>
      </div>

      <BottomNav active="home" />
      <DifficultyModal open={diffModal} onClose={() => setDiffModal(false)} onSelect={handleDiff} />
    </div>
  );
}
