'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function ThemeTestPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Theme Test Page
        </h1>
        
        <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors duration-300">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Current Theme Info
          </h2>
          <div className="space-y-2 text-sm">
            <p className="text-slate-600 dark:text-slate-400">
              Theme: <span className="font-mono">{theme}</span>
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Resolved Theme: <span className="font-mono">{resolvedTheme}</span>
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Mounted: <span className="font-mono">{mounted ? 'true' : 'false'}</span>
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              HTML classList: <span className="font-mono">{Array.from(document.documentElement.classList).join(', ') || 'none'}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setTheme('light')}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors duration-200"
          >
            <SunIcon className="h-4 w-4" />
            Light
          </button>
          
          <button
            onClick={() => setTheme('dark')}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors duration-200"
          >
            <MoonIcon className="h-4 w-4" />
            Dark
          </button>
          
          <button
            onClick={() => setTheme('system')}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors duration-200"
          >
            System
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg transition-colors duration-300">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Light Mode Colors</h3>
            <p className="text-blue-700 dark:text-blue-300">This should be blue tones</p>
          </div>
          
          <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg transition-colors duration-300">
            <h3 className="font-semibold text-green-900 dark:text-green-100">Dark Mode Colors</h3>
            <p className="text-green-700 dark:text-green-300">This should be green tones</p>
          </div>
        </div>
      </div>
    </div>
  );
}