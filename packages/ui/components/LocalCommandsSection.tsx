'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Command } from '@agent-helpers/core/types';
import ItemCard from './ItemCard';

interface LocalCommandsSectionProps {
  projectPath?: string;
}

export default function LocalCommandsSection({ projectPath }: LocalCommandsSectionProps) {
  const [localCommands, setLocalCommands] = useState<Command[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocalCommands();
  }, [projectPath]);

  const fetchLocalCommands = async () => {
    try {
      const url = projectPath
        ? `/api/commands/local?project=${encodeURIComponent(projectPath)}`
        : '/api/commands/local';
      const response = await fetch(url);
      const data = await response.json();
      setLocalCommands(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load local commands:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!loading && localCommands.length > 0 && (
        <div className="flex justify-end mb-4">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {localCommands.length} installed
          </span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p style={{ color: 'var(--text-secondary)' }}>
            Loading local commands...
          </p>
        </div>
      ) : localCommands.length === 0 ? (
        <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--warning-bg)', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--warning-text)' }}>
            No commands found in your local directory. Check your{' '}
            <Link href="/settings" className="underline">
              settings
            </Link>{' '}
            to configure the correct path.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localCommands.map((command) => (
            <ItemCard
              key={command.name}
              name={`/${command.name}`}
              description={command.description}
              href={`/browse/${command.name}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
