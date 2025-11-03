'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SourceBadge from './SourceBadge';
import type { CustomizationSource } from '@/lib/types';

interface LibraryCardProps {
  name: string;
  description: string;
  type: 'skill' | 'command' | 'agent' | 'output-style';
  isInstalled: boolean;
  isModified?: boolean;
  source?: CustomizationSource;
  detailPath: string;
}

export default function LibraryCard({
  name,
  description,
  type,
  isInstalled,
  isModified,
  source,
  detailPath,
}: LibraryCardProps) {
  const [installing, setInstalling] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  const handleInstall = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent card link navigation

    if (!confirm(`Install "${name}"?\n\nThis will copy the template to your local ~/.claude directory.`)) {
      return;
    }

    setInstalling(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/install/${type}/${name}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Installed successfully!' });
        // Refresh the page to update isInstalled status
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Installation failed' });
      }
    } catch (error) {
      console.error('Failed to install:', error);
      setMessage({ type: 'error', text: 'Installation failed' });
    } finally {
      setInstalling(false);
    }
  };

  const displayName = type === 'output-style' ? 'Output Style' : type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all overflow-hidden ${
        isInstalled
          ? 'border-2 border-green-500 dark:border-green-600'
          : 'border-2 border-gray-200 dark:border-gray-700'
      }`}
    >
      {/* Main content - clickable */}
      <Link href={detailPath} className="block p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {type === 'command' ? `/${name}` : name}
          </h3>
          {source && <SourceBadge source={source} />}
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          {description}
        </p>
      </Link>

      {/* Footer with status and actions */}
      <div className="px-6 pb-6 pt-2 border-t border-gray-100 dark:border-gray-700">
        {message && (
          <div
            className={`mb-3 p-2 rounded text-sm ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          {/* Status */}
          <div className="flex items-center gap-2">
            {isInstalled ? (
              <>
                <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium">
                  ✓ Installed
                </span>
                {isModified && (
                  <span className="inline-flex items-center px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs font-medium">
                    Modified
                  </span>
                )}
              </>
            ) : (
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                Not installed
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {!isInstalled && (
              <button
                onClick={handleInstall}
                disabled={installing}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm font-medium transition-colors"
              >
                {installing ? 'Installing...' : '📥 Install'}
              </button>
            )}
            <Link
              href={detailPath}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm font-medium transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
