"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGame } from "@/contexts/game-context";
import { MONSTER_TEMPLATES, ELEMENT_CONFIG } from "@/lib/constants";
import BottomNav from "@/components/game/BottomNav";

const AI_PARTNERS = [
  { name: 'BáLôiThần',   emoji: '👑', heroes: ['⚡', '🌩️', '💀'] },
  { name: 'VôCựcPháp',   emoji: '🌀', heroes: ['🌀', '⛈️', '🍃'] },
  { name: 'HuyếtSấmKiếm',emoji: '🔴', heroes: ['🔴', '🌑', '💦'] },
];

type BattleStatus = 'lobby' | 'fighting' | 'victory' | 'defeat';

interface SharedBoss {
  name: string;
  emoji: string;
  hp: number;
  maxHp: number;
}

function HpBar({ pct, color, label }: { pct: number; color: string; label: string }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-0.5">
        <span style={{ color: '#6b7a99' }}>{label}</span>
        <span style={{ color }}>{Math.round(pct)}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div className="h-full rounded-full"
          style={{ background: color, width: `${pct}%` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3 }} />
      </div>
    </div>
  );
}

function MiniArena({
  label, heroes, dmgLog, isAI,
}: {
  label: string; heroes: string[]; dmgLog: number[]; isAI?: boolean;
}) {
  return (
    <div className="flex-1 rounded-xl overflow-hidden relative"
      style={{ background: isAI ? 'rgba(155,48,255,0.06)' : 'rgba(79,195,247,0.06)', border: `1px solid ${isAI ? 'rgba(155,48,255,0.2)' : 'rgba(79,195,247,0.2)'}`, minHeight: 180 }}>
      <div className="text-center py-1 text-[10px] font-bold"
        style={{ color: isAI ? '#9b30ff' : '#4fc3f7', borderBottom: `1px solid ${isAI ? 'rgba(155,48,255,0.15)' : 'rgba(79,195,247,0.15)'}` }}>
        {label}
      </div>
      <div className="flex justify-center gap-1 pt-3 pb-2">
        {heroes.map((emoji, i) => (
          <motion.div key={i}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-xl"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            animate={{ y: [0, -3, 0] }}
            transition={{ delay: i * 0.3, duration: 1.5, repeat: Infinity }}>
            {emoji}
          </motion.div>
        ))}
      </div>
      {/* Damage numbers */}
      <div className="relative h-12 overflow-hidden">
        <AnimatePresence>
          {dmgLog.slice(-3).map((dmg, i) => (
            <motion.div key={`${dmg}-${i}`}
              className="absolute text-[13px] font-black"
              style={{ left: `${20 + i * 30}%`, color: dmg > 1000 ? '#ff6600' : '#39ff14' }}
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: -30, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}>
              {dmg > 2000 ? '💥 CRIT!' : ''}{dmg.toLocaleString()}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function CoopPage() {
  const router = useRouter();
  const { state } = useGame();
  const [status, setStatus] = useState<BattleStatus>('lobby');
  const [partner, setPartner] = useState(AI_PARTNERS[0]);
  const [boss, setBoss] = useState<SharedBoss | null>(null);
  const [playerDmgLog, setPlayerDmgLog] = useState<number[]>([]);
  const [aiDmgLog, setAiDmgLog] = useState<number[]>([]);
  const [waveNum, setWaveNum] = useState(0);
  const [totalKills, setTotalKills] = useState(0);
  const [rewards, setRewards] = useState({ gold: 0, exp: 0 });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bossRef = useRef<SharedBoss | null>(null);

  const unlockedHeroes = state.heroes.filter(h => h.isUnlocked).slice(0, 3);
  const playerEmojis = unlockedHeroes.map(h => h.emoji);

  const startBattle = () => {
    const bossTemplate = MONSTER_TEMPLATES.void_king;
    const newBoss: SharedBoss = {
      name: bossTemplate.name,
      emoji: bossTemplate.emoji,
      hp: bossTemplate.hp * 2, // scaled for 2 players
      maxHp: bossTemplate.hp * 2,
    };
    setBoss(newBoss);
    bossRef.current = newBoss;
    setWaveNum(0);
    setTotalKills(0);
    setPlayerDmgLog([]);
    setAiDmgLog([]);
    setStatus('fighting');

    // Battle simulation loop
    timerRef.current = setInterval(() => {
      const playerAtk = unlockedHeroes.reduce((s, h) => s + h.atk, 0);
      const aiAtk = 500 + Math.random() * 300;
      const pDmg = Math.floor(playerAtk * (0.8 + Math.random() * 0.6));
      const aiDmg = Math.floor(aiAtk * (0.8 + Math.random() * 0.8));
      const isCrit = Math.random() < 0.22;
      const finalPDmg = isCrit ? Math.floor(pDmg * 2) : pDmg;

      setPlayerDmgLog(prev => [...prev.slice(-10), finalPDmg]);
      setAiDmgLog(prev => [...prev.slice(-10), Math.floor(aiDmg)]);
      setTotalKills(prev => prev + (Math.random() > 0.7 ? 1 : 0));
      setWaveNum(prev => prev + 1);

      bossRef.current = bossRef.current
        ? { ...bossRef.current, hp: Math.max(0, bossRef.current.hp - finalPDmg - Math.floor(aiDmg)) }
        : null;
      setBoss(prev => prev ? { ...prev, hp: Math.max(0, prev.hp - finalPDmg - Math.floor(aiDmg)) } : null);

      if (bossRef.current && bossRef.current.hp <= 0) {
        clearInterval(timerRef.current!);
        setStatus('victory');
        setRewards({ gold: 2000 + Math.floor(Math.random() * 1000), exp: 500 });
      }
    }, 800);
  };

  const endBattle = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('lobby');
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const bossHpPct = boss ? (boss.hp / boss.maxHp) * 100 : 100;

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg,#05080f 0%,#080415 100%)' }}>
      <div className="px-3 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => router.push('/')} className="text-[#6b7a99]">◀</button>
          <h1 className="font-cinzel font-black text-lg text-[#ffd700]" style={{ textShadow: '0 0 10px rgba(255,215,0,0.4)' }}>
            🤝 CO-OP ĐÔI
          </h1>
          <div className="ml-auto text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(57,255,20,0.1)', color: '#39ff14', border: '1px solid rgba(57,255,20,0.2)' }}>
            {/* TODO: Replace AI with WebSocket */}
            AI Partner
          </div>
        </div>

        {status === 'lobby' && (
          <>
            {/* Partner selection */}
            <div className="mb-4">
              <div className="font-cinzel text-[#ffd700] text-xs font-bold mb-2 tracking-wider">CHỌN ĐỐI TÁC</div>
              <div className="space-y-2">
                {AI_PARTNERS.map(p => (
                  <button
                    key={p.name}
                    onClick={() => setPartner(p)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                    style={{
                      background: partner.name === p.name ? 'rgba(155,48,255,0.1)' : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${partner.name === p.name ? 'rgba(155,48,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                    <span className="text-2xl">{p.emoji}</span>
                    <div className="text-left">
                      <div className="text-sm font-bold text-[#f0e6c8]">{p.name}</div>
                      <div className="flex gap-1">{p.heroes.map((e, i) => <span key={i} className="text-base">{e}</span>)}</div>
                    </div>
                    {partner.name === p.name && <span className="ml-auto text-[#9b30ff]">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Player's team */}
            <div className="mb-4 glass-card p-3" style={{ border: '1px solid rgba(79,195,247,0.2)' }}>
              <div className="text-[11px] text-[#4fc3f7] font-bold mb-2">ĐỘI CỦA BẠN</div>
              <div className="flex gap-2">
                {unlockedHeroes.map(h => (
                  <div key={h.id} className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ background: ELEMENT_CONFIG[h.element].color + '15', border: `1px solid ${ELEMENT_CONFIG[h.element].color}30` }}>
                      {h.emoji}
                    </div>
                    <span className="text-[9px] text-[#6b7a99] truncate w-10 text-center">{h.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="glass-card p-3 mb-4 space-y-1.5" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="font-cinzel text-[#ffd700] text-xs font-bold mb-2">LUẬT CO-OP</div>
              {[
                'Mỗi người giữ đội tướng riêng',
                'Boss scale gấp đôi máu và ATK',
                'Thưởng chia đều sau trận',
                'Combo team: đứng gần nhau buff 15% DMG',
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-[#6b7a99]">
                  <span className="text-[#ffd700] mt-0.5">•</span> {rule}
                </div>
              ))}
            </div>

            <button
              onClick={startBattle}
              className="w-full py-4 rounded-2xl font-cinzel font-black text-base"
              style={{
                background: 'linear-gradient(135deg, rgba(79,195,247,0.2), rgba(155,48,255,0.2))',
                border: '2px solid rgba(79,195,247,0.4)',
                color: '#4fc3f7',
                textShadow: '0 0 10px rgba(79,195,247,0.4)',
              }}>
              🤝 BẮT ĐẦU CO-OP
            </button>
          </>
        )}

        {status === 'fighting' && boss && (
          <div>
            {/* Boss HP bar */}
            <div className="glass-card px-4 py-3 mb-4" style={{ border: '1px solid rgba(255,50,50,0.3)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{boss.emoji}</span>
                  <span className="font-cinzel font-bold text-sm text-[#ff4444]">{boss.name}</span>
                </div>
                <span className="text-[11px] text-[#6b7a99]">Wave {waveNum}</span>
              </div>
              <HpBar pct={bossHpPct} color={bossHpPct > 50 ? '#39ff14' : bossHpPct > 25 ? '#ff9900' : '#ff3333'} label="Boss HP" />
            </div>

            {/* Dual arena */}
            <div className="flex gap-2 mb-4">
              <MiniArena label={`👤 ${state.player.name}`} heroes={playerEmojis} dmgLog={playerDmgLog} />
              <MiniArena label={`🤖 ${partner.name}`} heroes={partner.heroes} dmgLog={aiDmgLog} isAI />
            </div>

            {/* Stats */}
            <div className="glass-card px-4 py-2 mb-4 flex justify-around text-center" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div className="font-black text-lg text-[#39ff14]">{totalKills}</div>
                <div className="text-[10px] text-[#6b7a99]">Quái đã diệt</div>
              </div>
              <div>
                <div className="font-black text-lg text-[#ff6600]">
                  {playerDmgLog.reduce((a, b) => a + b, 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-[#6b7a99]">DMG của bạn</div>
              </div>
              <div>
                <div className="font-black text-lg text-[#9b30ff]">
                  {aiDmgLog.reduce((a, b) => a + b, 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-[#6b7a99]">DMG đối tác</div>
              </div>
            </div>

            <button onClick={endBattle} className="w-full py-3 rounded-xl text-sm text-[#6b7a99]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              Bỏ Cuộc
            </button>
          </div>
        )}

        {status === 'victory' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8">
            <div className="text-6xl mb-3">🎉</div>
            <h2 className="font-cinzel font-black text-2xl text-[#ffd700] mb-1">CHIẾN THẮNG!</h2>
            <p className="text-[#6b7a99] text-sm mb-6">Co-op thành công cùng {partner.name}</p>
            <div className="glass-card px-6 py-4 inline-block mb-6" style={{ border: '1px solid rgba(255,215,0,0.3)' }}>
              <div className="text-[#ffd700] font-bold text-lg">🪙 +{rewards.gold.toLocaleString()} Vàng</div>
              <div className="text-[#4fc3f7] font-bold">✨ +{rewards.exp} EXP</div>
            </div>
            <button onClick={() => setStatus('lobby')}
              className="block w-full py-3 rounded-xl font-cinzel font-bold"
              style={{ background: 'rgba(255,215,0,0.15)', border: '1.5px solid rgba(255,215,0,0.3)', color: '#ffd700' }}>
              CHƠI LẠI
            </button>
          </motion.div>
        )}
      </div>

      <BottomNav active="coop" />
    </div>
  );
}
