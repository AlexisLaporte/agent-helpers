'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Skill } from '@agent-helpers/core/types';
import ItemCard from './ItemCard';

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
            <ItemCard
              key={skill.name}
              name={skill.name}
              description={skill.description}
              href={`/browse/${skill.name}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
