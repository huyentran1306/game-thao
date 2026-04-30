"use client";

import { motion } from "framer-motion";
import { ELEMENT_CONFIG } from "@/lib/constants";
import type { Hero, ElementType } from "@/types";

interface TopUIEnhancedProps {
  playerName: string;
  playerLevel: number;
  experience: number;
  maxExp: number;
  stars: number;
  progress: number; // 0-100
  bossCount: number;
  bossesCurrent: number;
  onSpeedToggle?: (speed: 1 | 1.5 | 2) => void;
  currentSpeed?: 1 | 1.5 | 2;
  speedUnlocked?: boolean;
  avatarHero?: Hero;
}

export function TopUIEnhanced({
  playerName,
  playerLevel,
  experience,
  maxExp,
  stars,
  progress,
  bossCount,
  bossesCurrent,
  onSpeedToggle,
  currentSpeed = 1,
  speedUnlocked = false,
  avatarHero,
}: TopUIEnhancedProps) {
  const expPercent = Math.floor((experience / maxExp) * 100);
  const avatarElement = avatarHero?.element || ("WIND" as ElementType);
  const elementConfig = ELEMENT_CONFIG[avatarElement];

  return (
    <div className="space-y-3 p-3">
      {/* Player info bar */}
      <motion.div
        className="glass-card gold-border mx-3 mt-3 px-4 py-3 flex items-center gap-3"
        style={{
          background: "linear-gradient(135deg, rgba(30, 10, 60, 0.8), rgba(15, 15, 40, 0.8))",
          border: `2px solid rgba(255, 215, 0, 0.25)`,
          boxShadow: `0 0 20px rgba(255, 215, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)`,
        }}
        animate={{
          boxShadow: [
            "0 0 20px rgba(255, 215, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
            "0 0 30px rgba(255, 215, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
            "0 0 20px rgba(255, 215, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Avatar */}
        <motion.div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 border-2"
          style={{
            borderColor: elementConfig.color,
            boxShadow: `0 0 12px ${elementConfig.color}80`,
            background: `radial-gradient(circle at 35% 25%, ${elementConfig.color}25, rgba(10,14,26,0.9))`,
          }}
          animate={{
            boxShadow: [
              `0 0 12px ${elementConfig.color}80`,
              `0 0 20px ${elementConfig.color}ff, 0 0 40px ${elementConfig.color}60`,
              `0 0 12px ${elementConfig.color}80`,
            ],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {avatarHero?.emoji ?? "⚔️"}
        </motion.div>

        {/* Player info */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-yellow-300 text-sm font-bold truncate">{playerName}</span>
            <span className="text-gray-400 text-xs flex-shrink-0">Lv.{playerLevel}</span>
            <span className="text-yellow-400 text-xs flex-shrink-0">⭐ {stars}</span>
          </div>

          {/* EXP bar with shimmer */}
          <div className="relative">
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(255, 215, 0, 0.3)",
                boxShadow: `inset 0 1px 2px rgba(0,0,0,0.8)`,
              }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #7fffd4 0%, #00bfff 50%, #9b30ff 100%)",
                  boxShadow: "0 0 8px #00bfff",
                }}
                animate={{
                  width: `${expPercent}%`,
                  backgroundPosition: ["0%", "200%"],
                }}
                transition={{
                  width: { duration: 0.4, ease: "easeOut" },
                  backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" },
                }}
              />

              {/* Shimmer line */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                  width: "30%",
                }}
                animate={{
                  left: ["-100%", "200%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* EXP text */}
            <div className="text-[9px] text-gray-300 mt-0.5">
              {experience}/{maxExp} EXP ({expPercent}%)
            </div>
          </div>
        </div>

        {/* Speed buttons */}
        <div className="flex gap-1 flex-shrink-0">
          {([1, 1.5, 2] as const).map((speed) => (
            <motion.button
              key={speed}
              onClick={() => speedUnlocked && onSpeedToggle?.(speed)}
              className="px-2 py-1 rounded text-xs font-bold"
              disabled={!speedUnlocked}
              style={{
                background:
                  currentSpeed === speed
                    ? "linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 170, 0, 0.2))"
                    : "rgba(255, 215, 0, 0.05)",
                border:
                  currentSpeed === speed
                    ? "1.5px solid rgba(255, 215, 0, 0.6)"
                    : "1px solid rgba(255, 215, 0, 0.2)",
                color: currentSpeed === speed ? "#ffe566" : "#6b7a99",
                cursor: speedUnlocked ? "pointer" : "not-allowed",
                opacity: speedUnlocked ? 1 : 0.4,
                textShadow:
                  currentSpeed === speed
                    ? "0 0 8px rgba(255, 215, 0, 0.6)"
                    : "none",
              }}
              animate={{
                boxShadow:
                  currentSpeed === speed
                    ? [
                        "0 0 8px rgba(255, 215, 0, 0.4)",
                        "0 0 16px rgba(255, 215, 0, 0.7)",
                        "0 0 8px rgba(255, 215, 0, 0.4)",
                      ]
                    : "0 0 0px rgba(255, 215, 0, 0)",
              }}
              transition={{
                duration: currentSpeed === speed ? 1.5 : undefined,
                repeat: currentSpeed === speed ? Infinity : 0,
              }}
              whileHover={speedUnlocked ? { scale: 1.05 } : {}}
            >
              {speed}x
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Progress bar with boss markers */}
      <motion.div
        className="mx-3 space-y-2"
        style={{
          background: "rgba(10, 14, 26, 0.6)",
          border: "1px solid rgba(155, 48, 255, 0.2)",
          padding: "12px",
          borderRadius: "8px",
        }}
      >
        {/* Progress label */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400">Progress</span>
          <motion.span
            className="font-bold text-yellow-300"
            animate={{
              textShadow: [
                "0 0 4px rgba(255, 215, 0, 0.4)",
                "0 0 12px rgba(255, 215, 0, 0.8)",
                "0 0 4px rgba(255, 215, 0, 0.4)",
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            {Math.floor(progress)}%
          </motion.span>
        </div>

        {/* Main progress bar */}
        <div className="relative h-5 rounded-full overflow-hidden">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(90deg, rgba(155, 48, 255, 0.2), rgba(100, 200, 255, 0.2))",
              border: "1px solid rgba(155, 48, 255, 0.4)",
            }}
          />

          {/* Progress fill with gradient */}
          <motion.div
            className="h-full rounded-full relative"
            style={{
              background: "linear-gradient(90deg, #7fffd4, #00bfff, #9b30ff)",
              boxShadow: "0 0 16px #00bfff, inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
            animate={{
              width: `${progress}%`,
              backgroundPosition: ["0%", "200%"],
            }}
            transition={{
              width: { duration: 0.5, ease: "easeOut" },
              backgroundPosition: { duration: 2.5, repeat: Infinity, ease: "linear" },
            }}
          />

          {/* Milestone markers */}
          {[25, 50, 75].map((p) => (
            <div
              key={p}
              className="absolute top-0 bottom-0 w-px"
              style={{
                left: `${p}%`,
                background: "rgba(255, 255, 255, 0.2)",
              }}
            />
          ))}

          {/* Boss markers */}
          {Array.from({ length: Math.min(bossCount, 5) }).map((_, i) => {
            const bossPos = ((i + 1) / Math.min(bossCount, 5)) * 100;
            const isBossPassed = bossPos < progress;
            const isBossCurrent = bossesCurrent === i + 1;

            return (
              <motion.div
                key={`boss-${i}`}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
                style={{
                  left: `${bossPos}%`,
                  background: isBossCurrent ? "#ff6600" : isBossPassed ? "#39ff14" : "#6b7a99",
                  boxShadow: isBossCurrent ? "0 0 12px #ff6600" : isBossPassed ? "0 0 8px #39ff14" : "0 0 4px #6b7a99",
                }}
                animate={{
                  scale: isBossCurrent ? [1, 1.3, 1] : 1,
                }}
                transition={{
                  duration: isBossCurrent ? 0.8 : undefined,
                  repeat: isBossCurrent ? Infinity : 0,
                }}
              />
            );
          })}
        </div>

        {/* Stage info */}
        <div className="text-[10px] text-gray-400 flex justify-between">
          <span>Boss {bossesCurrent}/{bossCount}</span>
          <span>
            {Math.floor(progress * 0.75)}m / 75m
          </span>
        </div>
      </motion.div>
    </div>
  );
}
