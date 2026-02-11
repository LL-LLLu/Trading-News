import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { ChatPanel } from "@/components/chat/ChatPanel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trading News | Economic Calendar Dashboard",
  description:
    "AI-powered economic calendar with market impact analysis, powered by Google Gemini",
  openGraph: {
    title: "Trading News Dashboard",
    description:
      "Track economic events, get AI analysis, and stay ahead of market-moving data releases.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <Sidebar />
            <main className="flex-1 min-w-0 pb-16 md:pb-0">{children}</main>
          </div>
          <MobileNav />
          <ChatPanel />
        </ThemeProvider>
      </body>
    </html>
  );
}
