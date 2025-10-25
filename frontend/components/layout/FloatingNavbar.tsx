/**
 * Modern floating navbar component with glass morphism effect
 * Replaces traditional sidebar for better user experience
 */

'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  BriefcaseIcon,
  AcademicCapIcon,
  SparklesIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import AuthButton from '@/components/auth/AuthButton';

// Mobile navigation items (all pages)
const mobileNavigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Dashboard', href: '/dashboard', icon: ChartPieIcon },
  { name: 'Paper Trading', href: '/trading', icon: BoltIcon },
  { name: 'Portfolio', href: '/portfolio', icon: BriefcaseIcon },
  { name: 'Charts', href: '/charts', icon: ChartBarIcon },
  { name: 'Tutorials', href: '/tutorials', icon: BookOpenIcon },
  { name: 'AI Analysis', href: '/analysis', icon: SparklesIcon },
  { name: 'Analytics & Results', href: '/analytics-results', icon: ChartBarIcon },
  { name: 'AI Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

// Desktop navigation with dropdown menus
const desktopNavigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: ChartPieIcon,
    type: 'link'
  },
  {
    name: 'Trading',
    icon: BoltIcon,
    type: 'dropdown',
    items: [
      { name: 'Paper Trading', href: '/trading', icon: BoltIcon, description: 'Practice trading with virtual money' },
      { name: 'Portfolio', href: '/portfolio', icon: BriefcaseIcon, description: 'Manage your trading portfolio' },
      { name: 'Charts', href: '/charts', icon: ChartBarIcon, description: 'Technical analysis & charting tools' },
    ]
  },
  {
    name: 'Learn',
    icon: AcademicCapIcon,
    type: 'dropdown',
    items: [
      { name: 'Tutorials', href: '/tutorials', icon: BookOpenIcon, description: 'Step-by-step trading guides' },
      { name: 'AI Analysis', href: '/analysis', icon: SparklesIcon, description: 'AI-powered market insights' },
      { name: 'Analytics & Results', href: '/analytics-results', icon: ChartBarIcon, description: 'Platform performance & research data' },
    ]
  },
  { 
    name: 'AI Chat', 
    href: '/chat', 
    icon: ChatBubbleLeftRightIcon,
    type: 'link'
  },
];

function FloatingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Handle scroll effect with passive listener for better performance
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(prev => prev !== isScrolled ? isScrolled : prev);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu and dropdowns on route change
  useEffect(() => {
    setIsOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  // Memoize toggle handler
  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Memoize close handler
  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Prefetch on hover for faster navigation
  const handlePrefetch = useCallback((href: string) => {
    router.prefetch(href);
  }, [router]);

  return (
    <>
      {/* Desktop Floating Navbar */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
        scrolled 
          ? "py-2" 
          : "py-4"
      )}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={cn(
            "relative rounded-2xl transition-all duration-500 ease-out",
            "backdrop-blur-md border border-border/20",
            scrolled
              ? "bg-background/90 shadow-lg shadow-black/5 dark:shadow-black/25"
              : "bg-background/80 shadow-xl shadow-black/3 dark:shadow-black/20"
          )}>
            <div className="flex items-center justify-between px-4 py-3">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="relative">
                  <div className={cn(
                    "h-9 w-9 rounded-lg transition-all duration-300 group-hover:scale-110",
                    "bg-primary text-primary-foreground",
                    "flex items-center justify-center shadow-lg"
                  )}>
                    <CpuChipIcon className="h-5 w-5" />
                  </div>
                  <div className="absolute -inset-2 bg-primary/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">
                    NousTrade
                  </h1>
                  <p className="text-xs text-muted-foreground hidden xl:block">AI Trading</p>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-1">
                {desktopNavigation.map((item) => {
                  if (item.type === 'link') {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href!}
                        onMouseEnter={() => handlePrefetch(item.href!)}
                        className={cn(
                          "flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all duration-300",
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
                  }

                  // Dropdown menu
                  const isDropdownOpen = openDropdown === item.name;
                  const isAnyChildActive = item.items?.some(child => pathname === child.href);
                  
                  return (
                    <div
                      key={item.name}
                      className="relative"
                      onMouseEnter={() => setOpenDropdown(item.name)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      {/* Dropdown Trigger */}
                      <button
                        onClick={() => setOpenDropdown(isDropdownOpen ? null : item.name)}
                        className={cn(
                          "flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all duration-300",
                          "text-sm font-medium relative group",
                          isDropdownOpen || isAnyChildActive
                            ? "text-primary-foreground bg-primary shadow-lg shadow-primary/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="hidden xl:inline">{item.name}</span>
                        <ChevronDownIcon className={cn(
                          "h-3 w-3 transition-transform duration-300",
                          isDropdownOpen && "rotate-180"
                        )} />
                      </button>

                      {/* Dropdown Menu */}
                      <div className={cn(
                        "absolute top-full left-0 mt-2 w-72 origin-top-left transition-all duration-300 ease-out z-50",
                        isDropdownOpen
                          ? "opacity-100 scale-100 visible translate-y-0"
                          : "opacity-0 scale-95 invisible -translate-y-2"
                      )}>
                        <div className="bg-background/95 backdrop-blur-md rounded-xl border border-border/30 shadow-2xl overflow-hidden">
                          <div className="py-2">
                            {item.items?.map((child, idx) => {
                              const isChildActive = pathname === child.href;
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onMouseEnter={() => handlePrefetch(child.href)}
                                  className={cn(
                                    "flex items-start space-x-3 px-4 py-3 transition-all duration-200",
                                    "hover:bg-secondary/80 group",
                                    isChildActive && "bg-primary/10"
                                  )}
                                  style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                  {/* Icon */}
                                  <div className={cn(
                                    "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200",
                                    isChildActive
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary"
                                  )}>
                                    <child.icon className="h-5 w-5" />
                                  </div>

                                  {/* Text */}
                                  <div className="flex-1 min-w-0">
                                    <div className={cn(
                                      "text-sm font-medium transition-colors",
                                      isChildActive ? "text-primary" : "text-foreground"
                                    )}>
                                      {child.name}
                                    </div>
                                    {child.description && (
                                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                        {child.description}
                                      </div>
                                    )}
                                  </div>

                                  {/* Active Indicator */}
                                  {isChildActive && (
                                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right side actions */}
              <div className="flex items-center space-x-2">
                {/* Auth Button */}
                <AuthButton />
                
                {/* Theme Toggle */}
                <div className="hidden sm:block">
                  <ThemeToggle />
                </div>

                {/* Settings (Desktop) */}
                <Link
                  href="/settings"
                  className={cn(
                    "hidden lg:flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300",
                    pathname === '/settings'
                      ? "text-primary-foreground bg-primary shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  )}
                >
                  <CogIcon className="h-4 w-4" />
                </Link>

                {/* Mobile menu button */}
                <button
                  onClick={toggleMenu}
                  className={cn(
                    "lg:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300",
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
          onClick={closeMenu}
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
                {mobileNavigation.map((item, index) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onMouseEnter={() => handlePrefetch(item.href)}
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
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(FloatingNavbar);