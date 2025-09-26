/**
 * Modern floating navbar component with glass morphism effect
 * Replaces traditional sidebar for better user experience
 */

'use client';

import { useState, useEffect } from 'react';
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
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { SmoothThemeToggle } from '@/components/ui/SmoothThemeToggle';

// Navigation items
const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Dashboard', href: '/dashboard', icon: ChartPieIcon },
  { name: 'AI Analysis', href: '/analysis', icon: CpuChipIcon },
  { name: 'Trading', href: '/trading', icon: BoltIcon },
  { name: 'Charts', href: '/charts', icon: ChartBarIcon },
  { name: 'Tutorials', href: '/tutorials', icon: BookOpenIcon },
  { name: 'AI Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export default function FloatingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop Floating Navbar */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
        scrolled 
          ? "py-2" 
          : "py-4"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={cn(
            "relative rounded-2xl transition-all duration-500 ease-out",
            "backdrop-blur-md border border-border/20",
            scrolled
              ? "bg-background/90 shadow-lg shadow-black/5 dark:shadow-black/25"
              : "bg-background/80 shadow-xl shadow-black/3 dark:shadow-black/20"
          )}>
            <div className="flex items-center justify-between px-6 py-4">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className={cn(
                    "h-10 w-10 rounded-xl transition-all duration-300 group-hover:scale-110",
                    "bg-primary text-primary-foreground",
                    "flex items-center justify-center shadow-lg"
                  )}>
                    <CpuChipIcon className="h-5 w-5" />
                  </div>
                  <div className="absolute -inset-2 bg-primary/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    AI Trader
                  </h1>
                  <p className="text-xs text-muted-foreground">Hybrid Intelligence</p>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-1">
                {navigation.slice(0, 6).map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300",
                        "text-sm font-medium relative group",
                        isActive
                          ? "text-primary-foreground bg-primary shadow-lg shadow-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                      )}
                    >
                      <item.icon className={cn(
                        "h-4 w-4 transition-transform duration-300",
                        !isActive && "group-hover:scale-110"
                      )} />
                      <span className="hidden xl:inline">{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Right side actions */}
              <div className="flex items-center space-x-4">
                {/* Theme Toggle */}
                <div className="hidden sm:block">
                  <SmoothThemeToggle variant="button" size="sm" />
                </div>

                {/* Settings (Desktop) */}
                <Link
                  href="/settings"
                  className={cn(
                    "hidden lg:flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300",
                    pathname === '/settings'
                      ? "text-primary-foreground bg-primary shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  )}
                >
                  <CogIcon className="h-4 w-4" />
                </Link>

                {/* Mobile menu button */}
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className={cn(
                    "lg:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300",
                    "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  )}
                >
                  {isOpen ? (
                    <XMarkIcon className="h-5 w-5" />
                  ) : (
                    <Bars3Icon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={cn(
        "lg:hidden fixed inset-0 z-40 transition-all duration-300 ease-in-out",
        isOpen 
          ? "opacity-100 visible" 
          : "opacity-0 invisible"
      )}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-background/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
        
        {/* Mobile Menu */}
        <div className={cn(
          "absolute top-20 left-4 right-4 transition-all duration-500 ease-out",
          isOpen 
            ? "translate-y-0 opacity-100" 
            : "-translate-y-4 opacity-0"
        )}>
          <div className="bg-background/95 backdrop-blur-md rounded-2xl border border-border/30 shadow-2xl overflow-hidden">
            {/* Mobile Navigation Items */}
            <div className="px-4 py-6">
              <div className="grid gap-2">
                {navigation.map((item, index) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300",
                        "transform hover:scale-[1.02] active:scale-[0.98]",
                        isActive
                          ? "text-primary-foreground bg-primary shadow-lg shadow-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                      )}
                      style={{
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Theme Toggle for Mobile */}
              <div className="mt-6 pt-6 border-t border-border/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Theme
                  </span>
                  <SmoothThemeToggle variant="button" size="sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}