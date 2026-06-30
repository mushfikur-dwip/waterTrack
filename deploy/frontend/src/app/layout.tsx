import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WaterTrack",
  description: "Telegram water reminder bot and web portal"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
