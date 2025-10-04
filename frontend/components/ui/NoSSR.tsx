'use client';

import { useState, useEffect, ReactNode } from 'react';

interface NoSSRProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * NoSSR component to prevent hydration mismatches
 * Renders children only on the client side
 */
export default function NoSSR({ children, fallback = null }: NoSSRProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}