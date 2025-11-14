'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import PushToLibraryButton from '@/components/PushToLibraryButton';

import FileActions from '@/components/FileActions';

interface CustomizationData {
  name: string;
  type: 'skill' | 'command' | 'agent' | 'output-style';
  content: string;
  description?: string;
  inLibrary: boolean;
  isModified: boolean;
}

export default function BrowseViewerPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = params.name as string;
  const project = searchParams.get('project');

  const [data, setData] = useState<CustomizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCustomization();
  }, [name, project]);

  const loadCustomization = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = new URL(`/api/customization/local/${encodeURIComponent(name)}`, window.location.origin);
      if (project) {
        url.searchParams.set('project', project);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Customization not found locally');
      }

      const result = await response.json();
      setData(result);
      setContent(result.content);
      setOriginalContent(result.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customization');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!data) return;

    try {
      setSaving(true);

      const response = await fetch(`/api/${data.type}s/${data.name}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      setOriginalContent(content);
      setEditMode(false);
      // Refresh to update isModified status
      await loadCustomization();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setContent(originalContent);
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-800 dark:text-red-300">{error || 'Not found'}</p>
          </div>
          <Link
            href="/browse"
            className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  const typeLabels = {
    skill: 'Skill',
    command: 'Command',
    agent: 'Agent',
    'output-style': 'Output Style',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/browse"
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
          >
            ← Back to Browse
          </Link>

          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {data.name}
              </h1>
              {project && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  From project: <span className="font-mono bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">{project}</span>
                </p>
              )}
              {data.description && (
                <p className="text-gray-600 dark:text-gray-300">{data.description}</p>
              )}
            </div>

            <div className="flex gap-2 items-center flex-shrink-0">
              <span className="px-3 py-1 text-sm font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                Installed
              </span>
              {data.isModified && (
                <span className="px-3 py-1 text-sm font-semibold bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded">
                  Modified
                </span>
              )}
              <span className="px-3 py-1 text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded">
                {typeLabels[data.type]}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 items-center">
            {!editMode ? (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors"
                >
                  Edit
                </button>
                {data.isModified && data.inLibrary && (
                  <PushToLibraryButton name={data.name} type={data.type} />
                )}
                {data.inLibrary && (
                  <Link
                    href={`/library/${data.name}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    View Library Template →
                  </Link>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving || content === originalContent}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {editMode ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-96 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>

        <FileActions name={data.name} type={data.type} isLocal={true} hideEdit={true} />
      </div>
    </div>
  );
}
