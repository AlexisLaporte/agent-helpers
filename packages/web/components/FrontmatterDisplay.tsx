'use client';

interface FrontmatterDisplayProps {
  content: string;
}

function parseFrontmatter(content: string): Record<string, any> | null {
  if (!content.trimStart().startsWith('---')) {
    return null;
  }

  const lines = content.split('\n');
  let frontmatterEnd = -1;

  // Find the closing ---
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      frontmatterEnd = i;
      break;
    }
  }

  if (frontmatterEnd > 0) {
    const yamlLines = lines.slice(1, frontmatterEnd);
    const metadata: Record<string, any> = {};

    yamlLines.forEach((line) => {
      const match = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
      if (match) {
        const [, key, value] = match;
        metadata[key] = value;
      }
    });

    return metadata;
  }

  return null;
}

// Format field name to be human-readable
function formatFieldName(key: string): string {
  return key
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function FrontmatterDisplay({ content }: FrontmatterDisplayProps) {
  const metadata = parseFrontmatter(content);

  if (!metadata) {
    return null;
  }

  // Filter out name and description as they're shown in the header
  const additionalFields = Object.entries(metadata).filter(
    ([key]) => key !== 'name' && key !== 'description' && key !== 'source'
  );

  if (additionalFields.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
      {additionalFields.map(([key, value]) => (
        <div key={key} className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            {formatFieldName(key)}:
          </span>
          <span className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}
