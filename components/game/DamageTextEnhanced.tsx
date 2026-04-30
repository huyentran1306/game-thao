"use client";

import { motion } from "framer-motion";

export interface DamagePopup {
  id: number;
  x: number;
  y: number;
  value: number;
  isCrit: boolean;
  isClash: boolean;
  type: "damage" | "heal" | "miss";
}

interface DamageTextEnhancedProps {
  items: DamagePopup[];
}

export function DamageTextEnhanced({ items }: DamageTextEnhancedProps) {
  return (
    <>
      {items.map((dmg) => {
        const isCrit = dmg.isCrit;
        const isClash = dmg.isClash;
        const isHeal = dmg.type === "heal";
        const isMiss = dmg.type === "miss";

        // Determine color and text based on type
        let textColor = "#ff5566";
        let glowColor = "#ff2233";
        let fontSize = 13;
        let label = `-${dmg.value}`;

        if (isCrit) {
          textColor = "#ffe566";
          glowColor = "#ffd700";
          fontSize = 22;
          label = `CRIT! ${dmg.value}`;
        } else if (isClash) {
          textColor = "#ff9900";
          glowColor = "#ff6600";
          fontSize = 18;
          label = `⚡${dmg.value}`;
        } else if (isHeal) {
          textColor = "#39ff14";
          glowColor = "#22dd44";
          fontSize = 15;
          label = `+${dmg.value}`;
        } else if (isMiss) {
          textColor = "#a0aec0";
          glowColor = "#6b7a99";
          fontSize = 11;
          label = "MISS!";
        }

        return (
          <motion.div
            key={dmg.id}
            className="absolute pointer-events-none z-30 select-none flex flex-col items-center"
            style={{
              left: dmg.x - 20,
              top: dmg.y,
              width: 40,
            }}
            initial={{
              opacity: 1,
              y: 0,
              scale: isCrit ? 0.4 : isClash ? 0.5 : 0.7,
            }}
            animate={{
              opacity: 0,
              y: isCrit ? -100 : isClash ? -90 : isHeal ? -70 : -55,
              scale: isCrit ? 1.6 : isClash ? 1.4 : 1.0,
              x: isClash ? [0, 20, 0] : 0,
            }}
            transition={{
              duration: isCrit ? 1.3 : isClash ? 1.2 : isHeal ? 0.9 : 0.85,
              ease: "easeOut",
            }}
          >
            {/* Starburst ring for crits */}
            {isCrit && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(255, 215, 0, 0.5), transparent 70%)",
                    width: 60,
                    height: 60,
                    left: -10,
                    top: -10,
                  }}
                  initial={{ scale: 0.2, opacity: 1 }}
                  animate={{ scale: 2.8, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2"
                  style={{
                    borderColor: "#ffaa00",
                    width: 50,
                    height: 50,
                    left: -5,
                    top: -5,
                  }}
                  initial={{ scale: 0.3, opacity: 1 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </>
            )}

            {/* Clash spark effect */}
            {isClash && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(255, 136, 0, 0.6), transparent 70%)",
                  width: 50,
                  height: 50,
                  left: -5,
                  top: -5,
                  filter: "blur(2px)",
                }}
                initial={{ scale: 0.3, opacity: 1 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            )}

            {/* Heal glow */}
            {isHeal && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(57, 255, 20, 0.4), transparent 70%)",
                  width: 45,
                  height: 45,
                  left: -2.5,
                  top: -2.5,
                }}
                initial={{ scale: 0.4, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            )}

            {/* Main text with multiple shadow layers */}
            <motion.span
              style={{
                fontFamily: "'Cinzel', serif",
                fontWeight: 900,
                fontSize,
                color: textColor,
                textShadow: isClash
                  ? `0 0 8px ${glowColor}, 0 0 20px ${glowColor}, 0 2px 4px rgba(0,0,0,0.9)`
                  : isCrit
                    ? `0 0 10px #ffd700, 0 0 24px #ffaa00, 0 0 40px #ff8800, 0 2px 4px rgba(0,0,0,0.9)`
                    : `0 0 6px ${glowColor}, 0 1px 3px rgba(0,0,0,0.9)`,
                lineHeight: 1,
                letterSpacing: isCrit ? "-0.5px" : 0,
                textAlign: "center",
                zIndex: 10,
                position: "relative",
              }}
            >
              {label}
            </motion.span>

            {/* Critical label */}
            {isCrit && (
              <motion.span
                style={{
                  fontSize: 10,
                  color: "#ffd70099",
                  fontWeight: 700,
                  marginTop: -3,
                  textShadow: "0 0 8px #ffd700",
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                ⭐ HIT!
              </motion.span>
            )}

            {/* Heal label */}
            {isHeal && (
              <motion.span
                style={{
                  fontSize: 8,
                  color: "#39ff1488",
                  fontWeight: 600,
                  marginTop: -1,
                  textShadow: "0 0 6px #39ff14",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05, duration: 0.3 }}
              >
                💚
              </motion.span>
            )}

            {/* Particle burst for crits */}
            {isCrit && (
              <>
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const angle = (i / 6) * Math.PI * 2;
                  const tx = Math.cos(angle) * 60;
                  const ty = Math.sin(angle) * 60;
                  return (
                    <motion.div
                      key={`particle-${i}`}
                      className="absolute w-1.5 h-1.5 rounded-full"
                      style={{
                        background: "#ffd700",
                        left: 0,
                        top: 0,
                        boxShadow: "0 0 8px #ffd700",
                      }}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                      animate={{
                        x: tx,
                        y: ty,
                        opacity: 0,
                        scale: 0,
                      }}
                      transition={{
                        duration: 0.8,
                        ease: "easeOut",
                      }}
                    />
                  );
                })}
              </>
            )}
          </motion.div>
        );
      })}
    </>
  );
}
