'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DiffViewer from './DiffViewer';

interface PushToLibraryButtonProps {
  name: string;
  type: 'skill' | 'command' | 'agent' | 'output-style';
  className?: string;
}

export default function PushToLibraryButton({ name, type, className = '' }: PushToLibraryButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [diff, setDiff] = useState<{
    localContent: string;
    libraryContent: string;
    isModified: boolean;
  } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  const handleOpenModal = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/push/${type}/${name}`);

      if (!response.ok) {
        throw new Error('Failed to load diff');
      }

      const data = await response.json();
      setDiff(data);
      setShowModal(true);
    } catch (error) {
      console.error('Failed to load diff:', error);
      setMessage({ type: 'error', text: 'Failed to load diff' });
    } finally {
      setLoading(false);
    }
  };

  const handlePush = async () => {
    if (!confirm(`Push "${name}" to library?\n\nThis will overwrite the library version with your local changes.`)) {
      return;
    }

    setPushing(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/push/${type}/${name}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Pushed successfully!' });
        setTimeout(() => {
          setShowModal(false);
          router.refresh();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Push failed' });
      }
    } catch (error) {
      console.error('Failed to push:', error);
      setMessage({ type: 'error', text: 'Push failed' });
    } finally {
      setPushing(false);
    }
  };

  return (
    <>
      {/* Push Button */}
      <div className={className}>
        {message && !showModal && (
          <div
            className={`mb-3 p-3 rounded ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          onClick={handleOpenModal}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
        >
          {loading ? 'Loading...' : '↑ Push to Library'}
        </button>
      </div>

      {/* Modal */}
      {showModal && diff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Push to Library: {name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Review changes before pushing to library
              </p>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {message && (
                <div
                  className={`mb-4 p-4 rounded ${
                    message.type === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                  }`}
                >
                  {message.text}
                </div>
              )}

              {diff.isModified ? (
                <>
                  <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                    <p className="text-yellow-800 dark:text-yellow-200">
                      <strong>Warning:</strong> Your local version differs from the library version.
                      Pushing will overwrite the library version with your changes.
                    </p>
                  </div>

                  <DiffViewer
                    localContent={diff.localContent}
                    libraryContent={diff.libraryContent}
                  />
                </>
              ) : (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                  <p className="text-blue-800 dark:text-blue-200">
                    No changes detected. Your local version is identical to the library version.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={pushing}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePush}
                disabled={pushing || !diff.isModified}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
              >
                {pushing ? 'Pushing...' : '↑ Push to Library'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
