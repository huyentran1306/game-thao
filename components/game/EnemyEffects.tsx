"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export interface ParticleBurst {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface EnemyEffectsProps {
  enemyX: number;
  enemyY: number;
  enemySize: number;
  enemyColor: string;
  onHit?: boolean;
  onDeath?: boolean;
}

export function EnemyEffects({
  enemyX,
  enemyY,
  enemySize,
  enemyColor,
  onHit = false,
  onDeath = false,
}: EnemyEffectsProps) {
  const [hitParticles, setHitParticles] = useState<ParticleBurst[]>([]);
  const [deathParticles, setDeathParticles] = useState<ParticleBurst[]>([]);

  // Generate hit flash particles
  useEffect(() => {
    if (onHit) {
      const particles = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: enemyX,
        y: enemyY,
        color: enemyColor,
      }));
      setHitParticles(particles);

      const timer = setTimeout(() => setHitParticles([]), 300);
      return () => clearTimeout(timer);
    }
  }, [onHit, enemyX, enemyY, enemyColor]);

  // Generate death explosion particles
  useEffect(() => {
    if (onDeath) {
      const colors = [enemyColor, "#ffe333", "#ff6600", "#ff3333"];
      const particles = Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: enemyX,
        y: enemyY,
        color: colors[i % colors.length],
      }));
      setDeathParticles(particles);

      const timer = setTimeout(() => setDeathParticles([]), 800);
      return () => clearTimeout(timer);
    }
  }, [onDeath, enemyX, enemyY, enemyColor]);

  return (
    <>
      {/* Hit flash effect */}
      {onHit && (
        <>
          {/* White flash */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              left: enemyX - enemySize / 2,
              top: enemyY - enemySize / 2,
              width: enemySize,
              height: enemySize,
              background: `radial-gradient(circle, rgba(255,255,255,0.8), transparent 70%)`,
            }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Hit ring expansion */}
          <motion.div
            className="absolute rounded-full border-2 pointer-events-none"
            style={{
              left: enemyX - (enemySize * 1.2) / 2,
              top: enemyY - (enemySize * 1.2) / 2,
              width: enemySize * 1.2,
              height: enemySize * 1.2,
              borderColor: `${enemyColor}ff`,
              boxShadow: `0 0 16px ${enemyColor}`,
            }}
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />

          {/* Hit particles burst */}
          {hitParticles.map((p) => {
            const angle = (p.id / 8) * Math.PI * 2;
            const distance = enemySize * 0.8;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            return (
              <motion.div
                key={p.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: enemyX - 3,
                  top: enemyY - 3,
                  width: 6,
                  height: 6,
                  background: p.color,
                  boxShadow: `0 0 8px ${p.color}`,
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: tx, y: ty, opacity: 0, scale: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            );
          })}
        </>
      )}

      {/* Death explosion effect */}
      {onDeath && (
        <>
          {/* Central explosion flash */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              left: enemyX - enemySize,
              top: enemyY - enemySize,
              width: enemySize * 2,
              height: enemySize * 2,
              background: `radial-gradient(circle, ${enemyColor}ff 0%, ${enemyColor}80 40%, ${enemyColor}00 100%)`,
              boxShadow: `0 0 40px ${enemyColor}, 0 0 80px ${enemyColor}80`,
            }}
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />

          {/* Shock wave rings */}
          {[1, 2, 3].map((ring) => (
            <motion.div
              key={`ring-${ring}`}
              className="absolute rounded-full border-2 pointer-events-none"
              style={{
                left: enemyX - (enemySize * ring * 0.5),
                top: enemyY - (enemySize * ring * 0.5),
                width: enemySize * ring,
                height: enemySize * ring,
                borderColor: `${enemyColor}88`,
                boxShadow: `0 0 ${20 * ring}px ${enemyColor}`,
              }}
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{
                duration: 0.7 + ring * 0.1,
                delay: ring * 0.05,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Explosion particles */}
          {deathParticles.map((p) => {
            const angle = (p.id / 24) * Math.PI * 2;
            const distance = p.id % 2 === 0 ? enemySize * 1.2 : enemySize * 0.8;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            return (
              <motion.div
                key={p.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: enemyX - (p.id % 3 === 0 ? 4 : 2),
                  top: enemyY - (p.id % 3 === 0 ? 4 : 2),
                  width: p.id % 3 === 0 ? 8 : 4,
                  height: p.id % 3 === 0 ? 8 : 4,
                  background: p.color,
                  boxShadow: `0 0 12px ${p.color}`,
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: tx,
                  y: ty,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{
                  duration: 0.8 + Math.random() * 0.4,
                  delay: Math.random() * 0.1,
                  ease: "easeOut",
                }}
              />
            );
          })}

          {/* Blood splatter */}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
            const distance = enemySize * 0.6;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            return (
              <motion.div
                key={`splat-${i}`}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: enemyX - 3,
                  top: enemyY - 3,
                  width: 6,
                  height: 6,
                  background: "#cc0022",
                  boxShadow: "0 0 6px #cc0022",
                  filter: "blur(0.5px)",
                }}
                initial={{ x: 0, y: 0, opacity: 0.8, scale: 1 }}
                animate={{
                  x: tx + (Math.random() - 0.5) * 20,
                  y: ty + (Math.random() - 0.5) * 20,
                  opacity: 0,
                  scale: Math.random() * 0.5,
                }}
                transition={{
                  duration: 0.6 + Math.random() * 0.4,
                  ease: "easeOut",
                }}
              />
            );
          })}

          {/* Gold sparkles */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const distance = enemySize * 1.5;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            return (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute pointer-events-none"
                style={{
                  left: enemyX,
                  top: enemyY,
                  width: 3,
                  height: 3,
                  background: "#ffe333",
                  borderRadius: "50%",
                  boxShadow: "0 0 8px #ffe333",
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: tx,
                  y: ty,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{
                  duration: 0.7,
                  ease: "easeOut",
                }}
              />
            );
          })}
        </>
      )}

      {/* Screen shake effect - should be applied to parent container */}
      {onHit && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ x: 0, y: 0 }}
          animate={{ x: [-2, 2, -2, 1, 0], y: [-2, 1, 2, -1, 0] }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        />
      )}
    </>
  );
}
