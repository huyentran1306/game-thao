"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface FloatingParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

interface GlowOrb {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

export function BattleBackgroundEnhanced() {
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const [glowOrbs, setGlowOrbs] = useState<GlowOrb[]>([]);

  useEffect(() => {
    // Generate floating particles
    const colors = ["#00bfff", "#9b30ff", "#7fffd4", "#ffe333", "#ff1493"];
    setParticles(
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 4,
        duration: 8 + Math.random() * 12,
        delay: Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
      }))
    );

    // Generate glow orbs
    setGlowOrbs(
      Array.from({ length: 5 }, (_, i) => ({
        id: i,
        x: 20 + Math.random() * 60,
        y: 15 + Math.random() * 70,
        size: 80 + Math.random() * 120,
        color: colors[Math.floor(Math.random() * colors.length)],
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(30, 10, 60, 1) 0%,
              rgba(15, 5, 40, 1) 25%,
              rgba(20, 15, 50, 1) 50%,
              rgba(25, 10, 45, 1) 75%,
              rgba(35, 15, 65, 1) 100%
            )
          `,
        }}
        animate={{
          background: [
            `
            linear-gradient(135deg, 
              rgba(30, 10, 60, 1) 0%,
              rgba(15, 5, 40, 1) 25%,
              rgba(20, 15, 50, 1) 50%,
              rgba(25, 10, 45, 1) 75%,
              rgba(35, 15, 65, 1) 100%
            )
          `,
            `
            linear-gradient(45deg, 
              rgba(20, 15, 50, 1) 0%,
              rgba(30, 10, 60, 1) 25%,
              rgba(25, 10, 45, 1) 50%,
              rgba(35, 15, 65, 1) 75%,
              rgba(15, 5, 40, 1) 100%
            )
          `,
            `
            linear-gradient(225deg, 
              rgba(25, 10, 45, 1) 0%,
              rgba(20, 15, 50, 1) 25%,
              rgba(30, 10, 60, 1) 50%,
              rgba(15, 5, 40, 1) 75%,
              rgba(35, 15, 65, 1) 100%
            )
          `,
            `
            linear-gradient(315deg, 
              rgba(35, 15, 65, 1) 0%,
              rgba(25, 10, 45, 1) 25%,
              rgba(15, 5, 40, 1) 50%,
              rgba(30, 10, 60, 1) 75%,
              rgba(20, 15, 50, 1) 100%
            )
          `,
          ],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Hex grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='48'%3E%3Cpath d='M28 4 L52 18 L52 30 L28 44 L4 30 L4 18 Z' fill='none' stroke='rgba(155,48,255,0.04)' stroke-width='0.8'/%3E%3C/svg%3E")`,
          backgroundSize: "56px 48px",
        }}
      />

      {/* Radial gradient vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 50%, 
              transparent 20%,
              rgba(10, 5, 25, 0.3) 70%,
              rgba(5, 0, 20, 0.6) 100%
            )
          `,
        }}
      />

      {/* Ground terrain glow */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "45%",
          background: `
            linear-gradient(to top,
              rgba(100, 20, 180, 0.25) 0%,
              rgba(80, 30, 150, 0.15) 30%,
              rgba(60, 10, 120, 0.08) 60%,
              transparent 100%
            )
          `,
        }}
        animate={{
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Left side ambience */}
      <div
        className="absolute top-0 left-0 bottom-0"
        style={{
          width: "35%",
          background:
            "linear-gradient(to right, rgba(0, 150, 255, 0.08), transparent)",
        }}
      />

      {/* Right side ambience */}
      <div
        className="absolute top-0 right-0 bottom-0"
        style={{
          width: "35%",
          background:
            "linear-gradient(to left, rgba(255, 50, 150, 0.08), transparent)",
        }}
      />

      {/* Central glow orbs */}
      {glowOrbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full blur-3xl"
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            background: `radial-gradient(circle, ${orb.color}20 0%, ${orb.color}00 70%)`,
            marginLeft: `-${orb.size / 2}px`,
            marginTop: `-${orb.size / 2}px`,
          }}
          animate={{
            x: [-20, 20, -20],
            y: [-15, 15, -15],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 12 + Math.random() * 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 1.5}px ${p.color}, 0 0 ${p.size * 3}px ${p.color}60`,
          }}
          animate={{
            y: [0, -120, -200],
            x: [0, Math.sin(p.id) * 40, Math.cos(p.id) * 20],
            opacity: [0.6, 0.8, 0],
            scale: [1, 0.8, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Ground line with shimmer */}
      <motion.div
        className="absolute left-4 right-4"
        style={{
          bottom: "20%",
          height: 2,
          background: `
            linear-gradient(90deg,
              transparent 0%,
              rgba(155, 48, 255, 0.4) 20%,
              rgba(100, 200, 255, 0.3) 50%,
              rgba(155, 48, 255, 0.4) 80%,
              transparent 100%
            )
          `,
          boxShadow: `0 0 12px rgba(155, 48, 255, 0.4), 0 0 24px rgba(100, 200, 255, 0.2)`,
        }}
        animate={{
          opacity: [0.5, 1, 0.5],
          boxShadow: [
            "0 0 12px rgba(155, 48, 255, 0.4), 0 0 24px rgba(100, 200, 255, 0.2)",
            "0 0 20px rgba(155, 48, 255, 0.6), 0 0 40px rgba(100, 200, 255, 0.4)",
            "0 0 12px rgba(155, 48, 255, 0.4), 0 0 24px rgba(100, 200, 255, 0.2)",
          ],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Central arena glow pulse */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 400,
          height: 240,
          left: "50%",
          top: "55%",
          marginLeft: -200,
          marginTop: -120,
          background: `
            radial-gradient(ellipse, 
              rgba(155, 48, 255, 0.08) 0%,
              rgba(100, 200, 255, 0.04) 40%,
              transparent 100%
            )
          `,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Top ethereal glow */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: "25%",
          background: `
            linear-gradient(to bottom,
              rgba(100, 200, 255, 0.05) 0%,
              rgba(155, 48, 255, 0.02) 50%,
              transparent 100%
            )
          `,
        }}
      />
    </div>
  );
}
