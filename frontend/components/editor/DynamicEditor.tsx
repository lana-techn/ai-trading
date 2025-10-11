'use client';

import dynamic from 'next/dynamic';

// Skeleton loading untuk editor
function EditorSkeleton() {
  return (
    <div className="w-full min-h-[200px] bg-muted animate-pulse rounded-lg flex items-center justify-center">
      <div className="text-sm text-muted-foreground">Loading editor...</div>
    </div>
  );
}

// Dynamic import untuk TipTap Editor dengan loading fallback
export const DynamicTipTapEditor = dynamic(
  () => import('@tiptap/react').then(mod => mod.useEditor),
  {
    loading: () => <EditorSkeleton />,
    ssr: false,
  }
);

// Dynamic import untuk Editor Content
export const DynamicEditorContent = dynamic(
  () => import('@tiptap/react').then(mod => mod.EditorContent),
  {
    loading: () => <EditorSkeleton />,
    ssr: false,
  }
);
