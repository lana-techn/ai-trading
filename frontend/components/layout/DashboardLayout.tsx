/**
 * Main dashboard layout with sidebar navigation and header
 */

'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  CpuChipIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  HomeIcon,
  BoltIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { SmoothThemeToggle } from '@/components/ui/SmoothThemeToggle';

interface DashboardLayoutProps {
  children: ReactNode;
}

// Navigation items
const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'AI Analysis', href: '/analysis', icon: CpuChipIcon },
  { name: 'Portfolio', href: '/portfolio', icon: ChartPieIcon },
  { name: 'Live Trading', href: '/trading', icon: BoltIcon },
  { name: 'Charts', href: '/charts', icon: ChartBarIcon },
  { name: 'AI Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background transition-colors duration-300">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-card shadow-xl">
          <div className="flex items-center justify-between px-4 py-6 border-b border-border">
            <h1 className="text-xl font-bold text-card-foreground">AI Trader</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-2 hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                    isActive
                      ? "bg-accent text-accent-foreground border-r-2 border-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-border lg:bg-card shadow-lg">
        <div className="flex items-center px-6 py-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gradient-to-r from-primary to-chart-2 rounded-lg flex items-center justify-center shadow-md">
                  <CpuChipIcon className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-card-foreground">AI Trader</h1>
                <p className="text-xs text-muted-foreground">Hybrid Intelligence</p>
              </div>
            </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                  isActive
                    ? "bg-accent text-accent-foreground border-r-2 border-primary shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-sm"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Status indicator */}
        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center space-x-3 px-3 py-2 rounded-md bg-chart-2/10 border border-chart-2/20">
            <div className="flex-shrink-0">
              <div className="h-2 w-2 bg-chart-2 rounded-full animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-chart-2 font-medium">AI Systems Online</p>
              <p className="text-xs text-chart-2/80">Qwen + Gemini Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 lg:ml-64">
        {/* Top header */}
        <header className="bg-card border-b border-border px-4 py-4 sm:px-6 lg:px-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden rounded-md p-2 hover:bg-accent text-muted-foreground transition-colors"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  AI-powered trading analysis and insights
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Market status */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-chart-2/10 rounded-full border border-chart-2/20">
                <div className="h-2 w-2 bg-chart-2 rounded-full animate-pulse" />
                <span className="text-sm text-chart-2 font-medium">Markets Open</span>
              </div>

              {/* Theme Toggle */}
              <SmoothThemeToggle 
                variant="button" 
                size="md" 
                className="hidden sm:block" 
              />

              {/* User menu placeholder */}
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-r from-chart-4 to-chart-5 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white text-sm font-medium">U</span>
                </div>
                <span className="hidden sm:block text-sm text-muted-foreground">User</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background transition-colors duration-300">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}