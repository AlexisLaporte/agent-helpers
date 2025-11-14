import type { CustomizationSource } from '@agent-helpers/core/types';

interface SourceBadgeProps {
  source?: CustomizationSource;
}

export default function SourceBadge({ source }: SourceBadgeProps) {
  if (!source) return null;

  const badgeConfig: Record<CustomizationSource, { label: string; className: string }> = {
    base: {
      label: 'Base',
      className: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200',
    },
    org: {
      label: '321',
      className: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
    },
    local: {
      label: 'Local',
      className: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    },
  };

  const config = badgeConfig[source];

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded ${config.className}`}>
      {config.label}
    </span>
  );
}
