'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { getTypeConfig } from '@/lib/customization-config';
import MarkdownContent from '@/components/MarkdownContent';
import FrontmatterDisplay from '@/components/FrontmatterDisplay';
import SourceBadge from '@/components/SourceBadge';
import InstallButton from '@/components/InstallButton';
import PushToLibraryButton from '@/components/PushToLibraryButton';
import JsonViewer from '@/components/JsonViewer';

export default function FilePage({ params }: { params: Promise<{ path: string[] }> }) {
  const [filePath, setFilePath] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [metadata, setMetadata] = useState<any>(null);
  const [isLocal, setIsLocal] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [inLibrary, setInLibrary] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const searchParams = useSearchParams();
  const editMode = searchParams.get('edit') === 'true';
  const source = searchParams.get('source') || undefined; // 'library' | 'local' | undefined
  const router = useRouter();

  useEffect(() => {
    params.then(p => setFilePath(p.path));
  }, [params]);

  useEffect(() => {
    if (filePath.length === 0) return;
    loadFile();
  }, [filePath]);

  // Update page title
  useEffect(() => {
    if (metadata?.name) {
      document.title = `${metadata.name} - Agent Helpers`;
    } else if (filePath.length > 0) {
      const fileName = filePath[filePath.length - 1] || '';
      document.title = `${fileName} - Agent Helpers`;
    }
  }, [metadata, filePath]);

  // Detect file type and name from path
  const getFileInfo = (): { type: string; name: string; isMarkdown: boolean } | null => {
    if (filePath.length === 0) return null;

    // skills/name.md
    if (filePath[0] === 'skills' && filePath.length === 2) {
      const name = filePath[1].replace(/\.md$/, '');
      return { type: 'skill', name, isMarkdown: true };
    }

    // commands/name.md
    if (filePath[0] === 'commands' && filePath.length === 2) {
      const name = filePath[1].replace(/\.md$/, '');
      return { type: 'command', name, isMarkdown: true };
    }

    // agents/name.md
    if (filePath[0] === 'agents' && filePath.length === 2) {
      const name = filePath[1].replace(/\.md$/, '');
      return { type: 'agent', name, isMarkdown: true };
    }

    // output-styles/name.md
    if (filePath[0] === 'output-styles' && filePath.length === 2) {
      const name = filePath[1].replace(/\.md$/, '');
      return { type: 'output-style', name, isMarkdown: true };
    }

    // settings.json
    if (filePath.length === 1 && filePath[0] === 'settings.json') {
      return { type: 'settings', name: 'settings', isMarkdown: false };
    }

    // settings.local.json
    if (filePath.length === 1 && filePath[0] === 'settings.local.json') {
      return { type: 'settings', name: 'settings.local', isMarkdown: false };
    }

    // statusline.sh
    if (filePath.length === 1 && filePath[0] === 'statusline.sh') {
      return { type: 'statusline', name: 'statusline', isMarkdown: false };
    }

    // hooks/xxx
    if (filePath.length === 2 && filePath[0] === 'hooks') {
      return { type: 'hook', name: filePath[1], isMarkdown: false };
    }

    return null;
  };

  const loadFile = async () => {
    try {
      setLoading(true);
      setError('');

      const fileInfo = getFileInfo();
      if (!fileInfo) {
        setError('Invalid file path');
        setLoading(false);
        return;
      }

      // Load file content based on type
      if (fileInfo.isMarkdown) {
        // Load from skills/commands/agents/output-styles APIs
        const url = source
          ? `/api/${fileInfo.type}s/${fileInfo.name}?source=${source}`
          : `/api/${fileInfo.type}s/${fileInfo.name}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to load file');
        }
        const data = await response.json();
        setContent(data.content || '');
        setOriginalContent(data.content || '');
        setMetadata(data);
        setIsLocal(data.isLocal || false);
        setIsModified(data.isModified || false);
        setInLibrary(data.inLibrary || false);
      } else {
        // Load from config-file API
        const path = filePath.join('/');
        const response = await fetch(`/api/config-file?path=${encodeURIComponent(path)}`);
        if (!response.ok) {
          throw new Error('Failed to load file');
        }
        const data = await response.json();
        setContent(data.content || '');
        setOriginalContent(data.content || '');
        setIsLocal(data.isLocal ?? true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      setError('');

      const path = filePath.join('/');
      const response = await fetch('/api/config-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, content }),
      });

      if (!response.ok) {
        throw new Error('Failed to save file');
      }

      setOriginalContent(content);
      setMessage('✓ File saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save file');
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = () => {
    setContent(originalContent);
    setMessage('');
    setError('');
  };

  const handleDelete = async () => {
    const fileInfo = getFileInfo();
    if (!fileInfo) return;

    const config = getTypeConfig(fileInfo.type);
    if (!config || !config.allowDelete) return;

    if (!confirm(`Are you sure you want to permanently delete this ${config.displayName.toLowerCase()}?`)) {
      return;
    }

    setDeleting(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`/api/files/${config.apiType}/${fileInfo.name}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage(`✓ ${config.displayName} deleted successfully`);
        setTimeout(() => router.push('/browse'), 1500);
      } else {
        const data = await response.json();
        setError(data.error || `Failed to delete ${config.displayName.toLowerCase()}`);
      }
    } catch (err) {
      console.error(`Failed to delete:`, err);
      setError(`Failed to delete`);
    } finally {
      setDeleting(false);
    }
  };

  const handleArchive = async () => {
    const fileInfo = getFileInfo();
    if (!fileInfo) return;

    const config = getTypeConfig(fileInfo.type);
    if (!config || !config.allowArchive) return;

    if (!confirm(`Archive this ${config.displayName.toLowerCase()}? You can restore it later.`)) {
      return;
    }

    setArchiving(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`/api/files/${config.apiType}/${fileInfo.name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive' }),
      });

      if (response.ok) {
        setMessage(`✓ ${config.displayName} archived successfully`);
        setTimeout(() => router.push('/browse'), 1500);
      } else {
        const data = await response.json();
        setError(data.error || `Failed to archive`);
      }
    } catch (err) {
      console.error(`Failed to archive:`, err);
      setError(`Failed to archive`);
    } finally {
      setArchiving(false);
    }
  };

  const toggleEditMode = () => {
    const currentPath = window.location.pathname;
    if (editMode) {
      router.push(currentPath);
    } else {
      router.push(`${currentPath}?edit=true`);
    }
  };

  const fileInfo = getFileInfo();
  const hasChanges = content !== originalContent;
  const fileName = filePath[filePath.length - 1] || '';
  const isJson = fileName.endsWith('.json');
  const isShell = fileName.endsWith('.sh');
  const config = fileInfo ? getTypeConfig(fileInfo.type) : null;

  if (loading) {
    return (
      <PageLayout className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </PageLayout>
    );
  }

  if (error && !content) {
    return (
      <PageLayout className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/browse"
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
          >
            ← Back
          </Link>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-800 dark:text-red-200">Error: {error}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!fileInfo) {
    notFound();
  }

  return (
    <PageLayout className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/browse"
          className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
        >
          ← Back
        </Link>

        <header className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {metadata?.name || fileName}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {metadata?.description || `File: .claude/${filePath.join('/')}`}
              </p>
            </div>

            {/* Badges */}
            <div className="flex gap-2 items-start ml-4">
              {isLocal ? (
                <>
                  <span className="px-3 py-1 text-sm font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded whitespace-nowrap">
                    ✓ Installed
                  </span>
                  {isModified && (
                    <span className="px-3 py-1 text-sm font-semibold bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded whitespace-nowrap">
                      Modified
                    </span>
                  )}
                </>
              ) : (
                fileInfo.isMarkdown && <InstallButton name={fileInfo.name} type={fileInfo.type} />
              )}
              {metadata?.source && <SourceBadge source={metadata.source} />}
              {isJson && (
                <span className="px-3 py-1 text-sm font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded whitespace-nowrap">
                  JSON
                </span>
              )}
              {isShell && (
                <span className="px-3 py-1 text-sm font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded whitespace-nowrap">
                  Shell Script
                </span>
              )}
              {fileInfo.isMarkdown && (
                <Link
                  href={`/file/${fileInfo.type}s/${fileInfo.name}.md`}
                  target="_blank"
                  className="px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
                >
                  📄 View Raw
                </Link>
              )}
              {isLocal && isModified && inLibrary && fileInfo.isMarkdown && (
                <PushToLibraryButton name={fileInfo.name} type={fileInfo.type} />
              )}
            </div>
          </div>
          {metadata?.content && <FrontmatterDisplay content={metadata.content} />}
        </header>

        {/* Messages */}
        {message && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200">{message}</p>
          </div>
        )}

        {error && content && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">Error: {error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {editMode ? (
            <>
              {/* Edit Mode - Editor */}
              <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Editor
                  </span>
                  {hasChanges && (
                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs font-semibold">
                      Modified
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={toggleEditMode}
                    className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRevert}
                    disabled={!hasChanges || saving}
                    className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Revert
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>

                  {config && (
                    <>
                      {config.allowArchive && (
                        <button
                          onClick={handleArchive}
                          disabled={archiving || deleting || saving}
                          className="px-4 py-2 text-sm bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          {archiving ? 'Archiving...' : '📦 Archive'}
                        </button>
                      )}

                      {config.allowDelete && (
                        <button
                          onClick={handleDelete}
                          disabled={archiving || deleting || saving}
                          className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deleting ? 'Deleting...' : '🗑️ Delete'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-[600px] p-4 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none resize-none"
                spellCheck={false}
              />
            </>
          ) : (
            <>
              {/* View Mode - JSON or Markdown */}
              {isJson ? (
                <JsonViewer content={content} />
              ) : (
                <div className="p-8">
                  <MarkdownContent content={content} />
                </div>
              )}

              {/* Actions */}
              {isLocal && (
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 px-8 pb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Actions
                  </h3>
                  <div className="flex gap-4">
                    <button
                      onClick={toggleEditMode}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
                    >
                      ✏️ Edit
                    </button>

                    {config && (
                      <>
                        {config.allowArchive && (
                          <button
                            onClick={handleArchive}
                            disabled={archiving || deleting}
                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
                          >
                            {archiving ? 'Archiving...' : '📦 Archive'}
                          </button>
                        )}

                        {config.allowDelete && (
                          <button
                            onClick={handleDelete}
                            disabled={archiving || deleting}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
                          >
                            {deleting ? 'Deleting...' : '🗑️ Delete'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
