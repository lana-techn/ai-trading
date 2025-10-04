'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto p-8 bg-card rounded-lg border">
        <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
        <p className="text-muted-foreground">
          This is a minimal test page to check if the basic setup is working.
        </p>
        <button 
          onClick={() => alert('Button clicked!')}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Test Button
        </button>
      </div>
    </div>
  );
}