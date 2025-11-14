'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Skill } from '@agent-helpers/core/types';

interface LocalSkillsSectionProps {
  projectPath?: string;
}

export default function LocalSkillsSection({ projectPath }: LocalSkillsSectionProps) {
  const [localSkills, setLocalSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocalSkills();
  }, [projectPath]);

  const fetchLocalSkills = async () => {
    try {
      const url = projectPath
        ? `/api/skills/local?project=${encodeURIComponent(projectPath)}`
        : '/api/skills/local';
      const response = await fetch(url);
      const data = await response.json();
      setLocalSkills(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load local skills:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!loading && localSkills.length > 0 && (
        <div className="flex justify-end mb-4">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {localSkills.length} installed
          </span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p style={{ color: 'var(--text-secondary)' }}>
            Loading local skills...
          </p>
        </div>
      ) : localSkills.length === 0 ? (
        <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--warning-bg)', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--warning-text)' }}>
            No skills found in your local directory. Check your{' '}
            <Link href="/settings" className="underline">
              settings
            </Link>{' '}
            to configure the correct path.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localSkills.map((skill) => (
            <div
              key={skill.name}
              className="relative p-6 surface-elevated rounded-xl transition-all duration-200 hover:scale-105"
              style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
            >
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 text-xs font-semibold rounded" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}>
                  Installed
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2 pr-20" style={{ color: 'var(--foreground)' }}>
                {skill.name}
              </h3>
              <p className="line-clamp-3 mb-4" style={{ color: 'var(--text-secondary)' }}>
                {skill.description}
              </p>
              <Link
                href={`/browse/${skill.name}`}
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: 'var(--accent)' }}
              >
                View details
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
