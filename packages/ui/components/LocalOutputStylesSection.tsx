'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { OutputStyle } from '@agent-helpers/core/types';
import ItemCard from './ItemCard';

interface LocalOutputStylesSectionProps {
  projectPath?: string;
}

export default function LocalOutputStylesSection({ projectPath }: LocalOutputStylesSectionProps) {
  const [localStyles, setLocalStyles] = useState<OutputStyle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocalStyles();
  }, [projectPath]);

  const fetchLocalStyles = async () => {
    try {
      const url = projectPath
        ? `/api/output-styles/local?project=${encodeURIComponent(projectPath)}`
        : '/api/output-styles/local';
      const response = await fetch(url);
      const data = await response.json();
      setLocalStyles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load local output styles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!loading && localStyles.length > 0 && (
        <div className="flex justify-end mb-4">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {localStyles.length} installed
          </span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p style={{ color: 'var(--text-secondary)' }}>
            Loading local output styles...
          </p>
        </div>
      ) : localStyles.length === 0 ? (
        <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--warning-bg)', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--warning-text)' }}>
            No output styles found in your local directory. Check your{' '}
            <Link href="/settings" className="underline">
              settings
            </Link>{' '}
            to configure the correct path.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localStyles.map((style) => (
            <ItemCard
              key={style.name}
              name={style.name}
              description={style.description}
              href={`/browse/${style.name}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
