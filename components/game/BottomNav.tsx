"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { id: "campaign",    label: "Chiến Dịch", emoji: "🗺️", href: "/campaign",    color: "#4fc3f7", bg: "rgba(0,150,255,0.18)" },
  { id: "gacha",       label: "Triệu Hồi",  emoji: "🎲", href: "/gacha",        color: "#cc88ff", bg: "rgba(155,48,255,0.18)" },
  { id: "home",        label: "Sảnh",        emoji: "🏠", href: "/",             color: "#ffd700", bg: "rgba(255,180,0,0.18)" },
  { id: "heroes",      label: "Tướng",       emoji: "👑", href: "/heroes",       color: "#ffd700", bg: "rgba(255,200,0,0.15)" },
  { id: "leaderboard", label: "Xếp Hạng",   emoji: "🏆", href: "/leaderboard",  color: "#ff9944", bg: "rgba(255,120,0,0.16)" },
  { id: "coop",        label: "Co-op",        emoji: "🤝", href: "/coop",         color: "#39ff14", bg: "rgba(57,255,20,0.14)" },
  { id: "dungeon",     label: "Hầm Ngục",   emoji: "🏰", href: "/dungeon",      color: "#ff6688", bg: "rgba(255,0,80,0.14)" },
] as const;

type NavId = (typeof NAV_ITEMS)[number]["id"];

export default function BottomNav({ active }: { active: NavId }) {
  const router = useRouter();

  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 pb-safe"
      style={{
        background: "linear-gradient(180deg, rgba(4,6,16,0) 0%, rgba(4,6,16,0.97) 18px, rgba(4,6,16,0.99) 100%)",
        borderTop: "1px solid rgba(255,215,0,0.1)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* Top edge glow line */}
      <div
        className="absolute top-0 left-8 right-8 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.2), transparent)" }}
      />

      <div className="flex items-end justify-around px-1 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === active;
          const isHome = item.id === "home";

          return (
            <motion.button
              key={item.id}
              onClick={() => router.push(item.href)}
              className="flex flex-col items-center gap-1 min-w-0 flex-1 relative"
              style={{ paddingBottom: isHome ? 0 : 2 }}
              whileTap={{ scale: 0.88 }}
            >
              {/* Home button — larger + elevated */}
              {isHome ? (
                <div className="flex flex-col items-center -mt-4 gap-1">
                  <motion.div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl relative"
                    style={{
                      background: isActive
                        ? "linear-gradient(135deg, rgba(255,180,0,0.3) 0%, rgba(180,100,0,0.25) 100%)"
                        : "linear-gradient(135deg, rgba(30,24,8,0.95) 0%, rgba(20,16,4,0.95) 100%)",
                      border: `2px solid ${isActive ? "rgba(255,215,0,0.6)" : "rgba(255,215,0,0.25)"}`,
                      boxShadow: isActive
                        ? "0 0 20px rgba(255,215,0,0.4), 0 -4px 20px rgba(255,180,0,0.2)"
                        : "0 0 10px rgba(0,0,0,0.6)",
                    }}
                    animate={isActive ? { scale: [1, 1.04, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span style={{ fontSize: "1.5rem", filter: isActive ? "drop-shadow(0 0 8px #ffd700)" : "none" }}>
                      {item.emoji}
                    </span>
                  </motion.div>
                  <span
                    className="text-[9px] leading-none font-cinzel font-black"
                    style={{ color: isActive ? "#ffd700" : "#5a6888" }}
                  >
                    {item.label}
                  </span>
                </div>
              ) : (
                <>
                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }}
                      layoutId="nav-dot"
                    />
                  )}

                  {/* Icon with colored circle bg */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center relative"
                    style={{
                      background: isActive ? item.bg : "rgba(255,255,255,0.03)",
                      border: `1px solid ${isActive ? item.color + "40" : "rgba(255,255,255,0.05)"}`,
                      boxShadow: isActive ? `0 0 12px ${item.color}30` : "none",
                      transition: "all 0.2s",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1.05rem",
                        filter: isActive ? `drop-shadow(0 0 5px ${item.color})` : "grayscale(60%) opacity(0.7)",
                        transition: "filter 0.2s",
                      }}
                    >
                      {item.emoji}
                    </span>
                  </div>

                  <span
                    className="text-[8.5px] leading-none font-medium truncate w-full text-center"
                    style={{
                      color: isActive ? item.color : "#4a5878",
                      textShadow: isActive ? `0 0 8px ${item.color}60` : "none",
                      transition: "color 0.2s",
                    }}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
