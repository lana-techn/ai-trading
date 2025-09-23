import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import Link from 'next/link';

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
          <div className="min-h-screen bg-background text-foreground">
            {/* Simple Navigation */}
            <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <span className="text-2xl">🤖</span>
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-foreground">AI Trading Agent</h1>
                        <p className="text-xs text-muted-foreground">Hybrid Intelligence Platform</p>
                      </div>
                    </div>
                    <div className="hidden md:flex space-x-6">
                      <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Dashboard
                      </Link>
                      <Link href="/charts" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Charts
                      </Link>
                      <Link href="/portfolio" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Portfolio
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ThemeToggle />
                    <div className="w-px h-6 bg-border"></div>
                    <div className="text-xs text-muted-foreground">
                      Status: <span className="text-green-600 dark:text-green-400 font-medium">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </nav>
            
            {/* Main Content */}
            <main className="flex-1">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
