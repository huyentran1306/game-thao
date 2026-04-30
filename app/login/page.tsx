"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGame } from "@/contexts/game-context";

// Particle component
function Particle({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: Math.random() * 4 + 1,
        height: Math.random() * 4 + 1,
        background: `hsl(${Math.random() * 60 + 30}, 100%, ${Math.random() * 30 + 60}%)`,
        animation: `particle-float ${Math.random() * 3 + 2}s ease-out infinite`,
        animationDelay: `${Math.random() * 3}s`,
        ...style,
      }}
    />
  );
}

// Hero guardian silhouette
function HeroSilhouette({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left';
  return (
    <motion.div
      className="absolute bottom-24 flex flex-col items-center"
      style={{ [isLeft ? 'left' : 'right']: '-8px' }}
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: isLeft ? 0 : 1.5 }}
    >
      {/* Aura glow */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-40 animate-pulse-aura"
        style={{
          background: isLeft
            ? 'radial-gradient(circle, #c9a227 0%, transparent 70%)'
            : 'radial-gradient(circle, #9b30ff 0%, transparent 70%)',
          transform: 'scale(2)',
        }}
      />
      {/* Hero figure */}
      <div
        className="relative text-7xl select-none"
        style={{
          filter: isLeft
            ? 'drop-shadow(0 0 20px #c9a227) drop-shadow(0 0 40px rgba(201,162,39,0.4))'
            : 'drop-shadow(0 0 20px #9b30ff) drop-shadow(0 0 40px rgba(155,48,255,0.4))',
          transform: isLeft ? 'scaleX(-1)' : 'none',
        }}
      >
        {isLeft ? '🛡️' : '💀'}
      </div>
      <div className="relative text-5xl -mt-4 select-none" style={{
        filter: isLeft
          ? 'drop-shadow(0 0 15px #c9a227)'
          : 'drop-shadow(0 0 15px #9b30ff)',
      }}>
        {isLeft ? '⚔️' : '🗡️'}
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { state, setName } = useGame();
  const [name, setNameInput] = useState(state.player.name === 'Chiến Thần' ? '' : state.player.name);
  const [isEntering, setIsEntering] = useState(false);
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      bottom: `${Math.random() * 60}%`,
      '--px': `${(Math.random() - 0.5) * 60}px`,
    }))
  );

  const handleEnter = async () => {
    if (!name.trim()) return;
    setIsEntering(true);
    setName(name.trim());
    await new Promise(r => setTimeout(r, 800));
    router.push('/');
  };

  // If already named (returning player), redirect
  useEffect(() => {
    if (state.player.name !== 'Chiến Thần' && state.player.name !== '') {
      // returning player - skip to main hub directly on mount? 
      // No, keep login screen for now to show UI
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center">
      {/* Background layers */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #05080f 0%, #0d0520 30%, #200010 60%, #100020 80%, #05080f 100%)',
        }}
      />
      {/* Atmospheric glow */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 80%, rgba(180,20,20,0.15) 0%, transparent 70%)',
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(155,48,255,0.08) 0%, transparent 70%)',
      }} />

      {/* Stars */}
      {particles.map(p => (
        <Particle
          key={p.id}
          style={{ left: p.left, bottom: p.bottom, '--px': p['--px'] } as React.CSSProperties}
        />
      ))}

      {/* Static star dots */}
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 2 + 0.5,
            height: Math.random() * 2 + 0.5,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 70}%`,
            opacity: Math.random() * 0.6 + 0.1,
          }}
        />
      ))}

      {/* Hero guardians */}
      <HeroSilhouette side="left" />
      <HeroSilhouette side="right" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-8 w-full max-w-sm">
        {/* Logo */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="text-5xl mb-3 select-none" style={{
            filter: 'drop-shadow(0 0 20px #ffd700) drop-shadow(0 0 40px rgba(255,215,0,0.4))',
            animation: 'float-hero 4s ease-in-out infinite',
          }}>
            ⚔️
          </div>
          <h1
            className="font-cinzel font-black text-3xl leading-tight tracking-widest mb-1"
            style={{
              color: '#ffd700',
              textShadow: '0 0 20px #ffd700, 0 0 40px rgba(255,215,0,0.5), 0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            ĐỘC TÔN
          </h1>
          <h1
            className="font-cinzel font-black text-2xl leading-tight tracking-widest"
            style={{
              color: '#f0e6c8',
              textShadow: '0 0 15px rgba(240,230,200,0.4), 0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            CHIẾN THẦN
          </h1>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-yellow-600/60" />
            <span className="text-yellow-600/80 text-xs font-cinzel tracking-widest">SUPREME WAR GOD</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-yellow-600/60" />
          </div>
        </motion.div>

        {/* Login form */}
        <motion.div
          className="w-full glass-card p-6 gold-border"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-center text-[#f0e6c8]/70 text-sm mb-5 font-cinzel tracking-wider">
            NHẬP TÊN CHIẾN THẦN
          </p>

          <div className="relative mb-4">
            <input
              type="text"
              value={name}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEnter()}
              placeholder="Tên của bạn..."
              maxLength={20}
              className="w-full bg-[rgba(255,215,0,0.04)] border border-[rgba(255,215,0,0.2)] rounded-lg px-4 py-3 text-[#f0e6c8] placeholder-[#6b7a99] focus:outline-none focus:border-[#ffd700] focus:shadow-[0_0_12px_rgba(255,215,0,0.25)] transition-all text-base"
            />
          </div>

          <motion.button
            onClick={handleEnter}
            disabled={!name.trim() || isEntering}
            className="w-full py-3.5 rounded-lg font-cinzel font-bold text-sm tracking-widest transition-all active:scale-95 disabled:opacity-40"
            style={{
              background: name.trim()
                ? 'linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)'
                : 'rgba(255,215,0,0.1)',
              color: '#05080f',
              boxShadow: name.trim() ? '0 0 20px rgba(255,215,0,0.4), 0 4px 12px rgba(0,0,0,0.5)' : 'none',
            }}
            whileTap={{ scale: 0.96 }}
          >
            {isEntering ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⚙️</span> ĐANG VÀO...
              </span>
            ) : (
              '⚔️ BẮT ĐẦU HÀNH TRÌNH'
            )}
          </motion.button>

          {state.player.name !== 'Chiến Thần' && (
            <button
              onClick={() => router.push('/')}
              className="w-full mt-3 py-2.5 rounded-lg text-[#ffd700]/70 text-xs font-cinzel tracking-wider border border-[rgba(255,215,0,0.1)] hover:border-[rgba(255,215,0,0.3)] transition-all active:scale-95"
            >
              TIẾP TỤC VỚI {state.player.name.toUpperCase()}
            </button>
          )}
        </motion.div>

        {/* Element icons */}
        <motion.div
          className="flex gap-4 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {['🌪️', '💧', '🪨', '⚡', '🌀'].map((e, i) => (
            <motion.span
              key={i}
              className="text-2xl"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              style={{ filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.3))' }}
            >
              {e}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
