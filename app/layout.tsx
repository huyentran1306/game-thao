import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GameProvider } from "@/contexts/game-context";

export const metadata: Metadata = {
  title: "Độc Tôn Chiến Thần",
  description: "Game chiến thuật mobile - Độc Tôn Chiến Thần",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#05080f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="h-full">
      <body className="min-h-full bg-[#05080f] text-[#f0e6c8] overscroll-none">
        <GameProvider>
          <div className="min-h-screen max-w-[430px] mx-auto relative overflow-x-hidden">
            {children}
          </div>
        </GameProvider>
      </body>
    </html>
  );
}
