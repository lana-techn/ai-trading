/**
 * Modern layout for landing page with floating navbar
 * Provides full-width experience with responsive design
 */

'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import FloatingNavbar from './FloatingNavbar';

interface LandingLayoutProps {
  children: ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Floating Navbar */}
      <FloatingNavbar />

      {/* Main content */}
      <main className={isLandingPage ? "" : "pt-24"}>
        {isLandingPage ? (
          // Landing page gets full width without padding
          children
        ) : (
          // Regular pages get container and padding
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        )}
      </main>
    </div>
  );
}
