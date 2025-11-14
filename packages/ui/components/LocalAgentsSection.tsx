'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Agent } from '@agent-helpers/core/types';

interface LocalAgentsSectionProps {
  projectPath?: string;
}

export default function LocalAgentsSection({ projectPath }: LocalAgentsSectionProps) {
  const [localAgents, setLocalAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocalAgents();
  }, [projectPath]);

  const fetchLocalAgents = async () => {
    try {
      const url = projectPath
        ? `/api/agents/local?project=${encodeURIComponent(projectPath)}`
        : '/api/agents/local';
      const response = await fetch(url);
      const data = await response.json();
      setLocalAgents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load local agents:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!loading && localAgents.length > 0 && (
        <div className="flex justify-end mb-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {localAgents.length} installed
          </span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            Loading local agents...
          </p>
        </div>
      ) : localAgents.length === 0 ? (
        <div className="rounded-lg p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <p className="text-yellow-800 dark:text-yellow-300">
            No agents found in your local directory. Check your{' '}
            <Link href="/settings" className="underline">
              settings
            </Link>{' '}
            to configure the correct path.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localAgents.map((agent) => (
            <div
              key={agent.name}
              className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-green-500 dark:border-green-600"
            >
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                  Installed
                </span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 pr-20">
                {agent.name}
              </h4>
              <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                {agent.description}
              </p>
              <Link
                href={`/browse/${agent.name}`}
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
