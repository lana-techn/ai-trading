'use client';

import { useEffect, useState } from 'react';

export default function ThemeTest() {
  const [currentClasses, setCurrentClasses] = useState('');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateClasses = () => {
      const classes = document.documentElement.className;
      setCurrentClasses(classes);
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    updateClasses();
    
    // Create an observer to watch for class changes
    const observer = new MutationObserver(updateClasses);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  };

  const forceLight = () => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
  };

  const forceDark = () => {
    const root = document.documentElement;
    root.classList.remove('light');
    root.classList.add('dark');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg">
        <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Theme Debug</h3>
        
        <div className="space-y-2 text-xs">
          <div>
            <span className="text-gray-600 dark:text-gray-400">HTML Classes:</span>
            <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded font-mono">
              {currentClasses || 'none'}
            </div>
          </div>
          
          <div>
            <span className="text-gray-600 dark:text-gray-400">Is Dark:</span>
            <span className={cn("ml-1 px-1 rounded", isDark ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>
              {isDark.toString()}
            </span>
          </div>
          
          <div className="flex space-x-1 mt-2">
            <button
              onClick={toggleTheme}
              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              Toggle
            </button>
            <button
              onClick={forceLight}
              className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
            >
              Light
            </button>
            <button
              onClick={forceDark}
              className="px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-800"
            >
              Dark
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}