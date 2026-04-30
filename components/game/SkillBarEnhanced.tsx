"use client";

import { motion } from "framer-motion";
import type { Skill, HeroRarity } from "@/types";

interface SkillBarEnhancedProps {
  skills: Skill[];
  cooldowns: Record<string, number>;
  onSkillUse?: (skillId: string) => void;
  disabled?: boolean;
}

const rarityConfig: Record<HeroRarity, { color: string; borderGlow: string; bg: string }> = {
  NORMAL: { color: "#a0aec0", borderGlow: "#cbd5e0", bg: "rgba(160, 174, 192, 0.1)" },
  UPGRADED: { color: "#00bfff", borderGlow: "#0088ff", bg: "rgba(0, 191, 255, 0.1)" },
  S: { color: "#ffd700", borderGlow: "#ffaa00", bg: "rgba(255, 215, 0, 0.15)" },
};

export function SkillBarEnhanced({
  skills,
  cooldowns,
  onSkillUse,
  disabled = false,
}: SkillBarEnhancedProps) {
  const getRarityConfig = (rarity: HeroRarity) => rarityConfig[rarity] || rarityConfig.NORMAL;

  return (
    <div className="flex gap-3 p-4 rounded-lg" style={{ background: "rgba(10, 14, 26, 0.6)", border: "1px solid rgba(155, 48, 255, 0.2)" }}>
      {skills.map((skill, idx) => {
        const cd = cooldowns[skill.id] || 0;
        const isOnCooldown = cd > 0;
        const cdPercent = (cd / skill.cooldown) * 100;
        const rarity = (["NORMAL", "UPGRADED", "S"] as const)[Math.min(2, idx)] || "NORMAL";
        const rConfig = getRarityConfig(rarity);

        return (
          <motion.button
            key={skill.id}
            onClick={() => !disabled && !isOnCooldown && onSkillUse?.(skill.id)}
            className="relative flex-shrink-0 group"
            disabled={disabled || isOnCooldown}
            whileHover={!disabled && !isOnCooldown ? { scale: 1.12 } : {}}
            whileTap={!disabled && !isOnCooldown ? { scale: 0.95 } : {}}
          >
            {/* Skill card background */}
            <motion.div
              className="w-20 h-20 rounded-xl flex flex-col items-center justify-center overflow-hidden relative cursor-pointer"
              style={{
                background: rConfig.bg,
                border: `2.5px solid ${rConfig.color}`,
                boxShadow: `0 0 16px ${rConfig.borderGlow}40, inset 0 1px 0 rgba(255,255,255,0.1)`,
              }}
              animate={{
                boxShadow: !disabled && !isOnCooldown
                  ? [
                      `0 0 16px ${rConfig.borderGlow}40, inset 0 1px 0 rgba(255,255,255,0.1)`,
                      `0 0 24px ${rConfig.borderGlow}80, 0 0 40px ${rConfig.borderGlow}50, inset 0 1px 0 rgba(255,255,255,0.1)`,
                      `0 0 16px ${rConfig.borderGlow}40, inset 0 1px 0 rgba(255,255,255,0.1)`,
                    ]
                  : `0 0 8px ${rConfig.borderGlow}20, inset 0 1px 0 rgba(255,255,255,0.05)`,
              }}
              transition={{
                duration: !disabled && !isOnCooldown ? 1.5 : undefined,
                repeat: !disabled && !isOnCooldown ? Infinity : 0,
              }}
            >
              {/* Inner glow */}
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${rConfig.color}20, transparent 60%)`,
                }}
              />

              {/* Skill icon */}
              <motion.div
                className="text-2xl relative z-10"
                style={{
                  filter: `drop-shadow(0 0 8px ${rConfig.borderGlow})`,
                }}
                animate={{
                  scale: isOnCooldown ? 0.8 : 1,
                  opacity: isOnCooldown ? 0.4 : 1,
                }}
                transition={{
                  duration: 0.2,
                }}
              >
                {skill.icon}
              </motion.div>

              {/* Cooldown overlay */}
              {isOnCooldown && (
                <motion.div
                  className="absolute inset-0 rounded-lg flex items-center justify-center"
                  style={{
                    background: `linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)`,
                  }}
                >
                  <span className="font-cinzel font-bold text-yellow-300 text-sm">{Math.ceil(cd)}</span>
                </motion.div>
              )}

              {/* Cooldown circular progress */}
              <svg
                className="absolute inset-0 w-full h-full"
                style={{
                  transform: "rotate(-90deg)",
                  opacity: isOnCooldown ? 0.8 : 0,
                }}
              >
                <circle
                  cx="50%"
                  cy="50%"
                  r="32"
                  fill="none"
                  stroke="rgba(255, 51, 51, 0.3)"
                  strokeWidth="2"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="32"
                  fill="none"
                  stroke={rConfig.borderGlow}
                  strokeWidth="2"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - cdPercent / 100)}`}
                  strokeLinecap="round"
                />
              </svg>

              {/* Rarity glow border */}
              <div
                className="absolute -inset-1 rounded-xl pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, ${rConfig.color}40, transparent)`,
                  opacity: 0.3,
                }}
              />
            </motion.div>

            {/* Skill name tooltip */}
            <motion.div
              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg whitespace-nowrap text-xs font-bold text-white pointer-events-none z-50 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: "rgba(10, 14, 26, 0.95)",
                border: `1px solid ${rConfig.color}60`,
                boxShadow: `0 0 12px ${rConfig.borderGlow}40`,
              }}
            >
              {skill.name}
              {skill.cooldown > 0 && (
                <div className="text-[10px] text-gray-300 mt-1">{skill.cooldown}s CD</div>
              )}
            </motion.div>

            {/* Rarity indicator dot */}
            <div
              className="absolute top-1 right-1 w-2 h-2 rounded-full"
              style={{
                background: rConfig.color,
                boxShadow: `0 0 8px ${rConfig.borderGlow}`,
              }}
            />

            {/* Active glow for selected skill */}
            {!isOnCooldown && !disabled && (
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  border: `2px solid ${rConfig.borderGlow}`,
                  opacity: 0,
                }}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                animate={{
                  boxShadow: [
                    `inset 0 0 0px ${rConfig.borderGlow}`,
                    `inset 0 0 12px ${rConfig.borderGlow}`,
                    `inset 0 0 0px ${rConfig.borderGlow}`,
                  ],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
