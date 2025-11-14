'use client';

import { useState } from 'react';
import ProjectBadge from './ProjectBadge';
import type { CustomizationWithProject, CustomizationType } from '@agent-helpers/core/types';

interface DuplicateCardProps {
  name: string;
  type: CustomizationType;
  instances: CustomizationWithProject[];
  contentGroups?: { hash: string; instances: CustomizationWithProject[] }[];
}

export default function DuplicateCard({
  name,
  type,
  instances,
  contentGroups,
}: DuplicateCardProps) {
  const [expanded, setExpanded] = useState(false);

  const typeColors: Record<CustomizationType, string> = {
    skill: 'border-blue-500',
    command: 'border-green-500',
    agent: 'border-purple-500',
    'output-style': 'border-orange-500',
  };

  const typeBgColors: Record<CustomizationType, string> = {
    skill: 'bg-blue-50 dark:bg-blue-900/20',
    command: 'bg-green-50 dark:bg-green-900/20',
    agent: 'bg-purple-50 dark:bg-purple-900/20',
    'output-style': 'bg-orange-50 dark:bg-orange-900/20',
  };

  const displayType =
    type === 'output-style'
      ? 'Output Style'
      : type.charAt(0).toUpperCase() + type.slice(1);

  const displayName = type === 'command' ? `/${name}` : name;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow border-l-4 ${typeColors[type]} overflow-hidden`}
    >
      <div
        className={`p-4 cursor-pointer ${typeBgColors[type]}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {displayName}
              </h3>
              <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {displayType}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {instances.length} instance{instances.length > 1 ? 's' : ''} found
            </p>
          </div>
          <button
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <svg
              className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {contentGroups && contentGroups.length > 1 ? (
            // Multiple content versions
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                ⚠️ Multiple versions detected (different content):
              </p>
              {contentGroups.map((group, idx) => (
                <div
                  key={group.hash}
                  className="bg-gray-50 dark:bg-gray-900 rounded p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                      Version {idx + 1} ({group.instances.length} instance
                      {group.instances.length > 1 ? 's' : ''})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.instances.map((instance, i) => (
                      <ProjectBadge
                        key={`${instance.projectPath}-${i}`}
                        projectName={instance.projectName}
                        projectPath={instance.projectPath}
                        href={`/browse/${instance.name}?project=${instance.claudePath}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Same content everywhere
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                ✓ Same content in all instances
              </p>
              <div className="flex flex-wrap gap-2">
                {instances.map((instance, i) => (
                  <ProjectBadge
                    key={`${instance.projectPath}-${i}`}
                    projectName={instance.projectName}
                    projectPath={instance.projectPath}
                    href={`/browse/${instance.name}?project=${instance.claudePath}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
