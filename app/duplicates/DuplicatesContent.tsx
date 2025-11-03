'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DuplicateCard from '../../components/DuplicateCard';
import type { DuplicatesAnalysis } from '@/lib/types';

export default function DuplicatesContent() {
  const searchParams = useSearchParams();
  const project = searchParams.get('project');

  const [analysis, setAnalysis] = useState<DuplicatesAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'byName' | 'byContent'>('byName');

  useEffect(() => {
    async function fetchDuplicates() {
      try {
        const url = new URL('/api/duplicates', window.location.origin);
        if (project) {
          url.searchParams.set('project', project);
        }

        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error('Failed to fetch duplicates');
        }
        const data = await response.json();
        setAnalysis(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchDuplicates();
  }, [project]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Analyzing duplicates across all projects...
          </p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-red-600 dark:text-red-400">
          <p>Error: {error || 'Failed to load duplicates'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Duplicate Analysis
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Find duplicate customizations across all your Claude Code projects
            </p>
            {project && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Viewing:
                </span>
                <span className="text-sm font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                  {project.replace(/\//g, ' › ')}
                </span>
                <Link
                  href="/duplicates"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  (clear)
                </Link>
              </div>
            )}
          </div>
          <Link
            href="/browse"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Customizations
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {analysis.stats.totalProjects}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Projects</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {analysis.stats.totalFiles}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Files</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {analysis.stats.duplicateNames}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Duplicate Names</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {analysis.stats.duplicateContent}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Duplicate Content
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('byName')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'byName'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              By Name ({analysis.byName.length})
            </button>
            <button
              onClick={() => setActiveTab('byContent')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'byContent'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              By Content ({analysis.byContent.length})
            </button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'byName' ? (
          analysis.byName.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-gray-600 dark:text-gray-400">
                No duplicate names found across projects
              </p>
            </div>
          ) : (
            analysis.byName.map((duplicate) => (
              <DuplicateCard
                key={`${duplicate.type}-${duplicate.name}`}
                name={duplicate.name}
                type={duplicate.type}
                instances={duplicate.instances}
                contentGroups={duplicate.contentGroups}
              />
            ))
          )
        ) : analysis.byContent.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-600 dark:text-gray-400">
              No duplicate content found across projects
            </p>
          </div>
        ) : (
          analysis.byContent.map((duplicate, idx) => (
            <DuplicateCard
              key={`${duplicate.type}-${duplicate.hash}-${idx}`}
              name={
                duplicate.uniqueNames.length === 1
                  ? duplicate.uniqueNames[0]
                  : `${duplicate.uniqueNames.length} different names`
              }
              type={duplicate.type}
              instances={duplicate.instances}
            />
          ))
        )}
      </div>
    </div>
  );
}
