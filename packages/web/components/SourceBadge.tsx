import type { CustomizationSource } from '@/lib/types';

interface SourceBadgeProps {
  source?: CustomizationSource;
}

export default function SourceBadge({ source }: SourceBadgeProps) {
  if (!source) return null;

  const badgeConfig: Record<CustomizationSource, { label: string; className: string }> = {
    base: {
      label: 'Base',
      className: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
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
