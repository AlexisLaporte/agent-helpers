'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Agent } from '@agent-helpers/core/types';
import ItemCard from './ItemCard';

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
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {localAgents.length} installed
          </span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p style={{ color: 'var(--text-secondary)' }}>
            Loading local agents...
          </p>
        </div>
      ) : localAgents.length === 0 ? (
        <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--warning-bg)', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--warning-text)' }}>
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
            <ItemCard
              key={agent.name}
              name={agent.name}
              description={agent.description}
              href={`/browse/${agent.name}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
