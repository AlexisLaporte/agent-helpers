'use client';

import { useEffect, useState } from 'react';
import { LibrarySource } from '@agent-helpers/core/types';
import { generateImportURL } from '@agent-helpers/core/library-parser';

export default function SourcesPage() {
  const [sources, setSources] = useState<LibrarySource[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSourceInput, setNewSourceInput] = useState('');
  const [addError, setAddError] = useState('');

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      const response = await fetch('/api/library-sources');
      if (response.ok) {
        const data = await response.json();
        setSources(data);
      }
    } catch (error) {
      console.error('Error loading sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (sourceId: string) => {
    setSyncing(sourceId);
    try {
      const response = await fetch(`/api/library-sources/${sourceId}/sync`, {
        method: 'POST',
      });

      if (response.ok) {
        await loadSources();
      } else {
        const error = await response.json();
        alert(`Sync failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error syncing source:', error);
      alert('Sync failed');
    } finally {
      setSyncing(null);
    }
  };

  const handleToggle = async (sourceId: string) => {
    try {
      const response = await fetch(`/api/library-sources/${sourceId}/toggle`, {
        method: 'POST',
      });

      if (response.ok) {
        await loadSources();
      }
    } catch (error) {
      console.error('Error toggling source:', error);
    }
  };

  const handleDelete = async (sourceId: string, sourceName: string) => {
    if (!confirm(`Remove library "${sourceName}"?`)) return;

    try {
      const response = await fetch(`/api/library-sources?id=${sourceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadSources();
      }
    } catch (error) {
      console.error('Error deleting source:', error);
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    try {
      const response = await fetch('/api/library-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: newSourceInput }),
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewSourceInput('');
        await loadSources();
      } else {
        const error = await response.json();
        setAddError(error.error || 'Failed to add library');
      }
    } catch (error) {
      setAddError('Network error');
    }
  };

  const copyShareLink = (source: LibrarySource) => {
    const shareUrl = generateImportURL(source);
    navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Template Sources
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your template library sources
        </p>
      </div>

      {/* Add Source Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          + Add Source
        </button>
      </div>

      {/* Sources List */}
      <div className="space-y-4">
        {sources.map((source) => (
          <div
            key={source.id}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {source.name}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      source.type === 'bundled'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : source.type === 'git'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : source.type === 'gist'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {source.type}
                  </span>
                  {!source.enabled && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      disabled
                    </span>
                  )}
                </div>

                {source.url && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-mono">
                    {source.url}
                  </div>
                )}

                {source.path && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-mono">
                    {source.path}
                  </div>
                )}

                {source.stats && (
                  <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{source.stats.skills} skills</span>
                    <span>{source.stats.commands} commands</span>
                    <span>{source.stats.agents} agents</span>
                    <span>{source.stats.outputStyles} output-styles</span>
                  </div>
                )}

                {source.lastSync && (
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Last synced: {new Date(source.lastSync).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {source.type !== 'bundled' && (
                  <>
                    <button
                      onClick={() => handleSync(source.id)}
                      disabled={syncing === source.id}
                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded transition-colors disabled:opacity-50"
                    >
                      {syncing === source.id ? 'Syncing...' : 'Sync'}
                    </button>

                    <button
                      onClick={() => copyShareLink(source)}
                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded transition-colors"
                      title="Copy share link"
                    >
                      📋 Share
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleToggle(source.id)}
                  className={`px-3 py-1.5 text-sm rounded transition-colors ${
                    source.enabled
                      ? 'bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {source.enabled ? 'Enabled' : 'Disabled'}
                </button>

                {source.type !== 'bundled' && (
                  <button
                    onClick={() => handleDelete(source.id, source.name)}
                    className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Add Template Library
            </h2>

            <form onSubmit={handleAddSource}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Library URL or share link
                </label>
                <input
                  type="text"
                  value={newSourceInput}
                  onChange={(e) => setNewSourceInput(e.target.value)}
                  placeholder="https://github.com/user/library or agent-helpers://..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Supported formats:
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>agent-helpers://library/add?url=...</li>
                    <li>https://github.com/user/library</li>
                    <li>https://gist.github.com/user/id</li>
                    <li>/local/path/to/library</li>
                  </ul>
                </div>
              </div>

              {addError && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
                  {addError}
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewSourceInput('');
                    setAddError('');
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Add Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
