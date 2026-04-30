"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useGame } from "@/contexts/game-context";
import { GAME_CONFIG, HEROES_DATA, MONSTER_TEMPLATES, ELEMENT_CONFIG, CLASS_CONFIG } from "@/lib/constants";
import type { Difficulty, GameSpeed, Hero, Monster, Skill } from "@/types";

// Generate monster instance
let monsterIdCounter = 0;
function spawnMonster(templateKey: keyof typeof MONSTER_TEMPLATES, isBoss = false, spawnAt = 0): Monster {
  const t = MONSTER_TEMPLATES[templateKey];
  return {
    id: templateKey,
    instanceId: `m_${++monsterIdCounter}`,
    name: t.name,
    element: t.element,
    hp: t.hp,
    maxHp: t.hp,
    atk: t.atk,
    speed: isBoss ? 0.3 : 0.8,
    isBoss,
    isElite: t.isElite,
    spawnAt,
    reward: { exp: isBoss ? 500 : t.isElite ? 80 : 30, gold: isBoss ? 200 : t.isElite ? 30 : 10 },
    emoji: t.emoji,
    size: t.size,
    posX: 10 + Math.random() * 80,
    posY: 0,
    alive: true,
    phase: isBoss ? 1 : undefined,
  };
}

// Monster visual
function MonsterUnit({ monster, onKill }: { monster: Monster & { displayY: number }; onKill: () => void }) {
  const sizeClass = monster.size === 'boss' ? 'text-5xl' : monster.size === 'md' ? 'text-3xl' : 'text-2xl';
  const hpPct = (monster.hp / monster.maxHp) * 100;

  return (
    <motion.div
      className="absolute flex flex-col items-center"
      style={{ left: `${monster.posX}%`, top: `${monster.displayY}px`, transform: 'translateX(-50%)' }}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* HP bar above */}
      <div className="w-12 h-1 bg-[rgba(255,255,255,0.1)] rounded-full mb-0.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{
            width: `${hpPct}%`,
            background: hpPct > 60 ? '#39ff14' : hpPct > 30 ? '#ffaa00' : '#ff3333',
          }}
        />
      </div>
      {/* Emoji */}
      <div
        className={`${sizeClass} select-none cursor-pointer`}
        style={{
          filter: monster.isBoss
            ? `drop-shadow(0 0 12px ${ELEMENT_CONFIG[monster.element].color}) drop-shadow(0 0 24px ${ELEMENT_CONFIG[monster.element].color}80)`
            : `drop-shadow(0 0 4px ${ELEMENT_CONFIG[monster.element].color}60)`,
          animation: monster.isBoss ? 'float-hero 2s ease-in-out infinite' : undefined,
        }}
        onClick={onKill}
      >
        {monster.emoji}
      </div>
      {monster.isBoss && (
        <div className="text-[9px] text-center mt-0.5" style={{ color: ELEMENT_CONFIG[monster.element].color }}>
          {monster.name}
        </div>
      )}
    </motion.div>
  );
}

// Skill button
function SkillBtn({ skill, hero, cooldown, onUse }: { skill: Skill; hero: Hero; cooldown: number; onUse: () => void }) {
  const ready = cooldown <= 0;
  return (
    <motion.button
      onClick={onUse}
      disabled={!ready}
      className="flex flex-col items-center gap-0.5 relative"
      whileTap={ready ? { scale: 0.9 } : {}}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl relative overflow-hidden"
        style={{
          background: ready
            ? `radial-gradient(circle,${ELEMENT_CONFIG[hero.element].color}20,rgba(10,14,26,0.9))`
            : 'rgba(10,14,26,0.6)',
          border: `1.5px solid ${ready ? ELEMENT_CONFIG[hero.element].color + '60' : 'rgba(255,255,255,0.08)'}`,
          boxShadow: ready ? `0 0 8px ${ELEMENT_CONFIG[hero.element].color}30` : 'none',
        }}
      >
        {!ready && (
          <div
            className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-bold text-white"
            style={{ borderRadius: '0.75rem' }}
          >
            {Math.ceil(cooldown)}
          </div>
        )}
        <span style={{ opacity: ready ? 1 : 0.4 }}>{skill.icon}</span>
      </div>
      <span className="text-[8px] text-[#6b7a99] w-11 text-center leading-tight truncate">{skill.name}</span>
    </motion.button>
  );
}

function BattleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, addExp, addGold, completeStage } = useGame();

  const stageId = searchParams.get('stage') ?? 's1_1';
  const difficulty = (searchParams.get('difficulty') ?? 'NORMAL') as Difficulty;
  const diffMult = GAME_CONFIG.DIFFICULTY_MULTIPLIER[difficulty];

  const [gameSpeed, setGameSpeed] = useState<GameSpeed>(state.player.gameSpeed);
  const [progress, setProgress] = useState(0); // 0-100
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [monsters, setMonsters] = useState<(Monster & { displayY: number })[]>([]);
  const [heroes, setHeroes] = useState<Hero[]>(() =>
    state.heroes.filter(h => h.isUnlocked).slice(0, 5).map(h => ({ ...h }))
  );
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [bossSpawned1, setBossSpawned1] = useState(false);
  const [bossSpawned2, setBossSpawned2] = useState(false);
  const [result, setResult] = useState<'WIN' | 'LOSE' | null>(null);
  const [stars, setStars] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpOptions, setLevelUpOptions] = useState<Skill[]>([]);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [waveCount, setWaveCount] = useState(0);
  const [nextWaveAt, setNextWaveAt] = useState(15); // seconds
  const [isRunning, setIsRunning] = useState(true);

  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const battleFieldRef = useRef<HTMLDivElement>(null);
  const FIELD_HEIGHT = 360;
  const HERO_Y = FIELD_HEIGHT - 60;

  const addLog = (msg: string) => setBattleLog(prev => [msg, ...prev.slice(0, 4)]);

  // Spawn wave
  const spawnWave = useCallback((waveNum: number) => {
    const templates: (keyof typeof MONSTER_TEMPLATES)[] = ['goblin', 'bat', 'skeleton', 'thunder_wolf', 'water_snake'];
    const size = Math.floor(Math.random() * (GAME_CONFIG.WAVE_SIZE_MAX - GAME_CONFIG.WAVE_SIZE_MIN + 1)) + GAME_CONFIG.WAVE_SIZE_MIN;
    const newMonsters = Array.from({ length: size }, (_, i) => {
      const key = templates[Math.floor(Math.random() * templates.length)];
      const m = spawnMonster(key, false, 0);
      return { ...m, posX: 5 + (i / size) * 90, displayY: -50 };
    });
    setMonsters(prev => [...prev, ...newMonsters]);
    setWaveCount(w => w + 1);
    addLog(`🌊 Wave ${waveNum} xuất hiện! ${size} kẻ địch`);
  }, []);

  // Spawn boss
  const spawnBoss = useCallback((phase: 1 | 2) => {
    const key: keyof typeof MONSTER_TEMPLATES = phase === 1 ? 'forest_king' : 'void_king';
    const boss = spawnMonster(key, true, 0);
    const scaled = { ...boss, hp: Math.floor(boss.hp * diffMult), maxHp: Math.floor(boss.hp * diffMult), atk: Math.floor(boss.atk * diffMult), displayY: -80 };
    setMonsters(prev => [...prev, scaled]);
    addLog(`👹 BOSS ${phase === 1 ? 'LẦN 1' : 'CUỐI'} xuất hiện: ${boss.name}!`);
  }, [diffMult]);

  // Main game loop
  useEffect(() => {
    if (result || showLevelUp || !isRunning) return;

    const tick = (now: number) => {
      if (!lastTickRef.current) lastTickRef.current = now;
      const rawDelta = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      const delta = rawDelta * gameSpeed;

      setTimeElapsed(prev => {
        const next = prev + delta;
        const newProgress = Math.min((next / GAME_CONFIG.BATTLE_DURATION) * 100, 100);
        setProgress(newProgress);

        // Boss spawns
        if (newProgress >= GAME_CONFIG.BOSS1_AT && !bossSpawned1) {
          setBossSpawned1(true);
          spawnBoss(1);
        }
        if (newProgress >= GAME_CONFIG.BOSS2_AT && !bossSpawned2) {
          setBossSpawned2(true);
          spawnBoss(2);
        }

        return next;
      });

      // Move monsters down
      setMonsters(prev =>
        prev.map(m => {
          if (!m.alive) return m;
          const newY = m.displayY + m.speed * delta * 60;
          // Reached heroes
          if (newY >= HERO_Y) {
            // Deal damage to random hero
            setHeroes(hPrev => {
              const alive = hPrev.filter(h => h.hp > 0);
              if (alive.length === 0) return hPrev;
              const target = alive[Math.floor(Math.random() * alive.length)];
              return hPrev.map(h => h.id === target.id ? { ...h, hp: Math.max(0, h.hp - Math.floor(m.atk * diffMult)) } : h);
            });
            return { ...m, displayY: 0, posX: 10 + Math.random() * 80 }; // reset to top
          }
          return { ...m, displayY: newY };
        })
      );

      // Cooldowns
      setCooldowns(prev => {
        const next: Record<string, number> = {};
        for (const k in prev) next[k] = Math.max(0, prev[k] - delta);
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [result, showLevelUp, isRunning, gameSpeed, bossSpawned1, bossSpawned2, spawnBoss, diffMult]);

  // Wave spawner (every 18s)
  useEffect(() => {
    if (result || showLevelUp) return;
    const interval = setInterval(() => {
      if (progress < 100) spawnWave(waveCount + 1);
    }, (GAME_CONFIG.WAVE_INTERVAL / gameSpeed) * 1000);
    return () => clearInterval(interval);
  }, [result, showLevelUp, gameSpeed, progress, waveCount, spawnWave]);

  // Auto hero attack
  useEffect(() => {
    if (result || showLevelUp) return;
    const interval = setInterval(() => {
      setMonsters(prev => {
        const alive = prev.filter(m => m.alive);
        if (!alive.length) return prev;
        const target = alive.reduce((a, b) => a.displayY > b.displayY ? a : b);
        const damage = heroes.reduce((sum, h) => sum + (h.hp > 0 ? h.atk : 0), 0);
        const newHp = target.hp - Math.floor(damage * 0.1);
        return prev.map(m => m.instanceId === target.instanceId
          ? { ...m, hp: newHp <= 0 ? 0 : newHp, alive: newHp > 0 }
          : m
        );
      });
    }, (1000 / gameSpeed));
    return () => clearInterval(interval);
  }, [result, showLevelUp, heroes, gameSpeed]);

  // Gain gold when monster dies
  useEffect(() => {
    const dead = monsters.filter(m => !m.alive);
    dead.forEach(m => addGold(m.reward.gold));
  }, [monsters]);

  // Check win/lose
  useEffect(() => {
    if (result) return;
    const allHeroesDead = heroes.every(h => h.hp <= 0);
    if (allHeroesDead) { setResult('LOSE'); setStars(0); return; }
    const allMonstersDead = monsters.length > 0 && monsters.every(m => !m.alive) && progress >= 100;
    if (allMonstersDead) {
      const maxHp = heroes.reduce((s, h) => s + h.maxHp, 0);
      const curHp = heroes.reduce((s, h) => s + h.hp, 0);
      const hpPct = curHp / maxHp;
      const anyDead = heroes.some(h => h.hp <= 0);
      const newStars = anyDead ? 1 : hpPct >= 0.8 ? 3 : 2;
      setStars(newStars);
      setResult('WIN');
      addExp(150 * newStars);
      addGold(100 * newStars);
      completeStage(stageId, newStars, timeElapsed);
    }
  }, [monsters, heroes, progress, result]);

  const killMonster = (instanceId: string) => {
    setMonsters(prev => prev.map(m => m.instanceId === instanceId ? { ...m, alive: false, hp: 0 } : m));
  };

  const useSkill = (heroId: string, skill: Skill) => {
    const key = `${heroId}_${skill.id}`;
    if ((cooldowns[key] ?? 0) > 0) return;
    setCooldowns(prev => ({ ...prev, [key]: skill.cooldown }));
    if (skill.damage) {
      setMonsters(prev => {
        const alive = prev.filter(m => m.alive);
        if (!alive.length) return prev;
        const target = alive[0];
        return prev.map(m => m.instanceId === target.instanceId ? { ...m, hp: Math.max(0, m.hp - skill.damage!), alive: m.hp - skill.damage! > 0 } : m);
      });
    }
    if (skill.healPercent) {
      setHeroes(prev => prev.map(h => h.id === heroId ? { ...h, hp: Math.min(h.maxHp, h.hp + Math.floor(h.maxHp * skill.healPercent! / 100)) } : h));
    }
    addLog(`✨ ${heroes.find(h => h.id === heroId)?.name} dùng ${skill.name}!`);
  };

  const speedOptions: GameSpeed[] = [1, 1.5, 2];
  const speedUnlocked = state.player.speedUnlocked;
  const aliveMonsters = monsters.filter(m => m.alive);
  const teamHpMax = heroes.reduce((s, h) => s + h.maxHp, 0);
  const teamHpCur = heroes.reduce((s, h) => s + h.hp, 0);
  const teamHpPct = teamHpMax > 0 ? (teamHpCur / teamHpMax) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col select-none" style={{
      background: 'linear-gradient(180deg,#05080f 0%,#0a0515 50%,#05080f 100%)',
    }}>
      {/* TOP HUD */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <button onClick={() => router.back()} className="text-[#6b7a99] text-xl">◀</button>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[#6b7a99] font-cinzel">TIẾN TRÌNH ẢI</span>
            <span className="text-[10px] text-[#ffd700]">{Math.floor(progress)}%</span>
          </div>
          <div className="h-2 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden relative">
            <div className="h-full rounded-full transition-all duration-300" style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg,#4a9eff,#bf00ff,#ffd700)',
            }} />
            {/* Boss markers */}
            <div className="absolute top-0 h-full w-0.5 bg-[#ff4500]" style={{ left: '40%' }} />
            <div className="absolute top-0 h-full w-0.5 bg-[#ff0066]" style={{ left: '80%' }} />
          </div>
        </div>
        {/* Speed control */}
        <div className="flex gap-1">
          {speedOptions.map(s => (
            <button
              key={s}
              onClick={() => (speedUnlocked || s === 1) && setGameSpeed(s)}
              className="px-2 py-1 rounded text-[10px] font-bold transition-all"
              style={{
                background: gameSpeed === s ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${gameSpeed === s ? 'rgba(255,215,0,0.5)' : 'rgba(255,255,255,0.08)'}`,
                color: gameSpeed === s ? '#ffd700' : speedUnlocked || s === 1 ? '#6b7a99' : '#3a3a4a',
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Team HP */}
      <div className="px-3 mb-2">
        <div className="flex justify-between text-[10px] mb-0.5">
          <span className="text-[#6b7a99]">HP ĐỘI</span>
          <span style={{ color: teamHpPct > 60 ? '#39ff14' : teamHpPct > 30 ? '#ffaa00' : '#ff3333' }}>
            {teamHpCur.toLocaleString()}/{teamHpMax.toLocaleString()}
          </span>
        </div>
        <div className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
          <div
            className="hp-bar-fill h-full rounded-full"
            style={{
              width: `${teamHpPct}%`,
            }}
          />
        </div>
      </div>

      {/* BATTLE FIELD */}
      <div
        ref={battleFieldRef}
        className="relative mx-3 rounded-xl overflow-hidden flex-shrink-0"
        style={{
          height: FIELD_HEIGHT,
          background: 'linear-gradient(180deg,#050a1a 0%,#0a0520 50%,#150520 100%)',
          border: '1px solid rgba(255,215,0,0.1)',
        }}
      >
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,215,0,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,215,0,0.3) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Battle log */}
        <div className="absolute top-2 left-2 right-2 z-10 pointer-events-none">
          {battleLog.slice(0, 2).map((log, i) => (
            <motion.div
              key={`${log}-${i}`}
              className="text-[10px] text-[#ffd700]/70 leading-tight"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1 - i * 0.4, x: 0 }}
            >
              {log}
            </motion.div>
          ))}
        </div>

        {/* Monsters */}
        <AnimatePresence>
          {aliveMonsters.map(m => (
            <MonsterUnit key={m.instanceId} monster={m} onKill={() => killMonster(m.instanceId)} />
          ))}
        </AnimatePresence>

        {/* Heroes row */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 px-2">
          {heroes.map((hero, i) => {
            const hpPct = (hero.hp / hero.maxHp) * 100;
            const isDead = hero.hp <= 0;
            return (
              <motion.div
                key={hero.id}
                className="flex flex-col items-center gap-0.5"
                animate={!isDead ? { y: [0, -3, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{
                    background: isDead ? 'rgba(20,20,20,0.8)' : `radial-gradient(circle,${ELEMENT_CONFIG[hero.element].color}20,rgba(10,14,26,0.9))`,
                    border: `1.5px solid ${isDead ? 'rgba(255,255,255,0.05)' : ELEMENT_CONFIG[hero.element].color + '40'}`,
                    opacity: isDead ? 0.3 : 1,
                    filter: isDead ? 'grayscale(1)' : `drop-shadow(0 0 6px ${ELEMENT_CONFIG[hero.element].color}60)`,
                  }}
                >
                  {hero.emoji}
                </div>
                <div className="w-10 h-1 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${hpPct}%`,
                      background: hpPct > 60 ? '#39ff14' : hpPct > 30 ? '#ffaa00' : '#ff3333',
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* SKILL BAR */}
      <div className="mt-2 px-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {heroes.filter(h => h.hp > 0).flatMap(hero =>
            hero.skills.map(skill => (
              <SkillBtn
                key={`${hero.id}_${skill.id}`}
                skill={skill}
                hero={hero}
                cooldown={cooldowns[`${hero.id}_${skill.id}`] ?? 0}
                onUse={() => useSkill(hero.id, skill)}
              />
            ))
          )}
        </div>
      </div>

      {/* Hero HP bars detail */}
      <div className="mt-2 px-3 grid grid-cols-5 gap-1">
        {heroes.map(hero => {
          const hpPct = (hero.hp / hero.maxHp) * 100;
          return (
            <div key={hero.id} className="text-center">
              <div className="text-[10px]" style={{ color: CLASS_CONFIG[hero.heroClass].color }}>{hero.emoji}</div>
              <div className="h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden mt-0.5">
                <div className="h-full rounded-full" style={{ width: `${hpPct}%`, background: hpPct > 50 ? '#39ff14' : '#ff3333' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* RESULT OVERLAY */}
      <AnimatePresence>
        {result && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="absolute inset-0 bg-black/85" />
            <motion.div
              className="relative w-full glass-card gold-border p-6 text-center max-w-sm"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <div className="text-6xl mb-3">{result === 'WIN' ? '🏆' : '💀'}</div>
              <h2 className="font-cinzel font-black text-2xl mb-1" style={{ color: result === 'WIN' ? '#ffd700' : '#ff3333', textShadow: result === 'WIN' ? '0 0 20px #ffd700' : '0 0 20px #ff3333' }}>
                {result === 'WIN' ? 'CHIẾN THẮNG!' : 'THẤT BẠI'}
              </h2>

              {result === 'WIN' && (
                <div className="flex justify-center gap-2 my-4">
                  {[1, 2, 3].map(n => (
                    <motion.div
                      key={n}
                      className="text-4xl"
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: n * 0.2, type: 'spring', damping: 10 }}
                    >
                      {n <= stars ? '⭐' : '☆'}
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 py-3 rounded-lg font-cinzel font-bold text-sm"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0e6c8' }}
                >
                  🏠 Về Sảnh
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 py-3 rounded-lg font-cinzel font-bold text-sm"
                  style={{ background: 'linear-gradient(135deg,#b8860b,#ffd700)', color: '#05080f' }}
                >
                  ⚔️ Thử Lại
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BattlePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#ffd700]">Đang tải...</div>}>
      <BattleContent />
    </Suspense>
  );
}
