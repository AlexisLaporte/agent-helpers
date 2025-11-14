'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { OutputStyle } from '@agent-helpers/core/types';

interface LocalOutputStylesSectionProps {
  projectPath?: string;
}

export default function LocalOutputStylesSection({ projectPath }: LocalOutputStylesSectionProps) {
  const [localStyles, setLocalStyles] = useState<OutputStyle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocalStyles();
  }, [projectPath]);

  const fetchLocalStyles = async () => {
    try {
      const url = projectPath
        ? `/api/output-styles/local?project=${encodeURIComponent(projectPath)}`
        : '/api/output-styles/local';
      const response = await fetch(url);
      const data = await response.json();
      setLocalStyles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load local output styles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!loading && localStyles.length > 0 && (
        <div className="flex justify-end mb-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {localStyles.length} installed
          </span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            Loading local output styles...
          </p>
        </div>
      ) : localStyles.length === 0 ? (
        <div className="rounded-lg p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <p className="text-yellow-800 dark:text-yellow-300">
            No output styles found in your local directory. Check your{' '}
            <Link href="/settings" className="underline">
              settings
            </Link>{' '}
            to configure the correct path.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localStyles.map((style) => (
            <div
              key={style.name}
              className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-green-500 dark:border-green-600"
            >
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                  Installed
                </span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 pr-20">
                {style.name}
              </h4>
              <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                {style.description}
              </p>
              <Link
                href={`/browse/${style.name}`}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                View details →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
