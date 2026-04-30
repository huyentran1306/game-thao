"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGame } from "@/contexts/game-context";
import { CAMPAIGN_STAGES, ELEMENT_CONFIG } from "@/lib/constants";
import type { Difficulty, Stage } from "@/types";
import BottomNav from "@/components/game/BottomNav";

const CHAPTERS = Array.from(new Set(CAMPAIGN_STAGES.map(s => s.chapter)));

function StarDisplay({ stars, maxStars = 3 }: { stars: number; maxStars?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: maxStars }, (_, i) => (
        <span key={i} className={i < stars ? "text-[#ffd700]" : "text-[rgba(255,255,255,0.12)]"} style={{ fontSize: '14px' }}>
          {i < stars ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  );
}

function StageCard({ stage, result, onPlay }: {
  stage: Stage;
  result?: { stars: number; bestTime: number };
  onPlay: (stage: Stage) => void;
}) {
  const stars = result?.stars ?? 0;
  const diffColors: Record<string, string> = { EASY: '#39ff14', NORMAL: '#ffd700', ELITE: '#ff0066' };
  const diffLabels: Record<string, string> = { EASY: 'Dễ', NORMAL: 'Thường', ELITE: 'Tinh Anh' };

  return (
    <motion.div
      className={`glass-card p-3.5 relative overflow-hidden ${!stage.unlocked ? 'opacity-40' : ''}`}
      style={{ border: `1px solid ${stars > 0 ? 'rgba(255,215,0,0.25)' : 'rgba(255,255,255,0.06)'}` }}
      whileTap={stage.unlocked ? { scale: 0.97 } : {}}
      onClick={() => stage.unlocked && onPlay(stage)}
    >
      {/* Reward glow */}
      {stars === 3 && <div className="absolute inset-0 opacity-5" style={{ background: 'radial-gradient(circle at 80%,#ffd700,transparent)' }} />}

      <div className="flex items-start gap-3">
        {/* Stage number */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center font-cinzel font-bold text-sm flex-shrink-0"
          style={{
            background: stars > 0 ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.04)',
            border: `1.5px solid ${stars > 0 ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.08)'}`,
            color: stars > 0 ? '#ffd700' : '#6b7a99',
          }}
        >
          {!stage.unlocked ? '🔒' : stage.chapter}-{CAMPAIGN_STAGES.filter(s => s.chapter === stage.chapter).indexOf(stage) + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#f0e6c8] text-sm font-semibold truncate">{stage.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0" style={{ color: diffColors[stage.difficulty], background: diffColors[stage.difficulty] + '15' }}>
              {diffLabels[stage.difficulty]}
            </span>
          </div>
          <p className="text-[10px] text-[#6b7a99] leading-relaxed line-clamp-1">{stage.description}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <StarDisplay stars={stars} />
            {result && <span className="text-[10px] text-[#6b7a99]">{Math.floor(result.bestTime)}s</span>}
          </div>
        </div>

        {/* Gift boxes */}
        <div className="flex flex-col gap-1 flex-shrink-0">
          {[1, 2, 3].map(n => (
            <div
              key={n}
              className="w-5 h-5 rounded flex items-center justify-center text-[10px]"
              style={{
                background: stars >= n ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${stars >= n ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              {stars >= n ? '🎁' : '📦'}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function DifficultySheet({ stage, open, onClose, onConfirm }: {
  stage: Stage | null; open: boolean; onClose: () => void; onConfirm: (d: Difficulty) => void;
}) {
  return (
    <AnimatePresence>
      {open && stage && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/75" onClick={onClose} />
          <motion.div className="relative w-full max-w-[400px] glass-card gold-border p-5" initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} transition={{ type: 'spring', damping: 20 }}>
            <h3 className="font-cinzel text-[#ffd700] font-bold text-sm mb-1">{stage.name}</h3>
            <p className="text-[#6b7a99] text-xs mb-4">{stage.description}</p>
            <div className="space-y-2">
              {[
                { key: 'EASY' as Difficulty, label: 'Dễ', emoji: '🌱', color: '#39ff14', desc: 'Quái yếu hơn 25%' },
                { key: 'NORMAL' as Difficulty, label: 'Thường', emoji: '⚔️', color: '#ffd700', desc: 'Cân bằng' },
                { key: 'ELITE' as Difficulty, label: 'Tinh Anh', emoji: '💀', color: '#ff0066', desc: 'Quái mạnh 50%, thưởng gấp đôi' },
              ].map(d => (
                <button key={d.key} onClick={() => onConfirm(d.key)} className="w-full glass-card p-3 flex items-center gap-3 text-left" style={{ border: `1px solid ${d.color}20` }}>
                  <span className="text-xl">{d.emoji}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold font-cinzel" style={{ color: d.color }}>{d.label}</div>
                    <div className="text-[10px] text-[#6b7a99]">{d.desc}</div>
                  </div>
                  <span className="text-[#ffd700]">▶</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function CampaignPage() {
  const router = useRouter();
  const { state } = useGame();
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);

  const chapterStages = CAMPAIGN_STAGES.filter(s => s.chapter === selectedChapter);

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg,#05080f 0%,#0a0820 100%)' }}>
      {/* Header */}
      <div className="px-3 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => router.push('/')} className="text-[#6b7a99]">◀</button>
          <h1 className="font-cinzel font-black text-lg text-[#ffd700]" style={{ textShadow: '0 0 10px rgba(255,215,0,0.4)' }}>
            ⚔️ CHIẾN DỊCH
          </h1>
          <div className="ml-auto flex items-center gap-1 text-xs text-[#6b7a99]">
            <span>⭐ {state.player.totalStars}</span>
          </div>
        </div>

        {/* Chapter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CHAPTERS.map(ch => {
            const chName = CAMPAIGN_STAGES.find(s => s.chapter === ch)?.chapterName ?? '';
            const chStars = CAMPAIGN_STAGES.filter(s => s.chapter === ch).reduce((sum, s) => sum + (state.campaign[s.id]?.stars ?? 0), 0);
            return (
              <button
                key={ch}
                onClick={() => setSelectedChapter(ch)}
                className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-cinzel font-bold transition-all"
                style={{
                  background: selectedChapter === ch ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${selectedChapter === ch ? 'rgba(255,215,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: selectedChapter === ch ? '#ffd700' : '#6b7a99',
                }}
              >
                Ch.{ch} {chName.split(' ').slice(-1)[0]}
                <br />
                <span className="text-[10px]">⭐ {chStars}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chapter title */}
      <div className="px-3 mb-3">
        <div className="glass-card gold-border p-3 flex items-center gap-3">
          <span className="text-3xl">🗺️</span>
          <div>
            <div className="font-cinzel font-bold text-[#ffd700] text-sm">
              Chương {selectedChapter}: {CAMPAIGN_STAGES.find(s => s.chapter === selectedChapter)?.chapterName}
            </div>
            <div className="text-[10px] text-[#6b7a99] mt-0.5">
              {chapterStages.filter(s => (state.campaign[s.id]?.stars ?? 0) > 0).length}/{chapterStages.length} ải hoàn thành
            </div>
          </div>
        </div>
      </div>

      {/* Stages */}
      <div className="px-3 space-y-2">
        {chapterStages.map(stage => (
          <StageCard
            key={stage.id}
            stage={stage}
            result={state.campaign[stage.id]}
            onPlay={s => setSelectedStage(s)}
          />
        ))}
      </div>

      <BottomNav active="campaign" />
      <DifficultySheet
        stage={selectedStage}
        open={!!selectedStage}
        onClose={() => setSelectedStage(null)}
        onConfirm={(d) => { setSelectedStage(null); router.push(`/battle?stage=${selectedStage!.id}&difficulty=${d}`); }}
      />
    </div>
  );
}
