import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Trading Agent - Hybrid Intelligence Platform",
  description: "Advanced AI-powered trading analysis using Qwen and Gemini models for crypto, forex, and stock markets",
  keywords: "AI trading, algorithmic trading, Qwen, Gemini, crypto trading, forex, stocks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
          themes={['light', 'dark']}
        >
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
