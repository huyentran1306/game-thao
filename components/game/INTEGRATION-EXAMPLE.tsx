/**
 * EXAMPLE: How to integrate enhanced components into your battle page
 * 
 * This file shows the exact patterns to use for integrating all the new enhanced components.
 * Copy these patterns into your actual battle/page.tsx file.
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Import enhanced components
import {
  BattleBackgroundEnhanced,
  HeroUIEnhanced,
  SkillBarEnhanced,
  DamageTextEnhanced,
  TopUIEnhanced,
  EnemyEffects,
  type DamagePopup,
} from "./index-enhanced";

import { ELEMENT_CONFIG } from "@/lib/constants";
import type { Hero, Monster } from "@/types";

// ─────────────────────────────────────────────────────────────────
// EXAMPLE INTEGRATION COMPONENTS
// ─────────────────────────────────────────────────────────────────

/**
 * Example 1: Hero Team Display with Enhanced UI
 */
export function HeroTeamDisplay({
  heroes,
  activeHeroId,
  attackingHeroId,
  heroHps,
}: {
  heroes: Hero[];
  activeHeroId: string;
  attackingHeroId?: string;
  heroHps: Record<string, number>;
}) {
  return (
    <div className="flex gap-4 justify-center items-end p-4">
      {heroes.map((hero, idx) => (
        <HeroUIEnhanced
          key={hero.id}
          hero={hero}
          currentHp={heroHps[hero.id] ?? hero.maxHp}
          maxHp={hero.maxHp}
          isActive={activeHeroId === hero.id}
          isAttacking={attackingHeroId === hero.id}
          position={idx === 0 ? "left" : idx === 1 ? "middle" : "right"}
          onClick={() => {
            // Handle hero selection if needed
            console.log("Selected hero:", hero.id);
          }}
        />
      ))}
    </div>
  );
}

/**
 * Example 2: Damage Text Management
 */
export function useDamageTexts() {
  const [damageTexts, setDamageTexts] = useState<DamagePopup[]>([]);
  const idRef = useRef(0);

  const addDamage = useCallback(
    (
      x: number,
      y: number,
      value: number,
      type: "damage" | "heal" | "miss" = "damage",
      isCrit = false,
      isClash = false,
      duration = 1300
    ) => {
      const id = ++idRef.current;

      setDamageTexts((prev) => [
        ...prev,
        {
          id,
          x,
          y,
          value,
          isCrit,
          isClash,
          type,
        },
      ]);

      // Remove after animation completes
      setTimeout(() => {
        setDamageTexts((prev) => prev.filter((d) => d.id !== id));
      }, duration);
    },
    []
  );

  return { damageTexts, addDamage };
}

/**
 * Example 3: Enemy Display with Effects
 */
export function EnemyDisplayWithEffects({
  monster,
  onHitFlash,
  onDeathExplosion,
}: {
  monster: Monster;
  onHitFlash: boolean;
  onDeathExplosion: boolean;
}) {
  const elementConfig = ELEMENT_CONFIG[monster.element];
  const size = monster.size === "boss" ? 120 : 80;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Enemy visual container */}
      <motion.div
        className="relative"
        animate={onHitFlash ? { x: [-5, 5, -4, 3, 0] } : {}}
        transition={{ duration: 0.14 }}
      >
        {/* Enemy emoji/sprite */}
        <span
          className="text-6xl"
          style={{
            filter: `drop-shadow(0 0 ${size / 2}px ${elementConfig.color})`,
          }}
        >
          {monster.emoji}
        </span>

        {/* Enemy HP bar */}
        <div className="mt-2 w-24 mx-auto">
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{
              background: "rgba(0,0,0,0.7)",
              border: `1px solid ${elementConfig.color}50`,
            }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background:
                  monster.hp > monster.maxHp * 0.55
                    ? "linear-gradient(90deg, #22dd44, #39ff14)"
                    : monster.hp > monster.maxHp * 0.28
                      ? "linear-gradient(90deg, #ff8800, #ffcc00)"
                      : "linear-gradient(90deg, #cc0022, #ff3333)",
                boxShadow:
                  monster.hp > monster.maxHp * 0.55
                    ? "0 0 8px #39ff14"
                    : monster.hp > monster.maxHp * 0.28
                      ? "0 0 8px #ff8800"
                      : "0 0 8px #ff3333",
              }}
              animate={{
                width: `${(monster.hp / monster.maxHp) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Enemy effects (hit flash, death explosion) */}
      <EnemyEffects
        enemyX={window.innerWidth / 2}
        enemyY={window.innerHeight * 0.4}
        enemySize={size}
        enemyColor={elementConfig.color}
        onHit={onHitFlash}
        onDeath={onDeathExplosion}
      />
    </div>
  );
}

/**
 * Example 4: Skill Bar with Cooldown Tracking
 */
export function SkillBarWithCooldowns({
  hero,
  cooldowns,
  onSkillUse,
  disabled,
}: {
  hero: Hero;
  cooldowns: Record<string, number>;
  onSkillUse: (skillId: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="p-4">
      <SkillBarEnhanced
        skills={hero.skills}
        cooldowns={cooldowns}
        onSkillUse={onSkillUse}
        disabled={disabled}
      />
    </div>
  );
}

/**
 * Example 5: Full Battle Scene with All Enhanced Components
 */
export function EnhancedBattleScene() {
  // Sample state - replace with your actual game state
  const [heroes] = useState<Hero[]>([]);
  const [monsters] = useState<Monster[]>([]);
  const [player] = useState({
    name: "Chiến Thần",
    level: 15,
    exp: 450,
    maxExp: 1000,
    totalStars: 25,
  });

  const { damageTexts, addDamage } = useDamageTexts();

  const [gameState] = useState({
    activeHeroId: heroes[0]?.id ?? "",
    attackingHeroId: "",
    progress: 45, // 0-100
    bossCount: 5,
    bossesCurrent: 2,
    gameSpeed: 1 as const,
    speedUnlocked: true,
  });

  const [heroHps] = useState<Record<string, number>>({
    hero1: 450,
    hero2: 380,
    hero3: 290,
  });

  const [skillCooldowns] = useState<Record<string, number>>({
    "skill-1": 0,
    "skill-2": 5.2,
    "skill-3": 0,
  });

  // Handle damage display
  const handleDamageDisplay = useCallback(() => {
    addDamage(
      Math.random() * window.innerWidth,
      Math.random() * window.innerHeight * 0.5,
      Math.floor(Math.random() * 200) + 50,
      Math.random() > 0.8 ? "damage" : Math.random() > 0.9 ? "heal" : "damage",
      Math.random() > 0.85, // isCrit chance
      Math.random() > 0.92 // isClash chance
    );
  }, [addDamage]);

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden flex flex-col">
      {/* Enhanced Battle Background */}
      <BattleBackgroundEnhanced />

      {/* Top UI with Progress */}
      <TopUIEnhanced
        playerName={player.name}
        playerLevel={player.level}
        experience={player.exp}
        maxExp={player.maxExp}
        stars={player.totalStars}
        progress={gameState.progress}
        bossCount={gameState.bossCount}
        bossesCurrent={gameState.bossesCurrent}
        currentSpeed={gameState.gameSpeed}
        speedUnlocked={gameState.speedUnlocked}
      />

      {/* Battle Arena */}
      <div className="flex-1 relative z-10">
        {/* Enemy Display */}
        {monsters.length > 0 && (
          <EnemyDisplayWithEffects
            monster={monsters[0]}
            onHitFlash={false}
            onDeathExplosion={false}
          />
        )}

        {/* Damage Texts */}
        <div className="absolute inset-0">
          <DamageTextEnhanced items={damageTexts} />
        </div>

        {/* Test damage display button */}
        <button
          onClick={handleDamageDisplay}
          className="absolute top-4 right-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-bold text-sm z-50"
        >
          Test Damage
        </button>
      </div>

      {/* Hero Team Display */}
      <div className="relative z-20 border-t border-purple-500/30 bg-black/50 py-4">
        <HeroTeamDisplay
          heroes={heroes}
          activeHeroId={gameState.activeHeroId}
          heroHps={heroHps}
        />
      </div>

      {/* Skill Bar */}
      <div className="relative z-20 border-t border-purple-500/30 bg-black/50">
        {heroes.length > 0 && (
          <SkillBarWithCooldowns
            hero={heroes[0]}
            cooldowns={skillCooldowns}
            onSkillUse={(skillId) => console.log("Using skill:", skillId)}
            disabled={false}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Example usage in your battle/page.tsx:
 * 
 * Replace your main render with:
 * 
 * <EnhancedBattleScene />
 * 
 * Or integrate components individually:
 * 
 * return (
 *   <div className="relative w-full h-screen bg-slate-950">
 *     <BattleBackgroundEnhanced />
 *     <TopUIEnhanced {...topProps} />
 *     <div className="flex-1">
 *       <DamageTextEnhanced items={damages} />
 *     </div>
 *     <HeroTeamDisplay heroes={heroes} {...heroProps} />
 *     <SkillBarEnhanced skills={skills} {...skillProps} />
 *   </div>
 * )
 */

export default EnhancedBattleScene;
