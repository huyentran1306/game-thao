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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Orbitron:wght@400;700;900&family=Spectral:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
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
