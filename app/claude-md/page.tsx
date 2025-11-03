'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ClaudeMdEditor() {
  const searchParams = useSearchParams();
  const projectPath = searchParams.get('project');

  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [filePath, setFilePath] = useState('');
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadClaudeMd();
  }, [projectPath]);

  const loadClaudeMd = async () => {
    try {
      const url = projectPath
        ? `/api/claude-md?project=${encodeURIComponent(projectPath)}`
        : '/api/claude-md';
      const response = await fetch(url);
      const data = await response.json();

      setContent(data.content);
      setOriginalContent(data.content);
      setFilePath(data.path);
      setExists(data.exists);
    } catch (error) {
      console.error('Failed to load CLAUDE.md:', error);
      setMessage('Failed to load CLAUDE.md');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/claude-md', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          project: projectPath,
        }),
      });

      if (response.ok) {
        setOriginalContent(content);
        setExists(true);
        setMessage('✓ Saved successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save');
      }
    } catch (error) {
      console.error('Failed to save CLAUDE.md:', error);
      setMessage('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = content !== originalContent;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading CLAUDE.md...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                CLAUDE.md
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {filePath}
              </p>
              {!exists && (
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                  File does not exist yet - will be created on save
                </p>
              )}
            </div>
            <Link
              href={projectPath ? `/browse?project=${projectPath}` : '/browse'}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              ← Back
            </Link>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>CLAUDE.md</strong> contains global instructions for Claude Code.
              These instructions apply to all conversations in this directory.
            </p>
          </div>
        </div>

        {/* Editor */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Content
            </span>
            <div className="flex items-center gap-3">
              {message && (
                <span className={`text-sm ${
                  message.includes('✓')
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {message}
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  hasChanges && !saving
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-[600px] p-4 font-mono text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 resize-none focus:outline-none"
            placeholder="Enter your global Claude Code instructions here..."
          />
        </div>

        {/* Help */}
        <div className="mt-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Examples of what to put in CLAUDE.md:
          </h3>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li>• Preferred coding style (formatting, naming conventions)</li>
            <li>• Default libraries or frameworks to use</li>
            <li>• Project-specific context or constraints</li>
            <li>• Language preferences (e.g., "always respond in French")</li>
            <li>• Common abbreviations or domain terminology</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function ClaudeMdPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    }>
      <ClaudeMdEditor />
    </Suspense>
  );
}
