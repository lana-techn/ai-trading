import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LandingLayout from '@/components/layout/LandingLayout';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "NousTrade - Hybrid Intelligence Platform",
  description: "Advanced AI-powered trading analysis using Qwen and Gemini models for crypto, forex, and stock markets",
  keywords: "AI trading, algorithmic trading, Qwen, Gemini, crypto trading, forex, stocks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} antialiased`}>
          <ThemeProvider>
            <LandingLayout>
              {children}
            </LandingLayout>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
