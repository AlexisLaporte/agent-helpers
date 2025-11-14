'use client';

import { Suspense } from 'react';
import DuplicatesContent from './DuplicatesContent';

export default function DuplicatesPage() {
  return (
    <Suspense fallback={
      <div className="p-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Analyzing duplicates across all projects...
          </p>
        </div>
      </div>
    }>
      <DuplicatesContent />
    </Suspense>
  );
}
