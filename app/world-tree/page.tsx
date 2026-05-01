"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/contexts/game-context";
import { WORLD_TREE_NODES } from "@/lib/constants";
import BottomNav from "@/components/game/BottomNav";

const GOLD_COLOR = '#ffd700';
const ESSENCE_COLOR = '#a855f7';

export default function WorldTreePage() {
  const { state, dispatch } = useGame();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleUnlock = (nodeId: string) => {
    const node = WORLD_TREE_NODES.find(n => n.id === nodeId);
    if (!node) return;
    const goldCost = node.cost.gold ?? 0;
    const essenceCost = node.cost.essence ?? 0;
    if (node.type === 'special') {
      if (state.player.essence >= essenceCost) dispatch({ type: 'UNLOCK_WORLD_TREE_NODE', nodeId, goldCost, essenceCost });
    } else {
      if (state.player.gold >= goldCost) dispatch({ type: 'UNLOCK_WORLD_TREE_NODE', nodeId, goldCost, essenceCost });
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg,#05080f 0%,#0b1020 100%)' }}>
      <div className="px-3 pt-4 pb-2">
        <h1 className="font-cinzel font-black text-lg text-[#ffd700] mb-1" style={{ textShadow: '0 0 10px rgba(255,215,0,0.4)' }}>
          🌳 CÂY THẾ GIỚI
        </h1>
        <div className="flex gap-4 text-xs text-[#6b7a99]">
          <span>🟡 Vàng: {state.player.gold.toLocaleString()}</span>
          <span style={{ color: ESSENCE_COLOR }}>💜 Tinh Chất: {state.player.essence.toLocaleString()}</span>
        </div>
      </div>

      {/* Tree nodes */}
      <div className="px-3 pb-4">
        {/* Draw a vertical tree */}
        <div className="relative flex flex-col items-center gap-0">
          {WORLD_TREE_NODES.map((node, i) => {
            const unlocked = state.worldTree.unlockedNodes.includes(node.id);
            const isSpecial = node.type === 'special';
            const canAfford = isSpecial ? state.player.essence >= (node.cost.essence ?? 0) : state.player.gold >= (node.cost.gold ?? 0);
            const prevUnlocked = i === 0 || state.worldTree.unlockedNodes.includes(WORLD_TREE_NODES[i - 1]?.id ?? '');
            const canUnlock = !unlocked && prevUnlocked && canAfford;

            return (
              <div key={node.id} className="flex flex-col items-center w-full">
                {/* connector line */}
                {i > 0 && (
                  <div className="w-0.5 h-5" style={{ background: unlocked ? (isSpecial ? ESSENCE_COLOR + '80' : GOLD_COLOR + '40') : 'rgba(255,255,255,0.1)' }} />
                )}
                <motion.div
                  className="w-full max-w-[340px] glass-card p-3 relative overflow-hidden cursor-pointer"
                  style={{
                    border: `1.5px solid ${unlocked ? (isSpecial ? ESSENCE_COLOR + '40' : GOLD_COLOR + '30') : 'rgba(255,255,255,0.07)'}`,
                    opacity: canUnlock || unlocked ? 1 : 0.5,
                  }}
                  whileTap={canUnlock ? { scale: 0.97 } : {}}
                  onClick={() => canUnlock && handleUnlock(node.id)}
                  onHoverStart={() => setHoveredId(node.id)}
                  onHoverEnd={() => setHoveredId(null)}
                >
                  {unlocked && (
                    <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at left,${isSpecial ? ESSENCE_COLOR : GOLD_COLOR},transparent)` }} />
                  )}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{
                        background: unlocked
                          ? (isSpecial ? ESSENCE_COLOR + '20' : GOLD_COLOR + '15')
                          : 'rgba(255,255,255,0.05)',
                        border: `1.5px solid ${unlocked ? (isSpecial ? ESSENCE_COLOR + '40' : GOLD_COLOR + '30') : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      {isSpecial ? '✨' : '🌿'}
                    </div>
                    <div className="flex-1">
                      <div className="font-cinzel font-bold text-xs" style={{ color: unlocked ? (isSpecial ? ESSENCE_COLOR : GOLD_COLOR) : '#a0a8c0' }}>
                        {node.name}
                      </div>
                      <div className="text-[10px] text-[#6b7a99] mt-0.5">{node.description}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {unlocked ? (
                        <span className="text-[10px] font-bold text-[#39ff14]">✅ Đã mở</span>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] font-bold" style={{ color: isSpecial ? ESSENCE_COLOR : GOLD_COLOR }}>
                          {isSpecial ? '💜' : '🟡'} {node.cost.toLocaleString()}
                        </div>
                      )}
                      {!unlocked && (
                        <span className="text-[9px]" style={{ color: canAfford ? '#39ff14' : '#ff0066' }}>
                          {canAfford ? 'Đủ tiền' : 'Thiếu'}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav active="campaign" />
    </div>
  );
}
