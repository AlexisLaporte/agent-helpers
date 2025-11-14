'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: string;
}

export default function Home() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPath, setCurrentPath] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadHomeFiles();
  }, []);

  async function loadHomeFiles() {
    try {
      setLoading(true);
      const response = await fetch('/api/files/home');
      if (!response.ok) throw new Error('Failed to load files');
      const data = await response.json();
      setFiles(data.files || []);
      setCurrentPath(data.path || '~/.claude');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading files...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          Claude Code Home
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {currentPath}
        </p>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-12">
          <p style={{ color: 'var(--text-secondary)' }}>No files found in ~/.claude</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {files.map((file) => (
            <Link
              key={file.path}
              href={file.type === 'directory' ? `/file/${file.path}` : `/file/${file.path}`}
              className="block p-4 rounded-lg surface-elevated border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {file.type === 'directory' ? (
                    <svg className="w-6 h-6" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ color: 'var(--foreground)' }}>
                    {file.name}
                  </p>
                  {file.modified && (
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Modified {new Date(file.modified).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {file.type === 'directory' && (
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
