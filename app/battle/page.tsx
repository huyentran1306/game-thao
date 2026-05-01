"use client";

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useGame } from "@/contexts/game-context";
import { GAME_CONFIG, MONSTER_TEMPLATES, ELEMENT_CONFIG, CLASS_CONFIG } from "@/lib/constants";
import type { Difficulty, GameSpeed, Hero, Monster, Skill, ElementType } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────
let _mid = 0;
function createMonster(key: keyof typeof MONSTER_TEMPLATES, isBoss = false, d = 1) {
  const t = MONSTER_TEMPLATES[key];
  return {
    id: key, instanceId: `m${++_mid}`, name: t.name, element: t.element,
    hp: Math.floor(t.hp * d), maxHp: Math.floor(t.hp * d),
    atk: Math.floor(t.atk * d),
    speed: isBoss ? 0.20 : t.isElite ? 0.42 : 0.58,
    isBoss, isElite: t.isElite, spawnAt: 0,
    reward: { exp: isBoss ? 500 : t.isElite ? 80 : 30, gold: isBoss ? 200 : t.isElite ? 30 : 10 },
    emoji: t.emoji, size: t.size, posX: 10 + Math.random() * 80,
    posY: 0, alive: true, displayY: -100, phase2: false, hitFlash: false,
  };
}
function elementMult(a: ElementType, b: ElementType) {
  return ELEMENT_CONFIG[a].strongAgainst.includes(b) ? 1.5
    : ELEMENT_CONFIG[a].weakAgainst.includes(b) ? 0.75 : 1;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Mon = Monster & { instanceId: string; displayY: number; phase2: boolean; hitFlash: boolean };
type FloatDmg = { id: number; x: number; y: number; dx: number; v: number; crit: boolean; clash: boolean };
type Beam = { id: number; x1: number; y1: number; x2: number; y2: number; color: string; born: number };
type Particle = { id: number; x: number; y: number; dx: number; dy: number; color: string };
type StatOpt = { id: string; label: string; icon: string; desc: string; apply: (h: Hero[]) => Hero[] };

let _did = 0, _bid = 0, _pid = 0;

// ─── Battle Arena Background ────────────────────────────────────────────────
function StarField() {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; dur: number; delay: number }[]>([]);
  const [wisps, setWisps] = useState<{ id: number; x: number; size: number; dur: number; delay: number }[]>([]);
  useEffect(() => {
    setStars(Array.from({ length: 35 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 70,
      size: 1 + Math.random() * 2, dur: 4 + Math.random() * 7, delay: Math.random() * 6,
    })));
    setWisps(Array.from({ length: 6 }, (_, i) => ({
      id: i, x: 10 + Math.random() * 80, size: 40 + Math.random() * 60,
      dur: 6 + Math.random() * 8, delay: Math.random() * 5,
    })));
  }, []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Deep starfield */}
      {stars.map(s => (
        <motion.div key={s.id} className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.08, 0.5, 0.08], scale: [1, 1.4, 1] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }} />
      ))}
      {/* Hex grid overlay */}
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='48'%3E%3Cpath d='M28 4 L52 18 L52 30 L28 44 L4 30 L4 18 Z' fill='none' stroke='rgba(155,48,255,0.06)' stroke-width='0.8'/%3E%3C/svg%3E")`,
        backgroundSize: "56px 48px",
      }} />
      {/* Ground terrain glow */}
      <div className="absolute bottom-0 left-0 right-0" style={{
        height: "38%",
        background: "linear-gradient(to top,rgba(100,20,180,0.18) 0%,rgba(60,10,120,0.08) 50%,transparent 100%)",
      }} />
      {/* Left/right side ambience */}
      <div className="absolute top-0 left-0 bottom-0" style={{ width: "25%",
        background: "linear-gradient(to right,rgba(0,150,255,0.04),transparent)" }} />
      <div className="absolute top-0 right-0 bottom-0" style={{ width: "25%",
        background: "linear-gradient(to left,rgba(255,50,150,0.04),transparent)" }} />
      {/* Ground line */}
      <div className="absolute left-4 right-4" style={{
        bottom: "18%", height: 1,
        background: "linear-gradient(90deg,transparent,rgba(155,48,255,0.22),rgba(100,200,255,0.18),rgba(155,48,255,0.22),transparent)",
      }} />
      {/* Fog wisps near ground */}
      {wisps.map(w => (
        <motion.div key={w.id} className="absolute rounded-full"
          style={{
            bottom: "14%", left: `${w.x}%`, width: w.size, height: w.size * 0.4,
            background: "radial-gradient(ellipse,rgba(155,48,255,0.07) 0%,transparent 70%)",
            transform: "translateX(-50%)",
          }}
          animate={{ opacity: [0, 0.8, 0], scale: [0.8, 1.2, 0.8], x: [-10, 10, -10] }}
          transition={{ duration: w.dur, delay: w.delay, repeat: Infinity, ease: "easeInOut" }} />
      ))}
      {/* Central arena glow */}
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ width: 320, height: 200, left: "50%", top: "55%", marginLeft: -160, marginTop: -100,
          background: "radial-gradient(ellipse,rgba(155,48,255,0.06) 0%,transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
    </div>
  );
}

// ─── Sounds ──────────────────────────────────────────────────────────────────
function useSounds() {
  const ctxRef = useRef<AudioContext | null>(null);
  const getCtx = () => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  };
  return useRef({
    hit() {
      try {
        const c = getCtx(); if (!c) return;
        const o = c.createOscillator(), g = c.createGain();
        o.connect(g); g.connect(c.destination); o.type = "sawtooth";
        o.frequency.setValueAtTime(180, c.currentTime);
        o.frequency.exponentialRampToValueAtTime(60, c.currentTime + 0.07);
        g.gain.setValueAtTime(0.09, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.09);
        o.start(); o.stop(c.currentTime + 0.1);
      } catch { /**/ }
    },
    crit() {
      try {
        const c = getCtx(); if (!c) return;
        [420, 650, 960].forEach((f, i) => {
          const o = c.createOscillator(), g = c.createGain();
          o.connect(g); g.connect(c.destination); o.type = "sine"; o.frequency.value = f;
          const t = c.currentTime + i * 0.055;
          g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.09, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
          o.start(t); o.stop(t + 0.22);
        });
      } catch { /**/ }
    },
    kill() {
      try {
        const c = getCtx(); if (!c) return;
        const o = c.createOscillator(), g = c.createGain();
        o.connect(g); g.connect(c.destination); o.type = "square";
        o.frequency.setValueAtTime(440, c.currentTime);
        o.frequency.exponentialRampToValueAtTime(880, c.currentTime + 0.06);
        g.gain.setValueAtTime(0.07, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
        o.start(); o.stop(c.currentTime + 0.15);
      } catch { /**/ }
    },
    skill() {
      try {
        const c = getCtx(); if (!c) return;
        [800, 1200].forEach((f, i) => {
          const o = c.createOscillator(), g = c.createGain();
          o.connect(g); g.connect(c.destination); o.type = "triangle"; o.frequency.value = f;
          const t = c.currentTime + i * 0.07;
          g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
          o.start(t); o.stop(t + 0.17);
        });
      } catch { /**/ }
    },
    levelUp() {
      try {
        const c = getCtx(); if (!c) return;
        [523, 659, 784, 1047].forEach((f, i) => {
          const o = c.createOscillator(), g = c.createGain();
          o.connect(g); g.connect(c.destination); o.type = "sine"; o.frequency.value = f;
          const t = c.currentTime + i * 0.09;
          g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
          o.start(t); o.stop(t + 0.25);
        });
      } catch { /**/ }
    },
    ultimate() {
      try {
        const c = getCtx(); if (!c) return;
        const o = c.createOscillator(), g = c.createGain();
        o.connect(g); g.connect(c.destination); o.type = "sawtooth";
        o.frequency.setValueAtTime(110, c.currentTime);
        o.frequency.exponentialRampToValueAtTime(440, c.currentTime + 0.4);
        g.gain.setValueAtTime(0.15, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5);
        o.start(); o.stop(c.currentTime + 0.55);
      } catch { /**/ }
    },
  });
}

// ─── Monster Unit ────────────────────────────────────────────────────────────
function MonsterUnit({ m }: { m: Mon }) {
  const isBoss = m.isBoss;
  const circleW = isBoss ? 76 : m.size === "md" ? 56 : 46;
  const emojiSz = isBoss ? "text-5xl" : m.size === "md" ? "text-3xl" : "text-2xl";
  const hpPct = (m.hp / m.maxHp) * 100;
  const col = m.phase2 ? "#ff3300" : ELEMENT_CONFIG[m.element].color;
  const barW = isBoss ? 88 : circleW;
  return (
    <motion.div className="absolute flex flex-col items-center pointer-events-none select-none"
      style={{ left: `${m.posX}%`, top: m.displayY, transform: "translateX(-50%)" }}
      animate={m.hitFlash ? { x: [-5, 5, -4, 3, 0] } : {}}
      transition={{ duration: 0.14, ease: "easeOut" }}>

      {/* Boss name badge */}
      {isBoss && (
        <motion.div className="text-[9px] font-black mb-1 px-2 py-px rounded-full"
          style={{
            color: col, background: `${col}18`,
            border: `1px solid ${col}50`,
            textShadow: `0 0 8px ${col}`,
            boxShadow: `0 0 8px ${col}30`,
          }}
          animate={{ opacity: [0.85, 1, 0.85] }} transition={{ duration: 1.1, repeat: Infinity }}>
          {m.phase2 ? "💀 " : ""}{m.name}
        </motion.div>
      )}

      {/* HP bar */}
      <div className="mb-1.5 relative" style={{ width: barW }}>
        <div className="h-2 rounded-full overflow-hidden"
          style={{
            background: "rgba(0,0,0,0.65)",
            border: `1px solid ${col}30`,
            boxShadow: `inset 0 1px 2px rgba(0,0,0,0.8)`,
          }}>
          <motion.div className="h-full rounded-full"
            style={{
              background: hpPct > 55
                ? `linear-gradient(90deg,#22dd44,#39ff14)`
                : hpPct > 28
                  ? `linear-gradient(90deg,#ff8800,#ffcc00)`
                  : `linear-gradient(90deg,#cc0022,#ff3333)`,
              boxShadow: hpPct > 55 ? "0 0 4px #39ff1460" : hpPct > 28 ? "0 0 4px #ff880060" : "0 0 4px #ff333360",
            }}
            animate={{ width: `${hpPct}%` }} transition={{ duration: 0.14 }} />
          {/* HP segment markers */}
          {[25, 50, 75].map(p => (
            <div key={p} className="absolute top-0 bottom-0 w-px"
              style={{ left: `${p}%`, background: "rgba(255,255,255,0.12)" }} />
          ))}
        </div>
        {isBoss && (
          <div className="text-center text-[7px] font-bold mt-0.5" style={{ color: col }}>
            {m.hp.toLocaleString()} / {m.maxHp.toLocaleString()}
          </div>
        )}
      </div>

      {/* Main unit puck */}
      <motion.div className="relative flex items-center justify-center rounded-full"
        style={{
          width: circleW, height: circleW,
          background: `radial-gradient(circle at 38% 28%, ${col}20, rgba(5,2,18,0.96))`,
          border: `2.5px solid ${col}${m.phase2 ? "dd" : "70"}`,
          boxShadow: [
            `0 0 ${isBoss ? 28 : 14}px ${col}${m.phase2 ? "aa" : "50"}`,
            `0 0 ${isBoss ? 50 : 24}px ${col}${m.phase2 ? "44" : "18"}`,
            `inset 0 1px 0 rgba(255,255,255,0.12)`,
            `0 4px 16px rgba(0,0,0,0.8)`,
          ].join(","),
        }}
        animate={m.hitFlash
          ? { filter: ["brightness(1)", "brightness(3.5) saturate(2)", "brightness(1)"], scale: [1, 1.14, 1] }
          : { y: [0, isBoss ? -6 : -3, 0] }
        }
        transition={m.hitFlash
          ? { duration: 0.18 }
          : { duration: isBoss ? 1.8 : 2.3, repeat: Infinity, ease: "easeInOut" }
        }>
        {/* Inner radial highlight */}
        <div className="absolute inset-0 rounded-full"
          style={{ background: `radial-gradient(circle at 35% 25%, ${col}18 0%, transparent 65%)` }} />
        {/* Bottom shadow */}
        <div className="absolute bottom-0 left-2 right-2 h-2 rounded-full"
          style={{ background: `radial-gradient(ellipse, ${col}30, transparent)`, filter: "blur(3px)" }} />

        <span className={emojiSz} style={{
          position: "relative", zIndex: 1,
          filter: `drop-shadow(0 0 ${isBoss ? 12 : 6}px ${col}${isBoss ? "cc" : "99"})`
        }}>
          {m.emoji}
        </span>

        {/* Phase 2 ring */}
        {m.phase2 && (
          <motion.div className="absolute -inset-1.5 rounded-full"
            style={{ border: "2px solid #ff3300", boxShadow: "0 0 14px #ff330066, inset 0 0 10px #ff330022" }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.04, 1] }}
            transition={{ duration: 0.35, repeat: Infinity }} />
        )}
      </motion.div>

      {/* Element + level badge */}
      <div className="flex items-center gap-1 mt-1">
        <div className="text-[9px] rounded-full px-1.5 py-px font-bold"
          style={{
            background: `${col}20`,
            border: `1px solid ${col}40`,
            color: col,
            fontSize: 9,
          }}>
          {ELEMENT_CONFIG[m.element].emoji}
        </div>
        {!isBoss && (
          <div className="text-[7px] text-[#6b7a99] truncate max-w-[44px]">{m.name}</div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Damage float ────────────────────────────────────────────────────────────
function FloatDmgs({ items }: { items: FloatDmg[] }) {
  return <>
    {items.map(d => (
      <motion.div key={d.id} className="absolute pointer-events-none z-30 select-none flex flex-col items-center"
        style={{ left: d.x + d.dx - 20, top: d.y, width: 40 }}
        initial={{ opacity: 1, y: 0, scale: d.crit ? 0.4 : 0.7 }}
        animate={{ opacity: 0, y: d.crit ? -80 : -55, scale: d.crit || d.clash ? 1.4 : 1.0 }}
        transition={{ duration: d.crit ? 1.3 : d.clash ? 1.2 : 0.85, ease: "easeOut" }}>
        {/* Starburst ring for crits */}
        {d.crit && (
          <motion.div className="absolute inset-0 rounded-full"
            style={{ background: "radial-gradient(circle,rgba(255,215,0,0.35),transparent 70%)", width: 50, height: 50, left: -5, top: -5 }}
            initial={{ scale: 0.2, opacity: 1 }} animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }} />
        )}
        <span style={{
          fontFamily: "'Cinzel', serif",
          fontWeight: 900,
          fontSize: d.clash ? 18 : d.crit ? 22 : 13,
          color: d.clash ? "#ff9900" : d.crit ? "#ffe566" : "#ff5566",
          textShadow: d.clash
            ? "0 0 8px #ff6600,0 0 20px #ff4400,0 2px 4px rgba(0,0,0,0.9)"
            : d.crit
              ? "0 0 10px #ffd700,0 0 24px #ffaa00,0 0 40px #ff880080,0 2px 4px rgba(0,0,0,0.9)"
              : "0 0 6px #ff2233,0 1px 3px rgba(0,0,0,0.9)",
          lineHeight: 1,
          letterSpacing: d.crit ? "-0.5px" : 0,
        }}>
          {d.clash ? `⚡${d.v}` : d.crit ? `CRIT! ${d.v}` : `-${d.v}`}
        </span>
        {d.crit && (
          <span style={{ fontSize: 9, color: "#ffd70099", fontWeight: 700, marginTop: -2 }}>CRITICAL</span>
        )}
      </motion.div>
    ))}
  </>;
}

// ─── Particle burst ──────────────────────────────────────────────────────────
function ParticleBurst({ items }: { items: Particle[] }) {
  return <>
    {items.map(p => {
      const big = p.id % 3 === 0;
      return (
        <motion.div key={p.id} className="absolute rounded-full pointer-events-none z-25"
          style={{
            left: p.x, top: p.y,
            width: big ? 8 : 5, height: big ? 8 : 5,
            background: p.color,
            boxShadow: `0 0 ${big ? 8 : 4}px ${p.color}, 0 0 ${big ? 16 : 8}px ${p.color}60`,
          }}
          animate={{ x: p.dx * (big ? 60 : 45), y: p.dy * (big ? 60 : 45), opacity: 0, scale: 0 }}
          transition={{ duration: big ? 0.7 : 0.5, ease: "easeOut" }} />
      );
    })}
  </>;
}

// ─── Attack beam ─────────────────────────────────────────────────────────────
function BeamSvg({ b }: { b: Beam }) {
  const DURATION = 0.38;
  const id = `bg-${b.id}`;
  // bullet: animated circle traveling from (x1,y1) to (x2,y2)
  return (
    <>
      {/* SVG trail line */}
      <svg className="absolute inset-0 pointer-events-none z-10" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          <linearGradient id={id} x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={b.color} stopOpacity="0.9" />
            <stop offset="60%" stopColor={b.color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={b.color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.line
          x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2}
          stroke={`url(#${id})`} strokeWidth={2.5} strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0.9 }}
          animate={{ pathLength: [0, 1, 1], opacity: [0.9, 0.7, 0] }}
          transition={{ duration: DURATION, times: [0, 0.4, 1] }}
          style={{ filter: `drop-shadow(0 0 4px ${b.color})` }}
        />
      </svg>
      {/* Traveling bullet dot */}
      <motion.div className="absolute pointer-events-none z-15 rounded-full"
        style={{
          left: b.x1 - 6, top: b.y1 - 6, width: 12, height: 12,
          background: b.color,
          boxShadow: `0 0 10px ${b.color}, 0 0 20px ${b.color}99`,
        }}
        animate={{ left: b.x2 - 6, top: b.y2 - 6, opacity: [0, 1, 1, 0], scale: [0.6, 1.2, 0.9, 0] }}
        transition={{ duration: DURATION, ease: "easeIn", times: [0, 0.1, 0.75, 1] }} />
    </>
  );
}

function Beams({ items }: { items: Beam[] }) {
  return <>{items.map(b => <BeamSvg key={b.id} b={b} />)}</>;
}

// ─── HP spring bar ────────────────────────────────────────────────────────────
function HpSpring({ pct, color }: { pct: number; color: string }) {
  const sp = useSpring(pct, { stiffness: 120, damping: 20 });
  useEffect(() => { sp.set(pct); }, [pct, sp]);
  const w = useTransform(sp, v => `${Math.max(0, v)}%`);
  return <motion.div className="h-full rounded-full" style={{ width: w, background: color }} />;
}

// ─── Skill button with radial cooldown ───────────────────────────────────────
function SkillBtn({ skill, hero, cd, onUse }: { skill: Skill; hero: Hero; cd: number; onUse: () => void }) {
  const ready = cd <= 0;
  const col = ELEMENT_CONFIG[hero.element].color;
  const cdPct = ready ? 0 : Math.min(1, cd / skill.cooldown);
  return (
    <motion.button onClick={onUse} disabled={!ready}
      className="flex flex-col items-center gap-0.5 flex-shrink-0"
      whileTap={ready ? { scale: 0.82 } : {}}
      animate={ready ? { boxShadow: [`0 0 0px ${col}00`, `0 0 12px ${col}88`, `0 0 0px ${col}00`] } : {}}
      transition={ready ? { duration: 1.6, repeat: Infinity } : {}}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl relative overflow-hidden"
        style={{
          background: ready ? `radial-gradient(circle at 50% 30%,${col}30,rgba(8,4,20,0.95))` : "rgba(8,4,20,0.7)",
          border: `1.5px solid ${ready ? col + "70" : "rgba(255,255,255,0.07)"}`,
          boxShadow: ready ? `0 0 10px ${col}30,inset 0 1px 0 rgba(255,255,255,0.08)` : "none",
        }}>
        {!ready && (
          <>
            <div className="absolute inset-0 rounded-xl" style={{
              background: `conic-gradient(rgba(0,0,0,0.75) ${cdPct * 360}deg,transparent ${cdPct * 360}deg)`,
            }} />
            <span className="absolute text-[11px] font-black text-white z-10">{Math.ceil(cd)}</span>
          </>
        )}
        <span style={{ opacity: ready ? 1 : 0.25, fontSize: 18 }}>{skill.icon}</span>
      </div>
      <span className="text-[8px] text-[#6b7a99] w-11 text-center leading-tight truncate">{skill.name}</span>
    </motion.button>
  );
}

// ─── Level-up modal ──────────────────────────────────────────────────────────
function buildOpts(): StatOpt[] {
  const all: StatOpt[] = [
    { id: "atk", label: "Sức Mạnh", icon: "⚔️", desc: "+15% ATK toàn đội", apply: hs => hs.map(h => ({ ...h, atk: Math.floor(h.atk * 1.15) })) },
    { id: "hp",  label: "Thể Lực",  icon: "❤️", desc: "+20% HP toàn đội",  apply: hs => hs.map(h => ({ ...h, maxHp: Math.floor(h.maxHp * 1.2), hp: Math.floor(h.hp * 1.2) })) },
    { id: "def", label: "Phòng Thủ",icon: "🛡️", desc: "+20% DEF toàn đội", apply: hs => hs.map(h => ({ ...h, def: Math.floor((h.def ?? 0) * 1.2) })) },
    { id: "heal",label: "Hồi Máu",  icon: "💚", desc: "Hồi 35% HP tất cả", apply: hs => hs.map(h => ({ ...h, hp: Math.min(h.maxHp, h.hp + Math.floor(h.maxHp * 0.35)) })) },
    { id: "rev", label: "Triệu Hồi",icon: "✨", desc: "Hồi sinh tướng chết 50% HP", apply: hs => hs.map(h => h.hp <= 0 ? { ...h, hp: Math.floor(h.maxHp * 0.5) } : h) },
    { id: "crit",label: "Chí Mạng", icon: "🎯", desc: "+10% tỉ lệ crit",   apply: hs => hs },
    { id: "gold",label: "Tài Lộc",  icon: "🟡", desc: "+50% Gold từ quái", apply: hs => hs },
    { id: "spd", label: "Tốc Chiến",icon: "⚡", desc: "Giảm cooldown -20%", apply: hs => hs },
  ];
  return [...all].sort(() => Math.random() - 0.5).slice(0, 3);
}
function LvModal({ level, opts, onPick }: { level: number; opts: StatOpt[]; onPick: (o: StatOpt) => void }) {
  return (
    <motion.div className="absolute inset-0 z-50 flex items-center justify-center px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
      <motion.div className="relative w-full max-w-xs glass-card gold-border p-5 text-center"
        initial={{ scale: 0.65, y: 40 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", damping: 13, stiffness: 200 }}>
        <motion.div className="text-5xl mb-2" animate={{ rotate: [0, -12, 12, -6, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.7 }}>⬆️</motion.div>
        <h2 className="font-cinzel font-black text-xl mb-0.5" style={{ color: "#ffd700", textShadow: "0 0 24px #ffd700" }}>THĂNG CẤP!</h2>
        <p className="text-[#a0a8c0] text-xs mb-4">Level <span className="text-[#ffd700] font-bold">{level}</span> — Chọn 1 phần thưởng</p>
        <div className="space-y-2">
          {opts.map((o, i) => (
            <motion.button key={o.id} className="w-full glass-card p-3 flex items-center gap-3 text-left rounded-xl"
              style={{ border: "1px solid rgba(255,215,0,0.15)" }}
              initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
              whileHover={{ borderColor: "rgba(255,215,0,0.5)", scale: 1.02 }} whileTap={{ scale: 0.96 }}
              onClick={() => onPick(o)}>
              <span className="text-2xl flex-shrink-0">{o.icon}</span>
              <div className="flex-1"><div className="font-bold text-sm text-[#f0e6c8]">{o.label}</div><div className="text-[10px] text-[#6b7a99]">{o.desc}</div></div>
              <span className="text-[#ffd700]">▶</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Name input modal ─────────────────────────────────────────────────────────
function NameModal({ current, onSave }: { current: string; onSave: (n: string) => void }) {
  const [val, setVal] = useState(current === "Chiến Thần" ? "" : current);
  return (
    <motion.div className="fixed inset-0 z-[60] flex items-center justify-center px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="absolute inset-0 bg-black/80" onClick={() => onSave(val || current)} />
      <motion.div className="relative glass-card gold-border p-6 w-full max-w-xs text-center"
        initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
        <div className="text-4xl mb-3">👑</div>
        <h3 className="font-cinzel font-black text-lg mb-1" style={{ color: "#ffd700" }}>Nhập Danh Hiệu</h3>
        <p className="text-[10px] text-[#6b7a99] mb-4">Tên sẽ được lưu lại vĩnh viễn</p>
        <input className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,215,0,0.3)] rounded-xl px-4 py-3 text-center text-[#f0e6c8] font-bold text-sm outline-none focus:border-[rgba(255,215,0,0.7)] mb-4"
          placeholder="Tên của bạn..."
          value={val} onChange={e => setVal(e.target.value)}
          maxLength={12} autoFocus
          onKeyDown={e => e.key === "Enter" && onSave(val || current)} />
        <button className="w-full py-3 rounded-xl font-cinzel font-black text-sm"
          style={{ background: "linear-gradient(135deg,#b8860b,#ffd700)", color: "#05080f" }}
          onClick={() => onSave(val || current)}>
          Xác Nhận ✓
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Battle ─────────────────────────────────────────────────────────────
function BattleContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { state, addExp, addGold, completeStage, setName, tickDailyQuest } = useGame();

  const stageId   = params.get("stage") ?? "s1_1";
  const difficulty = (params.get("difficulty") ?? "NORMAL") as Difficulty;
  const diffMult  = GAME_CONFIG.DIFFICULTY_MULTIPLIER[difficulty];

  // State
  const [gs, setGs]         = useState<GameSpeed>(state.player.gameSpeed);
  const [progress, setProg] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [monsters, setMonsters] = useState<Mon[]>([]);
  const [heroes, setHeroes] = useState<Hero[]>(() =>
    state.heroes.filter(h => h.isUnlocked).slice(0, 5).map(h => ({ ...h }))
  );
  const [cds, setCds]       = useState<Record<string, number>>({});
  const [boss1, setBoss1]   = useState(false);
  const [boss2, setBoss2]   = useState(false);
  const [result, setResult] = useState<"WIN" | "LOSE" | null>(null);
  const [stars, setStars]   = useState(0);
  const [log, setLog]       = useState<string[]>([]);
  const [kills, setKills]   = useState(0);
  const [floats, setFloats] = useState<FloatDmg[]>([]);
  const [beams, setBeams]   = useState<Beam[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [goldMult, setGoldMult] = useState(1);
  const [lvQueue, setLvQueue] = useState<number[]>([]);
  const [showLv, setShowLv] = useState(false);
  const [lvOpts, setLvOpts] = useState<StatOpt[]>([]);
  const [curLv, setCurLv]   = useState(0);
  const [combo, setCombo]   = useState(0);
  const [ult, setUlt]       = useState(0);
  const [ultActive, setUltActive] = useState(false);
  const [shake, setShake]   = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [bossExplosion, setBossExplosion] = useState<{ x: number; y: number; color: string } | null>(null);

  // Refs
  const rafRef    = useRef<number>(0);
  const lastTick  = useRef(0);
  const waveN     = useRef(0);
  const aliveCountRef = useRef(0); // tracks live monster count for wave gating
  const prevLv    = useRef(state.player.level);
  const rewards   = useRef<{ exp: number; gold: number }[]>([]);
  const comboTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fieldRef  = useRef<HTMLDivElement>(null);
  const dims      = useRef({ w: 340, h: 500 });
  const HERO_FRAC = 0.82;
  const snd       = useSounds(); // stable ref

  // Track field dimensions
  useEffect(() => {
    if (!fieldRef.current) return;
    const obs = new ResizeObserver(([e]) => {
      dims.current = { w: e.contentRect.width, h: e.contentRect.height };
    });
    obs.observe(fieldRef.current);
    dims.current = { w: fieldRef.current.offsetWidth, h: fieldRef.current.offsetHeight };
    return () => obs.disconnect();
  }, []);

  // Process EXP/gold rewards safely (outside setState)
  useEffect(() => {
    const iv = setInterval(() => {
      const q = rewards.current.splice(0);
      if (!q.length) return;
      const exp  = q.reduce((s, r) => s + r.exp, 0);
      const gold = q.reduce((s, r) => s + r.gold, 0);
      if (exp  > 0) addExp(exp);
      if (gold > 0) addGold(gold);
    }, 150);
    return () => clearInterval(iv);
  }, [addExp, addGold]);

  const addLog = useCallback((msg: string) =>
    setLog(p => [msg, ...p.slice(0, 5)]), []);

  const triggerShake = useCallback(() => {
    setShake(true); setTimeout(() => setShake(false), 320);
  }, []);

  const spawnParticles = useCallback((x: number, y: number, color: string) => {
    const ps: Particle[] = Array.from({ length: 7 }, () => ({
      id: ++_pid, x, y,
      dx: (Math.random() - 0.5) * 2, dy: -(0.5 + Math.random()),
      color,
    }));
    setParticles(p => [...p.slice(-20), ...ps]);
    setTimeout(() => setParticles(p => p.filter(par => !ps.find(n => n.id === par.id))), 600);
  }, []);

  const spawnBossExplosion = useCallback((x: number, y: number, color: string) => {
    // Massive burst of particles for boss death
    const ps: Particle[] = Array.from({ length: 28 }, () => ({
      id: ++_pid, x, y,
      dx: (Math.random() - 0.5) * 4, dy: -(0.3 + Math.random() * 2.5),
      color: [color, '#ffd700', '#ff4400', '#ffffff'][Math.floor(Math.random() * 4)],
    }));
    setParticles(p => [...p.slice(-40), ...ps]);
    setBossExplosion({ x, y, color });
    setTimeout(() => setBossExplosion(null), 900);
    setTimeout(() => setParticles(p => p.filter(par => !ps.find(n => n.id === par.id))), 1200);
  }, []);

  const fireBeam = useCallback((x1: number, y1: number, x2: number, y2: number, color: string) => {
    const id = ++_bid;
    setBeams(p => [...p.slice(-12), { id, x1, y1, x2, y2, color, born: Date.now() }]);
    setTimeout(() => setBeams(p => p.filter(b => b.id !== id)), 360);
  }, []);

  const pushDmg = useCallback((x: number, y: number, v: number, crit: boolean, clash: boolean, monColor: string) => {
    const id = ++_did;
    setFloats(p => [...p.slice(-12), { id, x, y, dx: (Math.random() - 0.5) * 20, v, crit, clash }]);
    setTimeout(() => setFloats(p => p.filter(d => d.id !== id)), 1400);
    if (crit || clash) {
      triggerShake();
      spawnParticles(x, y, clash ? "#ff8800" : "#ffd700");
      snd.current.crit();
    } else {
      snd.current.hit();
    }
  }, [triggerShake, spawnParticles, snd]);

  const spawnWave = useCallback((n: number) => {
    const keys: Array<keyof typeof MONSTER_TEMPLATES> = ["goblin", "bat", "skeleton", "thunder_wolf", "water_snake"];
    // Smaller wave sizes: wave 1 = 2, wave 5 = 3, wave 10 = 4, max 5 (was 3+n/2 up to 10)
    const sz = Math.min(2 + Math.floor(n / 4), 5);
    const wave = Array.from({ length: sz }, (_, i) => {
      const k = keys[Math.floor(Math.random() * keys.length)];
      const m = createMonster(k, false, diffMult);
      return { ...m, posX: 8 + (i / Math.max(sz - 1, 1)) * 84, displayY: -110 };
    });
    setMonsters(p => {
      const surviving = p.filter(m => m.alive);
      aliveCountRef.current = surviving.length + wave.length;
      return [...surviving, ...wave];
    });
    addLog(`🌊 Wave ${n} — ${sz} kẻ địch!`);
  }, [diffMult, addLog]);

  const spawnBoss = useCallback((phase: 1 | 2) => {
    const key: keyof typeof MONSTER_TEMPLATES = phase === 1 ? "forest_king" : "void_king";
    const boss = createMonster(key, true, diffMult * 1.5);
    boss.posX = 50; boss.displayY = -130;
    setMonsters(p => [...p.filter(m => m.alive), boss]);
    addLog(`👹 BOSS ${phase === 1 ? "ĐẦU" : "CUỐI"}: ${boss.name}!`);
  }, [diffMult, addLog]);

  // Initial wave + tick daily quests
  useEffect(() => {
    spawnWave(1);
    waveN.current = 1;
    tickDailyQuest('battles', 1);
  }, []); // eslint-disable-line

  // RAF loop (movement + cooldown tick)
  useEffect(() => {
    if (result || showLv) return;
    const tick = (now: number) => {
      if (!lastTick.current) lastTick.current = now;
      const raw = Math.min((now - lastTick.current) / 1000, 0.05);
      lastTick.current = now;
      const dt = raw * gs;
      setElapsed(p => { const n = p + dt; setProg(Math.min((n / GAME_CONFIG.BATTLE_DURATION) * 100, 100)); return n; });
      setMonsters(p => p.map(m => {
        if (!m.alive) return m;
        const isP2 = m.isBoss && m.hp / m.maxHp < 0.3 && !m.phase2;
        const ny = m.displayY + (isP2 ? m.speed * 2 : m.speed) * dt * 60;
        if (ny >= dims.current.h * HERO_FRAC) {
          setHeroes(hp => {
            const alive = hp.filter(h => h.hp > 0);
            if (!alive.length) return hp;
            if (m.phase2) return hp.map(h => h.hp > 0 ? { ...h, hp: Math.max(0, h.hp - Math.max(1, Math.floor(m.atk * 0.5))) } : h);
            const tgt = alive[Math.floor(Math.random() * alive.length)];
            const dmg = Math.max(1, Math.floor(m.atk) - Math.floor(((tgt as Hero & { def?: number }).def ?? 0) * 0.3));
            return hp.map(h => h.id === tgt.id ? { ...h, hp: Math.max(0, h.hp - dmg) } : h);
          });
          return { ...m, phase2: isP2 || m.phase2, displayY: -110, posX: 10 + Math.random() * 80, hitFlash: false };
        }
        return { ...m, phase2: isP2 || m.phase2, displayY: ny };
      }));
      setCds(p => { const n: Record<string, number> = {}; for (const k in p) n[k] = Math.max(0, p[k] - dt); return n; });
      rafRef.current = requestAnimationFrame(tick);
    };
    lastTick.current = 0;
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [result, showLv, gs]);

  // Wave spawner — only spawn next wave when field is mostly clear (≤ 2 alive)
  useEffect(() => {
    if (result || showLv) return;
    const iv = setInterval(() => {
      if (waveN.current >= GAME_CONFIG.WAVES_PER_STAGE) return;
      if (aliveCountRef.current > 2) return; // wait until field is clear
      waveN.current++;
      spawnWave(waveN.current);
    }, (GAME_CONFIG.WAVE_INTERVAL * 1000) / gs);
    return () => clearInterval(iv);
  }, [result, showLv, gs, spawnWave]);

  // Boss triggers
  useEffect(() => {
    if (progress >= GAME_CONFIG.BOSS1_AT && !boss1) { setBoss1(true); spawnBoss(1); }
    if (progress >= GAME_CONFIG.BOSS2_AT && !boss2) { setBoss2(true); spawnBoss(2); }
  }, [progress, boss1, boss2, spawnBoss]);

  // Auto-attack (snd accessed via ref → NOT in deps array → interval never resets)
  useEffect(() => {
    if (result || showLv) return;
    const iv = setInterval(() => {
      setMonsters(prev => {
        const alive = prev.filter(m => m.alive);
        if (!alive.length) return prev;
        const tgt = alive.reduce((a, b) => a.displayY > b.displayY ? a : b);
        const ah = heroes.filter(h => h.hp > 0);
        if (!ah.length) return prev;
        const ph = ah[0];
        const clash = elementMult(ph.element, tgt.element);
        const isClash = clash > 1;
        const total = ah.reduce((s, h) => s + h.atk, 0);
        const crit = Math.random() < 0.22;
        const comboMult = combo >= 3 ? 1.5 : 1;
        const dmg = Math.max(1, Math.floor(total * 0.18 * (crit ? 2 : 1) * clash * comboMult));
        const { w, h } = dims.current;
        const heroBaseY = h * HERO_FRAC - 20;
        const mx = (tgt.posX / 100) * w;
        const my = Math.max(15, tgt.displayY + 20);
        // Fire beam from each alive hero
        ah.forEach((hero, hIdx) => {
          const hx = (w / (ah.length + 1)) * (hIdx + 1);
          fireBeam(hx, heroBaseY, mx, my, ELEMENT_CONFIG[hero.element].color);
        });
        pushDmg(mx, my, dmg, crit, isClash, ELEMENT_CONFIG[tgt.element].color);
        if (isClash) addLog(`⚡ ELEMENT CLASH! ${ELEMENT_CONFIG[ph.element].emoji}→${ELEMENT_CONFIG[tgt.element].emoji} ×1.5!`);
        const nhp = tgt.hp - dmg;
        if (nhp <= 0) {
          if (comboTimer.current) clearTimeout(comboTimer.current);
          setCombo(c => { const nc = c + 1; comboTimer.current = setTimeout(() => setCombo(0), 2000); return nc; });
          setKills(k => { tickDailyQuest('kills', 1); return k + 1; });
          setUlt(g => Math.min(100, g + (tgt.isBoss ? 20 : 5)));
          rewards.current.push({ exp: tgt.reward.exp, gold: Math.floor(tgt.reward.gold * goldMult) });
          if (tgt.isBoss) {
            snd.current.ultimate();
            spawnBossExplosion(mx, my, ELEMENT_CONFIG[tgt.element].color);
            addLog(`💥 BOSS TIÊU DIỆT! ${tgt.name} +${tgt.reward.exp * 3}EXP!`);
            triggerShake();
          } else {
            snd.current.kill();
            spawnParticles(mx, my, ELEMENT_CONFIG[tgt.element].color);
            if (combo >= 2) addLog(`🔥 COMBO x${combo + 1}! +${Math.floor((comboMult - 1) * 100)}% DMG`);
            else addLog(`⚔️ ${tgt.name} tiêu diệt +${tgt.reward.exp}EXP`);
          }
        }
        const updated = prev.map(m => m.instanceId === tgt.instanceId
          ? { ...m, hp: Math.max(0, nhp), alive: nhp > 0, hitFlash: nhp > 0 }
          : m);
        aliveCountRef.current = updated.filter(m => m.alive).length;
        return updated;
      });
      // clear hit flash
      setTimeout(() => setMonsters(p => p.map(m => ({ ...m, hitFlash: false }))), 180);
    }, 600 / gs);
    return () => clearInterval(iv);
  }, [result, showLv, heroes, gs, goldMult, combo, fireBeam, pushDmg, addLog, spawnParticles, spawnBossExplosion, triggerShake]); // snd via ref, no dep needed

  // Ultimate
  const fireUltimate = useCallback(() => {
    if (ult < 100 || ultActive) return;
    setUltActive(true); setUlt(0);
    snd.current.ultimate();
    setMonsters(p => {
      aliveCountRef.current = 0;
      return p.map(m => {
        if (m.alive) {
          rewards.current.push({ exp: m.reward.exp, gold: Math.floor(m.reward.gold * goldMult) });
          setKills(k => k + 1);
        }
        return { ...m, alive: false, hp: 0 };
      });
    });
    addLog("💫 ULTIMATE! Quét sạch kẻ địch!");
    setTimeout(() => setUltActive(false), 2200);
  }, [ult, ultActive, goldMult, addLog, snd]);

  // Level-up detection
  useEffect(() => {
    if (state.player.level > prevLv.current) {
      const gained = state.player.level - prevLv.current;
      setLvQueue(q => [...q, ...Array.from({ length: gained }, (_, i) => prevLv.current + i + 1)]);
      prevLv.current = state.player.level;
    }
  }, [state.player.level]);

  useEffect(() => {
    if (!showLv && lvQueue.length > 0) {
      const [next, ...rest] = lvQueue;
      setCurLv(next); setLvOpts(buildOpts()); setShowLv(true); setLvQueue(rest);
      snd.current.levelUp();
    }
  }, [showLv, lvQueue, snd]);

  const pickLv = (o: StatOpt) => {
    setHeroes(p => o.apply(p));
    if (o.id === "gold") setGoldMult(g => g + 0.5);
    addLog(`🌟 ${o.label}: ${o.desc}`);
    setShowLv(false);
  };

  // Skill use
  const useSkill = useCallback((heroId: string, skill: Skill) => {
    const key = `${heroId}_${skill.id}`;
    if ((cds[key] ?? 0) > 0) return;
    setCds(p => ({ ...p, [key]: skill.cooldown }));
    const hero = heroes.find(h => h.id === heroId);
    if (skill.damage) {
      setMonsters(prev => {
        const alive = prev.filter(m => m.alive);
        if (!alive.length) return prev;
        const tgt = alive[0];
        const nhp = tgt.hp - skill.damage!;
        if (nhp <= 0) { rewards.current.push({ exp: tgt.reward.exp, gold: tgt.reward.gold }); setKills(k => k + 1); setUlt(g => Math.min(100, g + 8)); }
        return prev.map(m => m.instanceId === tgt.instanceId ? { ...m, hp: Math.max(0, nhp), alive: nhp > 0, hitFlash: nhp > 0 } : m);
      });
    }
    if (skill.healPercent) {
      setHeroes(p => p.map(h => h.id === heroId ? { ...h, hp: Math.min(h.maxHp, h.hp + Math.floor(h.maxHp * (skill.healPercent! / 100))) } : h));
    }
    snd.current.skill();
    addLog(`✨ ${hero?.name} dùng ${skill.name}!`);
  }, [cds, heroes, addLog, snd]);

  // Auto-play: auto-use available skills every 2 seconds
  useEffect(() => {
    if (!autoPlay || result || showLv) return;
    const iv = setInterval(() => {
      heroes.filter(h => h.hp > 0).forEach(hero => {
        for (const skill of hero.skills) {
          const key = `${hero.id}_${skill.id}`;
          if (skill.cooldown > 0 && (cds[key] ?? 0) <= 0) {
            useSkill(hero.id, skill);
            break;
          }
        }
      });
    }, 2000 / gs);
    return () => clearInterval(iv);
  }, [autoPlay, result, showLv, heroes, cds, gs, useSkill]);

  // Win/Lose check
  useEffect(() => {
    if (result || showLv) return;
    if (heroes.every(h => h.hp <= 0)) { setResult("LOSE"); return; }
    if (progress >= 100 && monsters.filter(m => m.alive).length === 0) {
      const maxHp = heroes.reduce((s, h) => s + h.maxHp, 0);
      const curHp = heroes.reduce((s, h) => s + h.hp, 0);
      const hp = curHp / maxHp;
      const anyDead = heroes.some(h => h.hp <= 0);
      const ns = anyDead ? 1 : hp >= 0.8 ? 3 : 2;
      setStars(ns); setResult("WIN");
      addExp(150 * ns); addGold(100 * ns);
      completeStage(stageId, ns, elapsed);
    }
  }, [monsters, heroes, progress, result, showLv]); // eslint-disable-line

  const speedOpts: GameSpeed[] = [1, 1.5, 2];
  const aliveMons = monsters.filter(m => m.alive);
  const teamMax = heroes.reduce((s, h) => s + h.maxHp, 0);
  const teamCur = heroes.reduce((s, h) => s + h.hp, 0);
  const teamPct = teamMax > 0 ? (teamCur / teamMax) * 100 : 0;
  const ultReady = ult >= 100;

  return (
    <motion.div
      className="flex flex-col h-screen overflow-hidden select-none"
      style={{ background: "linear-gradient(180deg,#020810 0%,#0a0318 40%,#07010f 100%)" }}
      animate={shake ? { x: [-5, 5, -4, 4, -2, 0] } : {}}
      transition={shake ? { duration: 0.28, ease: "easeOut" } : {}}>

      {/* ── TOP HUD ── */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-1.5 flex-shrink-0">
        <button onClick={() => router.back()} className="text-[#6b7a99] text-xl w-6 flex-shrink-0">◀</button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-[10px] text-[#6b7a99]">ẢI {Math.floor(progress)}%</span>
              <span className="text-[10px] text-[#39ff14]">💀 {kills}</span>
              {combo >= 3 && (
                <motion.span className="text-[10px] font-black text-[#ff6600]"
                  animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 0.35 }}>
                  🔥×{combo}
                </motion.span>
              )}
            </div>
            <button onClick={() => setShowNameModal(true)}
              className="text-[10px] truncate max-w-[90px] font-bold"
              style={{ color: "#ffd700", textShadow: "0 0 8px #ffd70060" }}>
              👑 {state.player.name}
            </button>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden relative mb-0.5">
            <motion.div className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg,#4a9eff,#bf00ff,#ffd700)" }}
              animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
            <div className="absolute top-0 h-full w-px bg-[#ff4500]/50" style={{ left: "40%" }} />
            <div className="absolute top-0 h-full w-px bg-[#ff0066]/50" style={{ left: "80%" }} />
          </div>
          {/* HP bar */}
          <div className="h-1 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
            <HpSpring pct={teamPct} color={teamPct > 55 ? "#39ff14" : teamPct > 28 ? "#ffaa00" : "#ff3333"} />
          </div>
        </div>
        {/* Speed + Auto-play buttons */}
        <div className="flex gap-1 flex-shrink-0" suppressHydrationWarning>
          {speedOpts.map(s => (
            <button key={s} suppressHydrationWarning
              onClick={() => (state.player.speedUnlocked || s === 1) && setGs(s)}
              className="px-1.5 py-1 rounded text-[10px] font-bold"
              style={{
                background: gs === s ? "rgba(255,215,0,0.22)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${gs === s ? "rgba(255,215,0,0.55)" : "rgba(255,255,255,0.07)"}`,
                color: gs === s ? "#ffd700" : state.player.speedUnlocked || s === 1 ? "#6b7a99" : "#2a2a3a",
              }}>{s}x
            </button>
          ))}
          <button
            onClick={() => setAutoPlay(v => !v)}
            className="px-1.5 py-1 rounded text-[10px] font-bold"
            style={{
              background: autoPlay ? "rgba(57,255,20,0.18)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${autoPlay ? "rgba(57,255,20,0.5)" : "rgba(255,255,255,0.07)"}`,
              color: autoPlay ? "#39ff14" : "#6b7a99",
            }}>
            AUTO
          </button>
        </div>
      </div>

      {/* ── BATTLE FIELD ── */}
      <motion.div ref={fieldRef} className="relative mx-2 rounded-2xl overflow-hidden flex-1 min-h-0"
        style={{
          background: "linear-gradient(180deg,#010812 0%,#050120 35%,#080226 65%,#100330 100%)",
          border: "1px solid rgba(155,48,255,0.22)",
          boxShadow: "0 0 0 1px rgba(100,180,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 32px rgba(0,0,0,0.8)",
        }}>

        <StarField />

        {/* Ultimate flash overlay */}
        <AnimatePresence>
          {ultActive && (
            <motion.div className="absolute inset-0 z-40 pointer-events-none"
              initial={{ opacity: 0 }} animate={{ opacity: [0, 0.85, 0.5, 0.9, 0] }} exit={{ opacity: 0 }}
              transition={{ duration: 1.8 }}
              style={{ background: "radial-gradient(ellipse at center,#ffd700cc,#bf00ffaa,transparent)" }} />
          )}
        </AnimatePresence>

        {/* Battle log */}
        <div className="absolute top-2 left-2 right-2 z-20 pointer-events-none">
          <AnimatePresence>
            {log.slice(0, 3).map((l, i) => (
              <motion.div key={`${l}_${i}`} className="text-[10px] leading-tight"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 0.9 - i * 0.28 }} exit={{ opacity: 0 }}
                style={{ color: "#ffd700" }}>
                {l}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Monsters */}
        {aliveMons.map(m => <MonsterUnit key={m.instanceId} m={m} />)}

        {/* Beams */}
        <Beams items={beams} />

        {/* Damage floats */}
        <FloatDmgs items={floats} />

        {/* Particles */}
        <ParticleBurst items={particles} />

        {/* Boss death explosion ring */}
        <AnimatePresence>
          {bossExplosion && (
            <motion.div className="absolute pointer-events-none z-35 rounded-full"
              style={{
                left: bossExplosion.x - 80, top: bossExplosion.y - 80,
                width: 160, height: 160,
                background: `radial-gradient(circle, ${bossExplosion.color}cc 0%, ${bossExplosion.color}66 30%, transparent 70%)`,
              }}
              initial={{ scale: 0.2, opacity: 1 }}
              animate={{ scale: 3.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

        {/* Heroes row at bottom of field — TFT puck style */}
        <div className="absolute left-0 right-0 flex justify-center gap-3 px-3 pointer-events-none"
          style={{ bottom: 8 }}>
          {heroes.map((h, i) => {
            const hp = (h.hp / h.maxHp) * 100;
            const dead = h.hp <= 0;
            const col = ELEMENT_CONFIG[h.element].color;
            const clsCfg = CLASS_CONFIG[h.heroClass];
            return (
              <motion.div key={h.id} className="flex flex-col items-center gap-1"
                animate={!dead ? { y: [0, -4, 0] } : { opacity: 0.18, filter: "grayscale(1)" }}
                transition={!dead ? { duration: 2.2 + i * 0.28, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" } : {}}>
                {/* Puck outer ring + glow */}
                <div className="relative" style={{ width: 52, height: 52 }}>
                  {/* Outer aura ring */}
                  {!dead && (
                    <motion.div className="absolute -inset-1 rounded-full"
                      style={{ background: `conic-gradient(from 0deg, ${col}60, transparent, ${col}40, transparent, ${col}60)` }}
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 4 + i, repeat: Infinity, ease: "linear" }} />
                  )}
                  {/* Main circle */}
                  <div className="absolute inset-0 rounded-full flex items-center justify-center text-2xl"
                    style={{
                      background: dead ? "rgba(8,4,16,0.95)" : `radial-gradient(circle at 40% 30%, ${col}30, rgba(6,2,18,0.96))`,
                      border: `2px solid ${dead ? "rgba(255,255,255,0.06)" : col + "70"}`,
                      boxShadow: dead ? "none" : [
                        `0 0 16px ${col}55`,
                        `0 0 32px ${col}22`,
                        `inset 0 1px 0 rgba(255,255,255,0.12)`,
                        `0 4px 12px rgba(0,0,0,0.8)`,
                      ].join(","),
                    }}>
                    <span style={{ filter: dead ? "none" : `drop-shadow(0 0 6px ${col}cc)` }}>{h.emoji}</span>
                  </div>
                  {/* Class badge (bottom-right corner) */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px]"
                    style={{
                      background: `${clsCfg.color}22`,
                      border: `1px solid ${clsCfg.color}60`,
                      boxShadow: `0 0 4px ${clsCfg.color}50`,
                    }}>
                    {clsCfg.emoji}
                  </div>
                  {/* Element badge (top-left) */}
                  <div className="absolute -top-0.5 -left-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[7px]"
                    style={{
                      background: `${col}22`,
                      border: `1px solid ${col}50`,
                    }}>
                    {ELEMENT_CONFIG[h.element].emoji}
                  </div>
                </div>
                {/* HP bar under puck */}
                <div className="relative overflow-hidden rounded-full"
                  style={{
                    width: 52, height: 5,
                    background: "rgba(0,0,0,0.6)",
                    border: `1px solid ${dead ? "rgba(255,255,255,0.04)" : col + "30"}`,
                  }}>
                  <div className="h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${hp}%`,
                      background: hp > 55
                        ? `linear-gradient(90deg,#22cc44,#39ff14)`
                        : hp > 28
                          ? `linear-gradient(90deg,#ff8800,#ffcc00)`
                          : `linear-gradient(90deg,#cc0022,#ff3333)`,
                      boxShadow: hp > 55 ? "0 0 4px #39ff1460" : "none",
                    }} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Level-up overlay */}
        <AnimatePresence>
          {showLv && <LvModal level={curLv} opts={lvOpts} onPick={pickLv} />}
        </AnimatePresence>
      </motion.div>

      {/* ── BOTTOM PANEL ── */}
      <div className="flex-shrink-0 px-2 pt-1.5 pb-3">
        {/* Ultimate gauge + button */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-2 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg,#9b30ff,#ff00aa,#ffd700)", boxShadow: ultReady ? "0 0 8px #ffd700" : "none" }}
              animate={{ width: `${ult}%` }} transition={{ duration: 0.35 }} />
          </div>
          <motion.button onClick={fireUltimate} disabled={!ultReady}
            className="font-cinzel font-black text-[10px] px-3 py-1.5 rounded-lg flex-shrink-0"
            style={{
              background: ultReady ? "linear-gradient(135deg,#9b30ff,#ff00aa,#ffd700)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${ultReady ? "rgba(255,215,0,0.7)" : "rgba(255,255,255,0.07)"}`,
              color: ultReady ? "#fff" : "#2a2a3a",
            }}
            animate={ultReady ? { scale: [1, 1.04, 1], boxShadow: ["0 0 6px #ffd700", "0 0 22px #ffd700", "0 0 6px #ffd700"] } : {}}
            transition={ultReady ? { repeat: Infinity, duration: 0.8 } : {}}
            whileTap={ultReady ? { scale: 0.88 } : {}}>
            💫 ULTIMATE
          </motion.button>
        </div>

        {/* Skill bar */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          {heroes.filter(h => h.hp > 0).flatMap(hero =>
            hero.skills.map(skill => (
              <SkillBtn key={`${hero.id}_${skill.id}`} skill={skill} hero={hero}
                cd={cds[`${hero.id}_${skill.id}`] ?? 0} onUse={() => useSkill(hero.id, skill)} />
            ))
          )}
        </div>

        {/* Hero HP mini row */}
        <div className="grid grid-cols-5 gap-1 mt-1.5">
          {heroes.map(h => {
            const hp = (h.hp / h.maxHp) * 100;
            return (
              <div key={h.id} className="text-center">
                <div className="text-[11px]" style={{ color: CLASS_CONFIG[h.heroClass].color }}>{h.emoji}</div>
                <div className="h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden mt-0.5">
                  <div className="h-full rounded-full transition-all duration-200"
                    style={{ width: `${hp}%`, background: hp > 50 ? "#39ff14" : "#ff3333" }} />
                </div>
                <div className="text-[8px] text-[#6b7a99] mt-px truncate">{Math.floor(hp)}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── WIN / LOSE ── */}
      <AnimatePresence>
        {result && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="absolute inset-0 bg-black/88 backdrop-blur-sm" />
            <motion.div className="relative w-full max-w-sm glass-card gold-border p-6 text-center"
              initial={{ scale: 0.65, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", damping: 12, stiffness: 180 }}>
              <motion.div className="text-6xl mb-3"
                animate={{ rotate: result === "WIN" ? [0, -8, 8, -4, 0] : [0, -3, 3, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 0.7, delay: 0.2 }}>
                {result === "WIN" ? "🏆" : "💀"}
              </motion.div>
              <h2 className="font-cinzel font-black text-2xl mb-2"
                style={{ color: result === "WIN" ? "#ffd700" : "#ff3333", textShadow: result === "WIN" ? "0 0 24px #ffd700" : "0 0 24px #ff3333" }}>
                {result === "WIN" ? "CHIẾN THẮNG!" : "THẤT BẠI"}
              </h2>
              {result === "WIN" && (
                <>
                  <div className="flex justify-center gap-2 my-3">
                    {[1, 2, 3].map(n => (
                      <motion.div key={n} className="text-4xl"
                        initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: n * 0.2, type: "spring", stiffness: 200 }}>
                        {n <= stars ? "⭐" : "☆"}
                      </motion.div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                    {[["💀", "Kill", kills], ["⭐", "Sao", `${stars}/3`], ["❤️", "HP", `${Math.floor(teamPct)}%`]].map(([ic, lb, val]) => (
                      <div key={lb as string} className="glass-card p-2">
                        <div className="text-[#ffd700] font-bold">{ic} {lb}</div>
                        <div className="text-white font-bold">{val}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="flex gap-3">
                <button onClick={() => router.push("/")} className="flex-1 py-3 rounded-xl font-cinzel font-bold text-sm"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#f0e6c8" }}>
                  🏠 Về Sảnh
                </button>
                <button onClick={() => window.location.reload()} className="flex-1 py-3 rounded-xl font-cinzel font-black text-sm"
                  style={{ background: "linear-gradient(135deg,#b8860b,#ffd700)", color: "#05080f" }}>
                  ⚔️ Thử Lại
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NAME MODAL ── */}
      <AnimatePresence>
        {showNameModal && (
          <NameModal current={state.player.name} onSave={n => { setName(n); setShowNameModal(false); }} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function BattlePage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center"
        style={{ background: "#020810" }}>
        <motion.div className="text-[#ffd700] font-cinzel font-black text-lg"
          animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2 }}>
          ⚔️ Đang tải...
        </motion.div>
      </div>
    }>
      <BattleContent />
    </Suspense>
  );
}
