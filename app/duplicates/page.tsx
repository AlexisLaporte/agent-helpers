'use client';

import { Suspense } from 'react';
import DuplicatesContent from './DuplicatesContent';
import PageLayout from '../../components/PageLayout';

export default function DuplicatesPage() {
  return (
    <PageLayout className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Analyzing duplicates across all projects...
            </p>
          </div>
        </div>
      }>
        <DuplicatesContent />
      </Suspense>
    </PageLayout>
  );
}
