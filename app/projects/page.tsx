'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ClaudeProject } from '@/lib/types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ClaudeProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getTotalCustomizations = (counts: ClaudeProject['customizationCounts']) => {
    return counts.skills + counts.commands + counts.agents + counts.outputStyles + counts.hooks;
  };

  useEffect(() => {
    document.title = 'Projects - Agent Helpers';

    async function loadProjects() {
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error('Failed to load projects');
        }
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-600 dark:text-gray-300">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Discovered Projects
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            .claude directories found on this machine
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              No .claude projects found on this machine
            </p>
          </div>
        ) : projects.filter(p => getTotalCustomizations(p.customizationCounts) > 0).length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Found {projects.length} project{projects.length > 1 ? 's' : ''} but they don&apos;t contain any customizations
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Projects need at least one skill, command, agent, output style, or hook to be displayed
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {projects
              .filter(project => getTotalCustomizations(project.customizationCounts) > 0)
              .map((project) => (
              <div
                key={project.claudePath}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {project.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {project.path}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                    <p>Last modified:</p>
                    <p className="font-medium">
                      {new Date(project.lastModified).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {project.customizationCounts.skills}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Skills</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {project.customizationCounts.commands}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Commands</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {project.customizationCounts.agents}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Agents</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {project.customizationCounts.outputStyles}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Styles</p>
                  </div>
                  <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                      {project.customizationCounts.hooks}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Hooks</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 rounded-full text-sm font-semibold">
                      {getTotalCustomizations(project.customizationCounts)} total
                    </span>
                    {project.hasSettings && (
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                      settings.json
                    </span>
                  )}
                  {project.hasStatusline && (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                      statusline.sh
                    </span>
                  )}
                  </div>
                  <Link
                    href={`/browse?project=${project.claudePath}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
