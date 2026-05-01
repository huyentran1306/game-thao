"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGame } from "@/contexts/game-context";
import { CLASS_CONFIG, ELEMENT_CONFIG, DAILY_QUESTS, AFK_CONFIG, WORLD_BOSS_SCHEDULE } from "@/lib/constants";
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
    { key: "EASY",   label: "Dễ",       emoji: "🌱", desc: "Thích hợp cho người mới, quái yếu hơn 25%", color: "#39ff14" },
    { key: "NORMAL", label: "Thường",   emoji: "⚔️", desc: "Độ khó cân bằng, phần thưởng tiêu chuẩn",  color: "#ffd700" },
    { key: "ELITE",  label: "Tinh Anh", emoji: "💀", desc: "Cực khó, quái mạnh hơn 50%, thưởng gấp đôi", color: "#ff0066" },
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
          <div className="absolute inset-0 bg-black/75" onClick={onClose} />
          <motion.div className="relative w-full max-w-[400px] glass-card p-5" style={{ border: "1.5px solid rgba(255,215,0,0.3)" }} initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ type: "spring", damping: 20 }}>
            <h3 className="font-cinzel text-[#ffd700] text-center text-base font-bold mb-4 tracking-wider">🎁 NHẬP CODE QUÀ TẶNG</h3>
            <input
              className="w-full px-3 py-2.5 rounded-xl text-sm font-bold tracking-widest text-center outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,215,0,0.25)", color: "#f0e6c8" }}
              placeholder="Nhập code tại đây..."
              value={code}
              onChange={e => { setCode(e.target.value); setMsg(null); }}
              onKeyDown={e => e.key === "Enter" && handleRedeem()}
            />
            {msg && (
              <div className="text-center text-xs mt-2" style={{ color: msg.ok ? "#39ff14" : "#ff4444" }}>{msg.text}</div>
            )}
            <div className="flex gap-2 mt-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-[#6b7a99]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                Đóng
              </button>
              <button onClick={handleRedeem} className="flex-1 py-2.5 rounded-xl font-cinzel font-bold text-sm" style={{ background: "rgba(255,215,0,0.15)", border: "1.5px solid rgba(255,215,0,0.35)", color: "#ffd700" }}>
                ĐỔI CODE
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DailyQuestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, claimDailyQuest } = useGame();
  const { dailyQuests } = state;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/75" onClick={onClose} />
          <motion.div className="relative w-full max-w-[400px] glass-card p-4" style={{ border: "1.5px solid rgba(79,195,247,0.25)" }} initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ type: "spring", damping: 20 }}>
            <h3 className="font-cinzel text-[#4fc3f7] text-center text-base font-bold mb-3 tracking-wider">📋 NHIỆM VỤ NGÀY</h3>
            <div className="space-y-2 mb-3">
              {DAILY_QUESTS.map(q => {
                const prog = dailyQuests.progress[q.id] ?? 0;
                const claimed = dailyQuests.claimed[q.id] ?? false;
                const done = prog >= q.target;
                const pct = Math.min(100, (prog / q.target) * 100);
                return (
                  <div key={q.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: claimed ? "rgba(57,255,20,0.04)" : "rgba(255,255,255,0.03)", border: `1px solid ${claimed ? "rgba(57,255,20,0.15)" : "rgba(255,255,255,0.06)"}` }}>
                    <span className="text-xl flex-shrink-0">{q.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-[#f0e6c8] truncate">{q.desc}</div>
                      <div className="h-1.5 rounded-full mt-1 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: claimed ? "#39ff14" : done ? "#ffd700" : "#4fc3f7" }} />
                      </div>
                      <div className="text-[10px] text-[#6b7a99] mt-0.5">{Math.min(prog, q.target)}/{q.target}</div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-[10px] text-[#ffd700]">{q.rewardGold > 0 && `🪙${q.rewardGold}`} {q.rewardDiamond > 0 && `💎${q.rewardDiamond}`} {q.rewardChestType && `📦`}</div>
                      <button
                        onClick={() => claimDailyQuest(q.id)}
                        disabled={!done || claimed}
                        className="mt-1 px-2 py-1 rounded-lg text-[10px] font-bold font-cinzel transition-all"
                        style={{
                          background: claimed ? "rgba(57,255,20,0.08)" : done ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${claimed ? "rgba(57,255,20,0.2)" : done ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.08)"}`,
                          color: claimed ? "#39ff14" : done ? "#ffd700" : "#4a5568",
                        }}
                      >
                        {claimed ? "✓ Nhận" : done ? "Nhận!" : "..."}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm text-[#6b7a99]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              Đóng
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

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
      <button
        onClick={startAfk}
        className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-cinzel font-bold text-sm transition-all"
        style={{ background: "rgba(155,48,255,0.1)", border: "1.5px solid rgba(155,48,255,0.25)", color: "#9b30ff" }}
      >
        😴 Bắt Đầu AFK (Treo Máy)
      </button>
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
    <div className="rounded-xl overflow-hidden" style={{ background: "rgba(155,48,255,0.07)", border: "1.5px solid rgba(155,48,255,0.2)" }}>
      <div className="px-3 pt-2.5 pb-1.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-cinzel text-[#9b30ff] text-xs font-bold">😴 ĐANG AFK</span>
          <span className="text-[#f0e6c8] font-mono text-xs font-bold">{hh}:{mm}:{ss} / {AFK_CONFIG.MAX_HOURS}h</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#9b30ff,#ff6fff)" }} />
        </div>
        <div className="flex gap-3 text-[11px] mb-2">
          <span className="text-[#ffd700]">🪙 +{goldEarned.toLocaleString()}</span>
          <span className="text-[#4fc3f7]">✨ +{expEarned.toLocaleString()} EXP</span>
        </div>
        <button
          onClick={collectAfk}
          className="w-full py-2 rounded-lg font-cinzel font-bold text-xs"
          style={{ background: "rgba(155,48,255,0.2)", border: "1px solid rgba(155,48,255,0.4)", color: "#cc88ff" }}
        >
          Thu Thập Phần Thưởng
        </button>
      </div>
    </div>
  );
}

function WorldBossHomeCard() {
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState('--:--:--');
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
      const mm = Math.floor((secsLeft % 3600) / 60);
      const ss = secsLeft % 60;
      setCountdown(`${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`);
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  if (!mounted) {
    return (
      <div className="mx-3 mt-3 rounded-2xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg,rgba(155,48,255,0.1),rgba(0,80,200,0.08))', border: '1px solid rgba(155,48,255,0.25)', height: 72 }} />
    );
  }

  if (activeBoss) {
    return (
      <motion.div className="mx-3 mt-3 rounded-2xl overflow-hidden relative cursor-pointer"
        style={{ background: 'linear-gradient(135deg,rgba(220,30,0,0.25),rgba(255,80,0,0.15))', border: '1.5px solid rgba(255,60,0,0.5)' }}
        animate={{ boxShadow: ['0 0 10px rgba(255,60,0,0.3)','0 0 25px rgba(255,60,0,0.6)','0 0 10px rgba(255,60,0,0.3)'] }}
        transition={{ duration: 1.2, repeat: Infinity }}>
        <div className="px-4 py-3 flex items-center gap-3">
          <motion.span className="text-4xl" animate={{ rotate: [0,-8,8,-4,0], scale:[1,1.15,1] }} transition={{ duration: 1.2, repeat: Infinity }}>
            {activeBoss.emoji}
          </motion.span>
          <div className="flex-1">
            <div className="font-cinzel font-black text-xs text-[#ff5500] tracking-wider">🔴 BOSS THẾ GIỚI ĐANG XUẤT HIỆN</div>
            <div className="font-cinzel font-bold text-sm text-white mt-0.5">{activeBoss.name}</div>
            <div className="text-[10px] text-[#ffd700] mt-0.5">🏆 {activeBoss.reward}</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl text-xs font-cinzel font-bold"
            style={{ background: 'rgba(255,60,0,0.25)', color: '#ff8844', border: '1px solid rgba(255,60,0,0.4)' }}>
            THAM GIA<br />NGAY!
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mx-3 mt-3 rounded-2xl overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg,rgba(155,48,255,0.1),rgba(0,80,200,0.08))', border: '1px solid rgba(155,48,255,0.25)' }}>
      <div className="px-4 py-2.5 flex items-center gap-3">
        <span className="text-3xl opacity-80">{nextBoss?.emoji ?? '🐲'}</span>
        <div className="flex-1">
          <div className="font-cinzel text-[10px] text-[#9b30ff] font-bold tracking-wider">BOSS THẾ GIỚI TIẾP THEO</div>
          <div className="text-xs text-[#f0e6c8] font-bold">{nextBoss?.name} <span className="text-[#6b7a99] font-normal">lúc {nextBoss?.hour}:00</span></div>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-[#6b7a99]">Còn lại</div>
          <div className="font-cinzel font-black text-sm text-[#ffd700]">{countdown}</div>
        </div>
      </div>
      {/* Progress bar for all 3 bosses today */}
      <div className="px-4 pb-2.5 flex gap-2">
        {WORLD_BOSS_SCHEDULE.map(boss => {
          const passed = currentHour >= boss.hour;
          return (
            <div key={boss.hour} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-sm" style={{ opacity: passed ? 0.4 : 1 }}>{boss.emoji}</span>
              <div className="text-[8px]" style={{ color: passed ? '#4a5568' : '#6b7a99' }}>{boss.hour}:00</div>
              <div className="w-full h-1 rounded-full" style={{ background: passed ? '#4a5568' : 'rgba(155,48,255,0.4)', boxShadow: passed ? 'none' : '0 0 4px rgba(155,48,255,0.6)' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
    <div className="min-h-screen pb-24 flex flex-col" style={{ background: "linear-gradient(180deg, #05080f 0%, #0a0820 50%, #05080f 100%)" }}>
      <TopBar />
      <ResourceBar />

      {/* Quick action row */}
      <div className="flex gap-2 mx-3 mt-2">
        <button
          onClick={() => setQuestModal(true)}
          className="flex-1 py-2 rounded-xl text-[11px] font-bold font-cinzel flex items-center justify-center gap-1 relative"
          style={{ background: "rgba(79,195,247,0.08)", border: "1.5px solid rgba(79,195,247,0.2)", color: "#4fc3f7" }}
        >
          📋 Nhiệm Vụ
          {completedQuests > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center" style={{ background: "#ff4444", color: "#fff" }}>
              {completedQuests}
            </span>
          )}
        </button>
        <button
          onClick={() => setGiftModal(true)}
          className="flex-1 py-2 rounded-xl text-[11px] font-bold font-cinzel flex items-center justify-center gap-1"
          style={{ background: "rgba(255,215,0,0.08)", border: "1.5px solid rgba(255,215,0,0.2)", color: "#ffd700" }}
        >
          🎁 Nhập Code
        </button>
        <button
          onClick={() => router.push('/leaderboard')}
          className="flex-1 py-2 rounded-xl text-[11px] font-bold font-cinzel flex items-center justify-center gap-1"
          style={{ background: "rgba(255,102,0,0.08)", border: "1.5px solid rgba(255,102,0,0.2)", color: "#ff9944" }}
        >
          🏆 BXH
        </button>
      </div>

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

      {/* World Boss Event */}
      <WorldBossHomeCard />

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

      {/* AFK Panel */}
      <div className="mx-3 mt-3">
        <AfkPanel />
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
      <GiftCodeModal open={giftModal} onClose={() => setGiftModal(false)} />
      <DailyQuestModal open={questModal} onClose={() => setQuestModal(false)} />
    </div>
  );
}
