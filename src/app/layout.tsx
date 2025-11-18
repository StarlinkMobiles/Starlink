import "./globals.css";
import { ReactNode } from "react";

interface RootLayoutProps { children: ReactNode; }

export const metadata = {
  title: "🎄 Christmas Gift Portal 🎁",
  description: "Register to receive $2,000–$10,000 randomly this Christmas!"
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="relative min-h-screen bg-gradient-to-br from-red-900 via-red-700 to-red-500 text-white overflow-x-hidden">
        {/* decorative overlay (optional image in public/) */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('/snow-bg.png')] bg-cover bg-center" />
        {/* server-side wrapper; Client components will be rendered inside */}
        <div className="relative z-10 flex flex-col items-center justify-start min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
