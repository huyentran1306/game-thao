"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGame } from "@/contexts/game-context";
import { CLASS_CONFIG, ELEMENT_CONFIG, DAILY_QUESTS, AFK_CONFIG, WORLD_BOSS_SCHEDULE } from "@/lib/constants";
import type { Difficulty } from "@/types";
import BottomNav from "@/components/game/BottomNav";

/* ── Ambient background orbs ─────────────────────────────────────────────── */
function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Base gradient */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, #06091a 0%, #0b0a22 40%, #080514 100%)"
      }} />
      {/* Animated orbs */}
      {[
        { color: "rgba(155,48,255,0.07)", size: 320, x: "15%", y: "10%", dur: 18 },
        { color: "rgba(0,100,255,0.05)",  size: 280, x: "70%", y: "5%",  dur: 22 },
        { color: "rgba(255,80,0,0.04)",   size: 240, x: "50%", y: "55%", dur: 15 },
        { color: "rgba(0,191,255,0.04)",  size: 200, x: "10%", y: "65%", dur: 20 },
      ].map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: o.size, height: o.size,
            left: o.x, top: o.y,
            background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
            filter: "blur(40px)",
            transform: "translate(-50%,-50%)",
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 15, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: o.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {/* Subtle grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(rgba(255,215,0,0.018) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,215,0,0.018) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />
      {/* Floating sparkles */}
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={`sp${i}`}
          className="absolute rounded-full bg-white"
          style={{
            width: 1 + Math.random() * 2, height: 1 + Math.random() * 2,
            left: `${Math.random() * 100}%`, top: `${Math.random() * 80}%`,
          }}
          animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: 3 + i * 0.4, delay: i * 0.3, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ── Top Bar ─────────────────────────────────────────────────────────────── */
function TopBar() {
  const { state, openStarBox, canOpenStarBox } = useGame();
  const { player, heroes } = state;
  const avatar = heroes.find((h) => h.id === player.avatarHeroId);
  const expPercent = Math.floor((player.exp / player.maxExp) * 100);
  const canOpen = canOpenStarBox();

  return (
    <div
      className="mx-3 mt-3 px-3 py-2.5 flex items-center gap-3"
      style={{
        background: "linear-gradient(135deg, rgba(18,22,40,0.95) 0%, rgba(12,15,28,0.92) 100%)",
        border: "1px solid rgba(255,215,0,0.22)",
        borderRadius: "1rem",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,215,0,0.08)",
      }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className="w-13 h-13 rounded-2xl flex items-center justify-center text-2xl"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${avatar ? ELEMENT_CONFIG[avatar.element].color + "30" : "rgba(255,215,0,0.2)"}, rgba(8,10,20,0.9))`,
            border: `2px solid ${avatar ? ELEMENT_CONFIG[avatar.element].color + "70" : "rgba(255,215,0,0.5)"}`,
            boxShadow: `0 0 12px ${avatar ? ELEMENT_CONFIG[avatar.element].color + "40" : "rgba(255,215,0,0.3)"},
                        inset 0 1px 0 rgba(255,255,255,0.1)`,
            width: 52, height: 52,
          }}
        >
          {avatar?.emoji ?? "⚔️"}
        </div>
        {/* Level badge */}
        <div
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #b8860b, #ffd700)",
            fontSize: 9, fontWeight: 900, color: "#1a0e00",
            boxShadow: "0 0 6px rgba(255,215,0,0.6)",
            fontFamily: "Cinzel, serif",
          }}
        >
          {player.level}
        </div>
      </div>

      {/* Name + EXP */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="font-cinzel font-black text-sm truncate"
            style={{ color: "#ffd700", textShadow: "0 0 10px rgba(255,215,0,0.5)" }}
          >
            {player.name}
          </span>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded font-bold flex-shrink-0"
            style={{ background: "rgba(255,100,0,0.15)", border: "1px solid rgba(255,100,0,0.3)", color: "#ff9944" }}
          >
            Lv.{player.level}
          </span>
        </div>
        {/* EXP bar */}
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)" }}
        >
          <div className="exp-bar-fill h-full rounded-full" style={{ width: `${expPercent}%` }} />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[9px] text-[#6b7a99]">{player.exp}/{player.maxExp} EXP</span>
          <span className="text-[9px]" style={{ color: "#ffd700" }}>⭐ {player.totalStars}</span>
        </div>
      </div>

      {/* Star box */}
      <motion.button
        onClick={openStarBox}
        disabled={!canOpen}
        className="flex-shrink-0 flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl"
        style={{
          background: canOpen ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.03)",
          border: `1.5px solid ${canOpen ? "rgba(255,215,0,0.45)" : "rgba(255,255,255,0.07)"}`,
          boxShadow: canOpen ? "0 0 12px rgba(255,215,0,0.2)" : "none",
        }}
        animate={canOpen ? { scale: [1, 1.06, 1] } : {}}
        transition={{ duration: 1.4, repeat: Infinity }}
        whileTap={{ scale: 0.92 }}
      >
        <span className="text-base leading-none">🎁</span>
        <span
          className="text-[9px] font-cinzel font-black"
          style={{ color: canOpen ? "#ffd700" : "#4a5568" }}
        >
          {player.starBoxCount}/5
        </span>
      </motion.button>
    </div>
  );
}

/* ── Resource Bar ─────────────────────────────────────────────────────────── */
function ResourceBar() {
  const { state } = useGame();
  const resources = [
    { icon: "🪙", value: state.player.gold,    label: "Vàng",     color: "#ffd700", bg: "rgba(255,215,0,0.08)",    border: "rgba(255,215,0,0.2)" },
    { icon: "💎", value: state.player.diamond, label: "Kim Cương", color: "#60cfff", bg: "rgba(0,191,255,0.08)",    border: "rgba(0,191,255,0.2)" },
    { icon: "✨", value: state.player.essence, label: "Tinh Hoa",  color: "#cc88ff", bg: "rgba(155,48,255,0.08)", border: "rgba(155,48,255,0.2)" },
  ];

  return (
    <div className="flex gap-2 mx-3 mt-2">
      {resources.map((r) => (
        <div
          key={r.label}
          className="flex-1 flex items-center gap-2 px-2.5 py-2 rounded-xl"
          style={{
            background: r.bg,
            border: `1px solid ${r.border}`,
            boxShadow: `0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
          }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
            style={{
              background: `${r.bg}`,
              border: `1px solid ${r.border}`,
              boxShadow: `0 0 8px ${r.color}25`,
            }}
          >
            {r.icon}
          </div>
          <div className="min-w-0">
            <div className="text-[9px]" style={{ color: r.color + "88" }}>{r.label}</div>
            <div className="text-xs font-black" style={{ color: r.color, textShadow: `0 0 8px ${r.color}40` }}>
              {r.value.toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Difficulty Modal ─────────────────────────────────────────────────────── */
function DifficultyModal({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (d: Difficulty) => void }) {
  const difficulties: { key: Difficulty; label: string; emoji: string; desc: string; color: string; bg: string }[] = [
    { key: "EASY",   label: "Dễ",       emoji: "🌱", desc: "Thích hợp cho người mới, quái yếu hơn 25%", color: "#39ff14", bg: "rgba(57,255,20,0.06)" },
    { key: "NORMAL", label: "Thường",   emoji: "⚔️", desc: "Độ khó cân bằng, phần thưởng tiêu chuẩn",  color: "#ffd700", bg: "rgba(255,215,0,0.06)" },
    { key: "ELITE",  label: "Tinh Anh", emoji: "💀", desc: "Cực khó, quái mạnh hơn 50%, thưởng gấp đôi", color: "#ff0066", bg: "rgba(255,0,102,0.06)" },
  ];
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-[400px] p-5"
            style={{
              background: "linear-gradient(160deg, rgba(20,18,40,0.98) 0%, rgba(12,10,28,0.97) 100%)",
              border: "1px solid rgba(255,215,0,0.25)",
              borderRadius: "1.25rem",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.8), 0 0 30px rgba(255,215,0,0.06)",
            }}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 22 }}
          >
            {/* Top line accent */}
            <div className="absolute top-0 left-8 right-8 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(255,215,0,0.5),transparent)" }} />
            <h3 className="font-cinzel text-[#ffd700] text-center text-base font-black mb-4 tracking-wider" style={{ textShadow: "0 0 15px rgba(255,215,0,0.4)" }}>
              ⚔️ CHỌN ĐỘ KHÓ
            </h3>
            <div className="space-y-2.5">
              {difficulties.map((d) => (
                <motion.button
                  key={d.key}
                  onClick={() => onSelect(d.key)}
                  className="w-full p-3.5 flex items-center gap-3 text-left rounded-xl relative overflow-hidden"
                  style={{ background: d.bg, border: `1px solid ${d.color}30` }}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ borderColor: d.color + "60" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `${d.color}15`, border: `1px solid ${d.color}30` }}
                  >
                    {d.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="font-cinzel font-black text-sm" style={{ color: d.color }}>{d.label}</div>
                    <div className="text-[11px] text-[#6b7a99] mt-0.5">{d.desc}</div>
                  </div>
                  <span style={{ color: d.color, opacity: 0.7 }}>▶</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Gift Code Modal ─────────────────────────────────────────────────────── */
function GiftCodeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { redeemGiftCode } = useGame();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const handleRedeem = () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    const ok = redeemGiftCode(trimmed);
    setMsg(ok ? { text: "✅ Đổi code thành công!", ok: true } : { text: "❌ Code không hợp lệ hoặc đã dùng", ok: false });
    if (ok) setCode("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-[400px] p-5"
            style={{
              background: "linear-gradient(160deg, rgba(20,16,10,0.98) 0%, rgba(12,10,4,0.97) 100%)",
              border: "1px solid rgba(255,215,0,0.28)",
              borderRadius: "1.25rem",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.8), 0 0 25px rgba(255,215,0,0.06)",
            }}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 22 }}
          >
            <div className="absolute top-0 left-8 right-8 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(255,215,0,0.5),transparent)" }} />
            <h3 className="font-cinzel text-[#ffd700] text-center text-base font-black mb-4 tracking-wider" style={{ textShadow: "0 0 15px rgba(255,215,0,0.4)" }}>
              🎁 NHẬP CODE QUÀ TẶNG
            </h3>
            <input
              className="w-full px-3 py-3 rounded-xl text-sm font-black tracking-widest text-center outline-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1.5px solid rgba(255,215,0,0.2)",
                color: "#f0e6c8",
                boxShadow: "inset 0 2px 8px rgba(0,0,0,0.3)",
              }}
              placeholder="Nhập code tại đây..."
              value={code}
              onChange={e => { setCode(e.target.value); setMsg(null); }}
              onKeyDown={e => e.key === "Enter" && handleRedeem()}
            />
            {msg && (
              <div className="text-center text-xs mt-2 font-bold" style={{ color: msg.ok ? "#39ff14" : "#ff4444" }}>{msg.text}</div>
            )}
            <div className="flex gap-2 mt-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm text-[#6b7a99] font-cinzel"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                Đóng
              </button>
              <button
                onClick={handleRedeem}
                className="flex-1 py-2.5 rounded-xl font-cinzel font-black text-sm relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(180,140,0,0.3), rgba(255,215,0,0.15))",
                  border: "1.5px solid rgba(255,215,0,0.4)",
                  color: "#ffd700",
                  boxShadow: "0 0 12px rgba(255,215,0,0.15)",
                }}
              >
                ĐỔI CODE
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Daily Quest Modal ───────────────────────────────────────────────────── */
function DailyQuestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, claimDailyQuest } = useGame();
  const { dailyQuests } = state;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-[400px] p-4"
            style={{
              background: "linear-gradient(160deg, rgba(8,18,32,0.98) 0%, rgba(5,12,22,0.97) 100%)",
              border: "1px solid rgba(79,195,247,0.22)",
              borderRadius: "1.25rem",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.8), 0 0 25px rgba(79,195,247,0.05)",
            }}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 22 }}
          >
            <div className="absolute top-0 left-8 right-8 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(79,195,247,0.5),transparent)" }} />
            <h3 className="font-cinzel text-[#4fc3f7] text-center text-base font-black mb-3 tracking-wider">
              📋 NHIỆM VỤ NGÀY
            </h3>
            <div className="space-y-2 mb-3">
              {DAILY_QUESTS.map(q => {
                const prog = dailyQuests.progress[q.id] ?? 0;
                const claimed = dailyQuests.claimed[q.id] ?? false;
                const done = prog >= q.target;
                const pct = Math.min(100, (prog / q.target) * 100);
                return (
                  <div
                    key={q.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    style={{
                      background: claimed ? "rgba(57,255,20,0.04)" : "rgba(255,255,255,0.025)",
                      border: `1px solid ${claimed ? "rgba(57,255,20,0.12)" : "rgba(255,255,255,0.05)"}`,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{
                        background: claimed ? "rgba(57,255,20,0.1)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${claimed ? "rgba(57,255,20,0.2)" : "rgba(255,255,255,0.06)"}`,
                      }}
                    >
                      {q.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-[#f0e6c8] truncate font-medium">{q.desc}</div>
                      <div className="h-1.5 rounded-full mt-1 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: claimed ? "linear-gradient(90deg,#39ff14,#7fff00)" : done ? "linear-gradient(90deg,#ffd700,#ffaa00)" : "linear-gradient(90deg,#4fc3f7,#0088cc)" }} />
                      </div>
                      <div className="text-[9px] text-[#6b7a99] mt-0.5">{Math.min(prog, q.target)}/{q.target}</div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-[9px] text-[#ffd700] mb-1">
                        {q.rewardGold > 0 && `🪙${q.rewardGold} `}
                        {q.rewardDiamond > 0 && `💎${q.rewardDiamond}`}
                        {q.rewardChestType && `📦`}
                      </div>
                      <button
                        onClick={() => claimDailyQuest(q.id)}
                        disabled={!done || claimed}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-black font-cinzel transition-all"
                        style={{
                          background: claimed ? "rgba(57,255,20,0.1)" : done ? "rgba(255,215,0,0.18)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${claimed ? "rgba(57,255,20,0.2)" : done ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.06)"}`,
                          color: claimed ? "#39ff14" : done ? "#ffd700" : "#3a4560",
                        }}
                      >
                        {claimed ? "✓" : done ? "Nhận!" : "..."}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm text-[#6b7a99] font-cinzel"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              Đóng
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── AFK Panel ───────────────────────────────────────────────────────────── */
function AfkPanel() {
  const { state, startAfk, collectAfk } = useGame();
  const { afkSession } = state;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!afkSession) return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - afkSession.startedAt) / 1000)), 1000);
    return () => clearInterval(id);
  }, [afkSession]);

  if (!afkSession) {
    return (
      <motion.button
        onClick={startAfk}
        className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-cinzel font-bold text-sm relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(100,20,180,0.15) 0%, rgba(155,48,255,0.08) 100%)",
          border: "1.5px solid rgba(155,48,255,0.3)",
          color: "#cc88ff",
          boxShadow: "0 0 15px rgba(155,48,255,0.1), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
        whileTap={{ scale: 0.97 }}
      >
        <span className="text-lg">😴</span>
        <span>Bắt Đầu AFK (Treo Máy)</span>
      </motion.button>
    );
  }

  const maxSec = AFK_CONFIG.MAX_HOURS * 3600;
  const cappedSec = Math.min(elapsed, maxSec);
  const hrs = cappedSec / 3600;
  const goldEarned = Math.floor(afkSession.goldPerHour * hrs);
  const expEarned = Math.floor(afkSession.expPerHour * hrs);
  const pct = (cappedSec / maxSec) * 100;
  const hh = String(Math.floor(cappedSec / 3600)).padStart(2, "0");
  const mm = String(Math.floor((cappedSec % 3600) / 60)).padStart(2, "0");
  const ss = String(cappedSec % 60).padStart(2, "0");

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(80,15,150,0.15) 0%, rgba(50,8,100,0.12) 100%)",
        border: "1.5px solid rgba(155,48,255,0.25)",
        boxShadow: "0 0 20px rgba(155,48,255,0.08)",
      }}
    >
      <div className="px-3 pt-3 pb-2.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              😴
            </motion.span>
            <span className="font-cinzel text-[#cc88ff] text-xs font-black tracking-wider">ĐANG AFK</span>
          </div>
          <span className="text-[#f0e6c8] font-mono text-xs font-black">
            {hh}:{mm}:{ss} <span className="text-[#6b7a99]">/ {AFK_CONFIG.MAX_HOURS}h</span>
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: "rgba(255,255,255,0.05)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #7b00ff, #cc44ff, #ff66ff)", boxShadow: "0 0 8px rgba(155,48,255,0.6)" }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex gap-3 text-[11px] mb-2.5">
          <span className="text-[#ffd700] font-bold">🪙 +{goldEarned.toLocaleString()}</span>
          <span className="text-[#4fc3f7] font-bold">✨ +{expEarned.toLocaleString()} EXP</span>
        </div>
        <button
          onClick={collectAfk}
          className="w-full py-2 rounded-lg font-cinzel font-black text-xs"
          style={{
            background: "linear-gradient(135deg, rgba(155,48,255,0.25), rgba(100,0,200,0.2))",
            border: "1px solid rgba(155,48,255,0.5)",
            color: "#cc88ff",
            boxShadow: "0 0 10px rgba(155,48,255,0.15)",
          }}
        >
          Thu Thập Phần Thưởng
        </button>
      </div>
    </div>
  );
}

/* ── World Boss Card ─────────────────────────────────────────────────────── */
function WorldBossHomeCard() {
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState("--:--:--");
  const [activeBoss, setActiveBoss] = useState<typeof WORLD_BOSS_SCHEDULE[0] | null>(null);
  const [nextBoss, setNextBoss] = useState(WORLD_BOSS_SCHEDULE[0]);
  const [currentHour, setCurrentHour] = useState(0);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const now = new Date();
      const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
      const totalSecs = h * 3600 + m * 60 + s;
      setCurrentHour(h);
      const active = WORLD_BOSS_SCHEDULE.find(b => h === b.hour && m < 60);
      setActiveBoss(active ?? null);
      const upcoming = WORLD_BOSS_SCHEDULE.find(b => b.hour * 3600 > totalSecs) ?? WORLD_BOSS_SCHEDULE[0];
      setNextBoss(upcoming);
      let secsLeft = upcoming.hour * 3600 - totalSecs;
      if (secsLeft < 0) secsLeft += 86400;
      const hh = Math.floor(secsLeft / 3600);
      const mm2 = Math.floor((secsLeft % 3600) / 60);
      const ss2 = secsLeft % 60;
      setCountdown(`${String(hh).padStart(2,"0")}:${String(mm2).padStart(2,"0")}:${String(ss2).padStart(2,"0")}`);
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  if (!mounted) {
    return <div className="mx-3 mt-3 rounded-2xl" style={{ height: 80, background: "rgba(30,15,60,0.4)", border: "1px solid rgba(155,48,255,0.15)" }} />;
  }

  if (activeBoss) {
    return (
      <motion.div
        className="mx-3 mt-3 rounded-2xl overflow-hidden relative cursor-pointer"
        style={{
          background: "linear-gradient(135deg, rgba(180,20,0,0.3), rgba(220,60,0,0.2))",
          border: "1.5px solid rgba(255,60,0,0.5)",
          boxShadow: "0 0 30px rgba(255,40,0,0.2)",
        }}
        animate={{ boxShadow: ["0 0 15px rgba(255,60,0,0.2)","0 0 35px rgba(255,60,0,0.5)","0 0 15px rgba(255,60,0,0.2)"] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      >
        <div className="px-4 py-3 flex items-center gap-3">
          <motion.span
            className="text-4xl"
            animate={{ rotate: [0,-8,8,-4,0], scale: [1,1.15,1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            {activeBoss.emoji}
          </motion.span>
          <div className="flex-1">
            <div className="font-cinzel font-black text-[10px] text-[#ff5500] tracking-wider">🔴 BOSS THẾ GIỚI ĐANG XUẤT HIỆN</div>
            <div className="font-cinzel font-bold text-sm text-white mt-0.5">{activeBoss.name}</div>
            <div className="text-[10px] text-[#ffd700] mt-0.5">🏆 {activeBoss.reward}</div>
          </div>
          <div
            className="px-3 py-2 rounded-xl text-xs font-cinzel font-black text-center"
            style={{ background: "rgba(255,50,0,0.2)", color: "#ff8844", border: "1px solid rgba(255,60,0,0.4)" }}
          >
            THAM GIA<br />NGAY!
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className="mx-3 mt-3 rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(50,10,120,0.25) 0%, rgba(20,8,50,0.3) 100%)",
        border: "1px solid rgba(155,48,255,0.25)",
      }}
    >
      <div className="px-4 py-2.5 flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: "rgba(155,48,255,0.1)",
            border: "1px solid rgba(155,48,255,0.25)",
          }}
        >
          {nextBoss?.emoji ?? "🐲"}
        </div>
        <div className="flex-1">
          <div className="font-cinzel text-[9px] text-[#9b30ff] font-black tracking-[0.15em]">BOSS THẾ GIỚI TIẾP THEO</div>
          <div className="text-xs text-[#f0e6c8] font-bold mt-0.5">
            {nextBoss?.name}
            <span className="text-[#6b7a99] font-normal text-[10px]"> lúc {nextBoss?.hour}:00</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-[#6b7a99]">Còn lại</div>
          <div className="font-cinzel font-black text-sm" style={{ color: "#ffd700", textShadow: "0 0 10px rgba(255,215,0,0.5)" }}>
            {countdown}
          </div>
        </div>
      </div>
      {/* Boss schedule dots */}
      <div className="px-4 pb-3 flex gap-2">
        {WORLD_BOSS_SCHEDULE.map(boss => {
          const passed = currentHour >= boss.hour;
          return (
            <div key={boss.hour} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-base" style={{ opacity: passed ? 0.35 : 1 }}>{boss.emoji}</span>
              <div className="text-[8px]" style={{ color: passed ? "#3a4560" : "#6b7a99" }}>{boss.hour}:00</div>
              <div
                className="w-full h-1.5 rounded-full"
                style={{
                  background: passed ? "rgba(255,255,255,0.05)" : "rgba(155,48,255,0.35)",
                  boxShadow: passed ? "none" : "0 0 6px rgba(155,48,255,0.5)",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main Hub Page ───────────────────────────────────────────────────────── */
export default function HubPage() {
  const router = useRouter();
  const { state } = useGame();
  const [diffModal, setDiffModal] = useState(false);
  const [giftModal, setGiftModal] = useState(false);
  const [questModal, setQuestModal] = useState(false);
  const handleDiff = (d: Difficulty) => { setDiffModal(false); router.push(`/battle?stage=s1_1&difficulty=${d}`); };
  const unlockedHeroes = state.heroes.filter((h) => h.isUnlocked).slice(0, 5);
  const completedQuests = DAILY_QUESTS.filter(q => (state.dailyQuests.progress[q.id] ?? 0) >= q.target && !state.dailyQuests.claimed[q.id]).length;

  return (
    <div className="min-h-screen pb-28 flex flex-col relative">
      <AmbientBackground />

      <div className="relative z-10 flex flex-col flex-1">
        <TopBar />
        <ResourceBar />

        {/* ── Quick Actions ─────────────────────────────────────── */}
        <div className="flex gap-2 mx-3 mt-2">
          {/* Nhiệm Vụ */}
          <motion.button
            onClick={() => setQuestModal(true)}
            className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(0,120,200,0.15) 0%, rgba(0,80,160,0.1) 100%)",
              border: "1.5px solid rgba(79,195,247,0.28)",
              color: "#4fc3f7",
              boxShadow: "0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-sm">📋</span>
            <span className="font-cinzel font-black text-[10px] tracking-wide">Nhiệm Vụ</span>
            {completedQuests > 0 && (
              <motion.span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-black flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#ff3344,#cc0022)", color: "#fff", boxShadow: "0 0 8px rgba(255,50,60,0.6)" }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {completedQuests}
              </motion.span>
            )}
          </motion.button>

          {/* Nhập Code */}
          <motion.button
            onClick={() => setGiftModal(true)}
            className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(160,100,0,0.15) 0%, rgba(100,60,0,0.1) 100%)",
              border: "1.5px solid rgba(255,215,0,0.28)",
              color: "#ffd700",
              boxShadow: "0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-sm">🎁</span>
            <span className="font-cinzel font-black text-[10px] tracking-wide">Nhập Code</span>
          </motion.button>

          {/* BXH */}
          <motion.button
            onClick={() => router.push("/leaderboard")}
            className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(160,60,0,0.15) 0%, rgba(100,30,0,0.1) 100%)",
              border: "1.5px solid rgba(255,120,0,0.28)",
              color: "#ff9944",
              boxShadow: "0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-sm">🏆</span>
            <span className="font-cinzel font-black text-[10px] tracking-wide">BXH</span>
          </motion.button>
        </div>

        {/* ── Hero Team ─────────────────────────────────────────── */}
        <div
          className="mx-3 mt-3 p-4 rounded-2xl relative overflow-hidden"
          style={{
            background: "linear-gradient(160deg, rgba(20,18,40,0.92) 0%, rgba(12,10,28,0.88) 100%)",
            border: "1px solid rgba(255,215,0,0.18)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {/* Diagonal pattern overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, rgba(255,215,0,0.02) 0, rgba(255,215,0,0.02) 1px, transparent 0, transparent 50%)",
              backgroundSize: "16px 16px",
            }}
          />
          <div className="section-label mb-3">ĐỘI HÌNH HIỆN TẠI</div>
          <div className="flex justify-center gap-2.5 relative">
            {unlockedHeroes.map((hero, i) => (
              <motion.div
                key={hero.id}
                className="flex flex-col items-center gap-1.5"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
              >
                <div
                  className="w-13 h-13 rounded-2xl flex items-center justify-center text-2xl relative"
                  style={{
                    background: `radial-gradient(circle at 35% 25%, ${ELEMENT_CONFIG[hero.element].color}20, rgba(8,10,20,0.9))`,
                    border: `1.5px solid ${ELEMENT_CONFIG[hero.element].color}50`,
                    boxShadow: `0 0 14px ${ELEMENT_CONFIG[hero.element].color}30, inset 0 1px 0 rgba(255,255,255,0.06)`,
                    width: 52, height: 52,
                  }}
                >
                  {hero.emoji}
                  {/* Star level indicator */}
                  {hero.stars > 1 && (
                    <div
                      className="absolute -bottom-1 -right-1 text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg,#b8860b,#ffd700)",
                        color: "#1a0e00",
                        boxShadow: "0 0 5px rgba(255,215,0,0.5)",
                      }}
                    >
                      {hero.stars}
                    </div>
                  )}
                </div>
                {/* Class color dot */}
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: CLASS_CONFIG[hero.heroClass].color,
                    boxShadow: `0 0 5px ${CLASS_CONFIG[hero.heroClass].color}80`,
                  }}
                />
              </motion.div>
            ))}
            {unlockedHeroes.length < 5 && Array.from({ length: 5 - unlockedHeroes.length }).map((_, i) => (
              <div
                key={`e${i}`}
                className="flex flex-col items-center justify-center gap-1.5"
                style={{ width: 52 }}
              >
                <div
                  className="w-13 h-13 rounded-2xl flex items-center justify-center text-[#ffffff15]"
                  style={{
                    width: 52, height: 52,
                    border: "1.5px dashed rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.02)",
                    fontSize: 20,
                  }}
                >
                  +
                </div>
                <div className="w-2 h-2 rounded-full bg-[rgba(255,255,255,0.1)]" />
              </div>
            ))}
          </div>
        </div>

        {/* ── World Boss ────────────────────────────────────────── */}
        <WorldBossHomeCard />

        {/* ── BATTLE BUTTON ─────────────────────────────────────── */}
        <div className="mx-3 mt-4">
          <motion.button
            onClick={() => setDiffModal(true)}
            className="w-full relative overflow-hidden rounded-2xl py-6 flex flex-col items-center justify-center gap-1.5"
            style={{
              background: "linear-gradient(135deg, #1c0800 0%, #3d1200 35%, #200a00 65%, #120500 100%)",
              border: "2px solid rgba(255,120,0,0.45)",
              boxShadow: "0 0 40px rgba(255,80,0,0.15), 0 8px 30px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,200,0,0.08)",
            }}
            whileTap={{ scale: 0.97 }}
            animate={{
              boxShadow: [
                "0 0 25px rgba(255,80,0,0.12), 0 8px 30px rgba(0,0,0,0.7)",
                "0 0 50px rgba(255,100,0,0.28), 0 8px 30px rgba(0,0,0,0.7), 0 0 80px rgba(255,60,0,0.1)",
                "0 0 25px rgba(255,80,0,0.12), 0 8px 30px rgba(0,0,0,0.7)",
              ]
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            {/* Shine sweep */}
            <motion.div
              className="absolute inset-0"
              style={{ background: "linear-gradient(105deg, transparent 25%, rgba(255,200,0,0.08) 50%, transparent 75%)" }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
            />
            {/* Corner accents */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[rgba(255,150,0,0.4)] rounded-tl" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[rgba(255,150,0,0.4)] rounded-tr" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[rgba(255,150,0,0.4)] rounded-bl" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[rgba(255,150,0,0.4)] rounded-br" />

            <motion.span
              className="text-4xl"
              style={{ filter: "drop-shadow(0 0 18px #ff6600)" }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ⚔️
            </motion.span>
            <span
              className="font-cinzel font-black text-2xl tracking-[0.15em]"
              style={{
                color: "#ffd700",
                textShadow: "0 0 20px rgba(255,200,0,0.7), 0 2px 4px rgba(0,0,0,0.8)",
              }}
            >
              THAM GIA CHIẾN
            </span>
            <span
              className="font-cinzel text-[11px] tracking-[0.2em]"
              style={{ color: "rgba(255,215,0,0.4)" }}
            >
              NHẤN ĐỂ VÀO TRẬN
            </span>
          </motion.button>
        </div>

        {/* ── AFK Panel ─────────────────────────────────────────── */}
        <div className="mx-3 mt-3">
          <AfkPanel />
        </div>

        {/* ── Stats Row ─────────────────────────────────────────── */}
        <div className="mx-3 mt-3 grid grid-cols-2 gap-2">
          {[
            {
              icon: "🏆",
              value: state.player.totalStars,
              label: "Tổng Sao",
              color: "#ffd700",
              bg: "rgba(255,215,0,0.06)",
              border: "rgba(255,215,0,0.18)",
            },
            {
              icon: "⚔️",
              value: Object.values(state.campaign).filter((c) => c.stars > 0).length,
              label: "Ải Đã Qua",
              color: "#f0e6c8",
              bg: "rgba(255,255,255,0.03)",
              border: "rgba(255,255,255,0.1)",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="p-3 rounded-xl flex items-center gap-3"
              style={{
                background: `linear-gradient(135deg, ${s.bg}, rgba(10,14,26,0.8))`,
                border: `1px solid ${s.border}`,
                boxShadow: "0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  background: `${s.bg}`,
                  border: `1px solid ${s.border}`,
                }}
              >
                {s.icon}
              </div>
              <div>
                <div className="font-black text-xl" style={{ color: s.color, textShadow: s.color === "#ffd700" ? "0 0 10px rgba(255,215,0,0.4)" : "none" }}>
                  {s.value}
                </div>
                <div className="text-[10px] text-[#6b7a99]">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="home" />
      <DifficultyModal open={diffModal} onClose={() => setDiffModal(false)} onSelect={handleDiff} />
      <GiftCodeModal open={giftModal} onClose={() => setGiftModal(false)} />
      <DailyQuestModal open={questModal} onClose={() => setQuestModal(false)} />
    </div>
  );
}
