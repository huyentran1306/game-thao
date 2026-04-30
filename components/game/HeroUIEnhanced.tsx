"use client";

import { motion } from "framer-motion";
import { ELEMENT_CONFIG, CLASS_CONFIG } from "@/lib/constants";
import type { Hero } from "@/types";

interface HeroUIEnhancedProps {
  hero: Hero;
  currentHp: number;
  maxHp: number;
  isActive: boolean;
  isAttacking: boolean;
  position: "left" | "middle" | "right";
  onClick?: () => void;
}

export function HeroUIEnhanced({
  hero,
  currentHp,
  maxHp,
  isActive,
  isAttacking,
  position,
  onClick,
}: HeroUIEnhancedProps) {
  const elementConfig = ELEMENT_CONFIG[hero.element];
  const classConfig = CLASS_CONFIG[hero.heroClass];
  const hpPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  const isLowHp = hpPercent < 30;

  // Position offset for circular arrangement
  const positionMap = {
    left: "-translate-x-4",
    middle: "translate-x-0",
    right: "translate-x-4",
  };

  return (
    <motion.div
      className={`relative w-fit flex flex-col items-center gap-2 cursor-pointer ${positionMap[position]}`}
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: isActive ? 1.05 : 1,
        opacity: 1,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded-full"
          style={{
            background: `${elementConfig.color}25`,
            border: `1px solid ${elementConfig.color}50`,
            zIndex: 10,
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
          }}
        >
          <span className="text-xs font-bold text-white">ACTIVE</span>
          <span className="text-xs">{elementConfig.emoji}</span>
        </motion.div>
      )}

      {/* Hero circular container with glow */}
      <motion.div
        className="relative flex flex-col items-center gap-1"
        animate={{
          y: isAttacking ? [0, -8, 0] : 0,
        }}
        transition={{
          duration: 0.4,
          ease: "easeOut",
        }}
      >
        {/* Outer aura glow layer */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            width: 86,
            height: 86,
            left: -8,
            top: -8,
            background: `radial-gradient(circle, ${elementConfig.color}30 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Main hero icon circle */}
        <motion.div
          className="relative w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
          style={{
            background: `radial-gradient(circle at 35% 25%, ${elementConfig.color}20, rgba(5, 2, 18, 0.96))`,
            border: `3px solid ${elementConfig.color}`,
            boxShadow: [
              `0 0 20px ${elementConfig.color}60`,
              `0 0 40px ${elementConfig.color}30`,
              `inset 0 1px 0 rgba(255,255,255,0.12)`,
              `0 4px 16px rgba(0,0,0,0.8)`,
            ].join(","),
          }}
          animate={{
            filter: isAttacking
              ? ["brightness(1)", "brightness(2.5) saturate(2)", "brightness(1)"]
              : ["brightness(1)"],
            boxShadow: isActive
              ? [
                  `0 0 20px ${elementConfig.color}80, 0 0 40px ${elementConfig.color}50, inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 16px rgba(0,0,0,0.8)`,
                  `0 0 30px ${elementConfig.color}ff, 0 0 60px ${elementConfig.color}80, inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 16px rgba(0,0,0,0.8)`,
                  `0 0 20px ${elementConfig.color}80, 0 0 40px ${elementConfig.color}50, inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 16px rgba(0,0,0,0.8)`,
                ]
              : [
                  `0 0 20px ${elementConfig.color}60, 0 0 40px ${elementConfig.color}30, inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 16px rgba(0,0,0,0.8)`,
                ],
          }}
          transition={{
            duration: isAttacking ? 0.4 : 2,
            repeat: isActive && !isAttacking ? (Infinity as unknown as number) : 0,
            ease: "easeInOut",
          }}
        >
          {/* Inner radial highlight */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at 35% 25%, ${elementConfig.color}25 0%, transparent 65%)`,
            }}
          />

          {/* Hero emoji */}
          <motion.span
            className="text-4xl relative z-10"
            style={{
              filter: `drop-shadow(0 0 12px ${elementConfig.color}99)`,
            }}
            animate={{
              scale: isAttacking ? [1, 0.9, 1] : 1,
            }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
            }}
          >
            {hero.emoji}
          </motion.span>

          {/* Bottom shadow */}
          <div
            className="absolute bottom-0 left-2 right-2 h-2 rounded-full"
            style={{
              background: `radial-gradient(ellipse, ${elementConfig.color}40, transparent)`,
              filter: "blur(3px)",
            }}
          />
        </motion.div>

        {/* Class + Element badges */}
        <div className="flex gap-1 mt-1">
          {/* Element badge */}
          <motion.div
            className="px-2 py-0.5 rounded-full text-xs font-bold"
            style={{
              background: `${elementConfig.color}20`,
              border: `1px solid ${elementConfig.color}50`,
              color: elementConfig.color,
              textShadow: `0 0 6px ${elementConfig.color}`,
            }}
            whileHover={{
              scale: 1.1,
              boxShadow: `0 0 12px ${elementConfig.color}`,
            }}
          >
            {elementConfig.emoji}
          </motion.div>

          {/* Class badge */}
          <motion.div
            className="px-2 py-0.5 rounded-full text-xs font-bold"
            style={{
              background: `${classConfig.color}20`,
              border: `1px solid ${classConfig.color}50`,
              color: classConfig.color,
              textShadow: `0 0 6px ${classConfig.color}`,
            }}
            whileHover={{
              scale: 1.1,
              boxShadow: `0 0 12px ${classConfig.color}`,
            }}
          >
            {classConfig.emoji}
          </motion.div>
        </div>
      </motion.div>

      {/* HP bar container */}
      <div className="w-24 space-y-1">
        {/* HP bar background */}
        <div
          className="h-3 rounded-full overflow-hidden relative"
          style={{
            background: "rgba(0,0,0,0.7)",
            border: `1px solid ${elementConfig.color}40`,
            boxShadow: `inset 0 1px 2px rgba(0,0,0,0.8), 0 0 8px ${elementConfig.color}20`,
          }}
        >
          {/* HP bar fill with gradient */}
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                hpPercent > 55
                  ? "linear-gradient(90deg, #22dd44 0%, #39ff14 100%)"
                  : hpPercent > 28
                    ? "linear-gradient(90deg, #ff8800 0%, #ffcc00 100%)"
                    : "linear-gradient(90deg, #cc0022 0%, #ff3333 100%)",
              boxShadow:
                hpPercent > 55
                  ? "0 0 8px #39ff14cc, inset 0 1px 0 rgba(255,255,255,0.2)"
                  : hpPercent > 28
                    ? "0 0 8px #ff8800cc, inset 0 1px 0 rgba(255,255,255,0.2)"
                    : "0 0 8px #ff3333cc, inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
            animate={{
              width: `${hpPercent}%`,
              filter: isLowHp ? ["brightness(1)", "brightness(1.4)", "brightness(1)"] : "brightness(1)",
            }}
            transition={{
              width: { duration: 0.3, ease: "easeOut" },
              filter: isLowHp ? { duration: 0.5, repeat: Infinity, ease: "easeInOut" } : {},
            }}
          />

          {/* HP segments */}
          {[25, 50, 75].map((p) => (
            <div
              key={p}
              className="absolute top-0 bottom-0 w-px"
              style={{
                left: `${p}%`,
                background: "rgba(255,255,255,0.15)",
              }}
            />
          ))}

          {/* HP text */}
          <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white pointer-events-none">
            <span
              style={{
                textShadow: `0 0 4px ${elementConfig.color}`,
              }}
            >
              {currentHp}/{maxHp}
            </span>
          </div>
        </div>

        {/* Level indicator */}
        <div className="text-center text-[10px] font-bold text-gray-300">
          Lv. {hero.level}
        </div>
      </div>

      {/* Hover effect border */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "transparent",
          width: 100,
          height: 100,
          left: -2,
          top: -2,
          border: `2px solid transparent`,
          borderColor: `${elementConfig.color}00`,
        }}
        whileHover={{
          borderColor: `${elementConfig.color}66`,
          boxShadow: `0 0 20px ${elementConfig.color}40`,
        }}
      />
    </motion.div>
  );
}
