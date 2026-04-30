"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { id: "campaign",    label: "Chiến Dịch", emoji: "🗺️", href: "/campaign" },
  { id: "gacha",       label: "Triệu Hồi",  emoji: "🎲", href: "/gacha" },
  { id: "home",        label: "Sảnh",        emoji: "🏠", href: "/" },
  { id: "heroes",      label: "Tướng",       emoji: "👑", href: "/heroes" },
  { id: "leaderboard", label: "Xếp Hạng",   emoji: "🏆", href: "/leaderboard" },
  { id: "coop",        label: "Co-op",        emoji: "🤝", href: "/coop" },
  { id: "dungeon",     label: "Hầm Ngục",   emoji: "🏰", href: "/dungeon" },
] as const;

type NavId = (typeof NAV_ITEMS)[number]["id"];

export default function BottomNav({ active }: { active: NavId }) {
  const router = useRouter();

  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 pb-safe"
      style={{
        background: "rgba(5,8,15,0.96)",
        borderTop: "1px solid rgba(255,215,0,0.15)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div className="flex items-center justify-around px-1 py-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === active;
          return (
            <motion.button
              key={item.id}
              onClick={() => router.push(item.href)}
              className="flex flex-col items-center gap-0.5 min-w-0 flex-1 py-1 px-0.5 rounded-lg relative"
              style={{
                background: isActive ? "rgba(255,215,0,0.08)" : "transparent",
              }}
              whileTap={{ scale: 0.9 }}
            >
              {isActive && (
                <motion.div
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full"
                  style={{ background: "#ffd700", boxShadow: "0 0 8px #ffd700" }}
                  layoutId="nav-indicator"
                />
              )}
              <span
                className="text-lg leading-none"
                style={{
                  filter: isActive ? "drop-shadow(0 0 6px #ffd700)" : "none",
                  fontSize: item.id === "home" ? "1.4rem" : "1.1rem",
                }}
              >
                {item.emoji}
              </span>
              <span
                className="text-[9px] leading-none font-medium truncate w-full text-center"
                style={{ color: isActive ? "#ffd700" : "#6b7a99" }}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
