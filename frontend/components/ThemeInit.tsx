'use client';

import { useEffect } from 'react';
import { themeManager } from '@/lib/theme';

export default function ThemeInit() {
  useEffect(() => {
    // Force theme manager initialization
    if (themeManager) {
      console.log('Theme manager initialized');
    }
  }, []);

  return null;
}