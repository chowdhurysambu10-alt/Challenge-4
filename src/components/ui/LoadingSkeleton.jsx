import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse p-4 text-left" role="status" aria-label="Loading workspace module">
      {/* Header Skeleton */}
      <div className="h-8 bg-neutral-250 dark:bg-neutral-800 rounded-2xl w-1/4 mb-4" />
      
      {/* Content Grid Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-neutral-250 dark:bg-neutral-800 rounded-[32px]" />
        <div className="h-96 bg-neutral-250 dark:bg-neutral-800 rounded-[32px]" />
      </div>
    </div>
  );
}
