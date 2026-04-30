"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/contexts/game-context";
import BottomNav from "@/components/game/BottomNav";

const GUILD_UNLOCK_LEVEL = 15;

export default function GuildPage() {
  const { state } = useGame();
  const [tab, setTab] = useState<'info' | 'create' | 'join'>('info');
  const [guildName, setGuildName] = useState('');
  const locked = state.player.level < GUILD_UNLOCK_LEVEL;

  if (locked) {
    return (
      <div className="min-h-screen pb-24 flex flex-col items-center justify-center px-6 text-center" style={{ background: 'linear-gradient(180deg,#05080f 0%,#0a0820 100%)' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
          <div className="text-6xl mb-4">🏯</div>
          <h1 className="font-cinzel font-black text-xl text-[#ffd700] mb-2">GUILD</h1>
          <p className="text-[#6b7a99] text-sm mb-2">Tính năng mở khi đạt Level {GUILD_UNLOCK_LEVEL}</p>
          <div className="glass-card px-4 py-2 inline-block">
            <span className="text-[#ff0066] font-bold text-sm">Lv hiện tại: {state.player.level}</span>
          </div>
        </motion.div>
        <BottomNav active="guild" />
      </div>
    );
  }

  if (!state.guild) {
    return (
      <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg,#05080f 0%,#0a0820 100%)' }}>
        <div className="px-3 pt-4 pb-3">
          <h1 className="font-cinzel font-black text-lg text-[#ffd700] mb-4" style={{ textShadow: '0 0 10px rgba(255,215,0,0.4)' }}>
            🏯 GUILD
          </h1>
          <div className="flex gap-2 mb-6">
            {(['create', 'join'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2.5 rounded-xl font-cinzel font-bold text-sm transition-all"
                style={{
                  background: tab === t ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${tab === t ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.08)'}`,
                  color: tab === t ? '#ffd700' : '#6b7a99',
                }}
              >
                {t === 'create' ? '⚔️ Tạo Guild' : '🤝 Tham Gia'}
              </button>
            ))}
          </div>

          {tab === 'create' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#a0a8c0] mb-1.5 block font-cinzel">Tên Guild</label>
                <input
                  value={guildName}
                  onChange={e => setGuildName(e.target.value)}
                  placeholder="Nhập tên guild..."
                  maxLength={20}
                  className="w-full glass-card px-4 py-3 text-sm rounded-xl outline-none gold-border"
                  style={{ background: 'rgba(10,14,26,0.8)', color: '#f0e6c8' }}
                />
              </div>
              <div className="glass-card p-3 space-y-1" style={{ border: '1px solid rgba(255,215,0,0.15)' }}>
                <div className="text-xs text-[#6b7a99]">📋 Yêu cầu tạo guild:</div>
                <div className="text-xs text-[#a0a8c0]">• 💎 Chi phí: 500 Kim Cương</div>
                <div className="text-xs text-[#a0a8c0]">• 👥 Tối đa 30 thành viên</div>
                <div className="text-xs text-[#a0a8c0]">• ⚔️ Đánh boss guild hàng ngày</div>
              </div>
              <motion.button
                className="w-full py-3 rounded-xl font-cinzel font-bold text-[#0a0e1a]"
                style={{ background: guildName.trim().length >= 3 ? 'linear-gradient(135deg,#ffd700,#ff9500)' : '#3a4060' }}
                whileTap={{ scale: 0.97 }}
                disabled={guildName.trim().length < 3 || state.player.diamond < 500}
              >
                TẠO GUILD ({state.player.diamond}/500 💎)
              </motion.button>
            </div>
          )}

          {tab === 'join' && (
            <div className="space-y-3">
              {[
                { name: 'Long Vương Điện', level: 5, members: 18, power: '2.4M' },
                { name: 'Thiên Kiếm Môn', level: 3, members: 12, power: '1.1M' },
                { name: 'Huyết Sát Đường', level: 7, members: 28, power: '5.2M' },
              ].map(g => (
                <div key={g.name} className="glass-card p-3" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-cinzel font-bold text-sm text-[#f0e6c8]">{g.name}</div>
                      <div className="text-[10px] text-[#6b7a99] mt-0.5">Lv {g.level} · {g.members}/30 thành viên · {g.power} sức mạnh</div>
                    </div>
                    <button className="text-[11px] font-bold text-[#ffd700] bg-[rgba(255,215,0,0.1)] px-3 py-1.5 rounded-lg border border-[rgba(255,215,0,0.25)]">
                      Xin vào
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <BottomNav active="guild" />
      </div>
    );
  }

  // Has guild
  const guild = state.guild;
  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg,#05080f 0%,#0a0820 100%)' }}>
      <div className="px-3 pt-4 pb-3">
        <div className="glass-card p-4 gold-border mb-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏯</span>
            <div>
              <h1 className="font-cinzel font-black text-base text-[#ffd700]">{guild.name}</h1>
              <div className="text-[11px] text-[#6b7a99]">Level {guild.level} · {guild.members.length} thành viên</div>
              {guild.expBonus > 0 && <div className="text-[10px] text-[#39ff14]">+{guild.expBonus}% EXP bonus</div>}
            </div>
          </div>
        </div>

        <motion.button
          className="w-full py-3 rounded-xl font-cinzel font-bold mb-3"
          style={{
            background: guild.bossDefeated ? 'rgba(57,255,20,0.1)' : 'linear-gradient(135deg,#ff0066,#9d00ff)',
            border: `1.5px solid ${guild.bossDefeated ? 'rgba(57,255,20,0.3)' : 'rgba(255,0,102,0.4)'}`,
            color: guild.bossDefeated ? '#39ff14' : '#fff',
          }}
          whileTap={!guild.bossDefeated ? { scale: 0.97 } : {}}
          disabled={guild.bossDefeated}
        >
          {guild.bossDefeated ? '✅ Boss Đã Hạ (Reset 00:00)' : '👹 ĐÁNH BOSS GUILD'}
        </motion.button>

        <h3 className="font-cinzel font-bold text-xs text-[#ffd700] mb-2 tracking-wider">THÀNH VIÊN</h3>
        <div className="space-y-2">
          {guild.members.map(m => (
            <div key={m.id} className="glass-card p-3 flex items-center gap-3" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-2xl">{m.avatar || '⚔️'}</span>
              <div className="flex-1">
                <div className="text-xs font-bold text-[#f0e6c8]">{m.name}</div>
                <div className="text-[10px] text-[#6b7a99]">Lv.{m.level}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav active="guild" />
    </div>
  );
}
