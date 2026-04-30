"use client";

import { motion } from "framer-motion";
import { useGame } from "@/contexts/game-context";
import { DUNGEON_FLOORS } from "@/lib/constants";
import BottomNav from "@/components/game/BottomNav";
import { useRouter } from "next/navigation";

const FLOOR_BG = ['#1a0a2e', '#0a1a2e', '#2e0a0a', '#0a2e1a', '#1a1a0a', '#0a0a1a'];

export default function DungeonPage() {
  const { state } = useGame();
  const router = useRouter();

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg,#05080f 0%,#100820 100%)' }}>
      <div className="px-3 pt-4 pb-2">
        <h1 className="font-cinzel font-black text-lg text-[#ffd700] mb-1" style={{ textShadow: '0 0 10px rgba(255,215,0,0.4)' }}>
          🏰 HẦM NGỤC
        </h1>
        <p className="text-[11px] text-[#6b7a99]">Chinh phục các tầng hầm ngục để nhận tướng và vật phẩm hiếm</p>
      </div>

      <div className="px-3 space-y-3">
        {DUNGEON_FLOORS.map((floor, i) => {
          const locked = state.player.level < floor.requiredLevel;
          const cleared = state.dungeon[floor.id]?.cleared ?? false;

          return (
            <motion.div
              key={floor.id}
              className="glass-card overflow-hidden relative"
              style={{
                border: `1.5px solid ${cleared ? 'rgba(57,255,20,0.3)' : locked ? 'rgba(255,255,255,0.06)' : 'rgba(255,215,0,0.2)'}`,
                opacity: locked ? 0.5 : 1,
              }}
              whileTap={!locked ? { scale: 0.97 } : {}}
              onClick={() => !locked && !cleared && router.push(`/battle?dungeon=${floor.id}&difficulty=NORMAL`)}
            >
              {/* BG gradient */}
              <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg,${FLOOR_BG[i] ?? '#1a0a2e'},transparent)` }} />

              <div className="relative p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                    style={{
                      background: locked ? 'rgba(10,14,26,0.8)' : 'rgba(255,215,0,0.05)',
                      border: `2px solid ${cleared ? 'rgba(57,255,20,0.4)' : locked ? 'rgba(255,255,255,0.08)' : 'rgba(255,215,0,0.2)'}`,
                    }}
                  >
                    {locked ? '🔒' : cleared ? '✅' : floor.bossEmoji}
                  </div>

                  <div className="flex-1">
                    <div className="font-cinzel font-bold text-sm" style={{ color: cleared ? '#39ff14' : locked ? '#6b7a99' : '#f0e6c8' }}>
                      {floor.name}
                    </div>
                    <div className="text-[10px] text-[#6b7a99] mt-0.5 line-clamp-1">{floor.description}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      {locked ? (
                        <span className="text-[10px] text-[#ff0066]">🔒 Yêu cầu Level {floor.requiredLevel}</span>
                      ) : (
                        <>
                          <span className="text-[10px] text-[#6b7a99]">Boss: {floor.bossName}</span>
                          <span className="text-[10px] text-[#6b7a99]">Phần thưởng:</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <div className="text-[9px] text-[#6b7a99]">Tầng {i + 1}</div>
                    {!locked && (
                      <div className="flex flex-col items-end gap-0.5">
                        {floor.rewards.map((r, ri) => (
                          <span key={ri} className="text-[9px]" style={{ color: '#ffd700' }}>{r}</span>
                        ))}
                      </div>
                    )}
                    {!locked && !cleared && (
                      <span className="text-[10px] font-bold text-[#ffd700] bg-[rgba(255,215,0,0.1)] px-2 py-0.5 rounded-lg border border-[rgba(255,215,0,0.2)]">
                        CHINH PHỤC
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <BottomNav active="dungeon" />
    </div>
  );
}
