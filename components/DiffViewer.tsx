'use client';

interface DiffViewerProps {
  localContent: string;
  libraryContent: string;
}

export default function DiffViewer({ localContent, libraryContent }: DiffViewerProps) {
  // Split content into lines
  const localLines = localContent.split('\n');
  const libraryLines = libraryContent.split('\n');

  // Simple diff: compare line by line
  const maxLines = Math.max(localLines.length, libraryLines.length);
  const diffLines: Array<{ type: 'unchanged' | 'modified' | 'added' | 'removed'; local?: string; library?: string; lineNum: number }> = [];

  for (let i = 0; i < maxLines; i++) {
    const local = localLines[i];
    const library = libraryLines[i];

    if (local === library) {
      diffLines.push({ type: 'unchanged', local, library, lineNum: i + 1 });
    } else if (local !== undefined && library !== undefined) {
      diffLines.push({ type: 'modified', local, library, lineNum: i + 1 });
    } else if (local !== undefined) {
      diffLines.push({ type: 'added', local, lineNum: i + 1 });
    } else {
      diffLines.push({ type: 'removed', library, lineNum: i + 1 });
    }
  }

  return (
    <div className="max-h-[500px] overflow-y-auto">
      {/* Side-by-side view */}
      <div className="grid grid-cols-2 gap-0 border border-gray-300 dark:border-gray-600 rounded">
        {/* Header */}
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-r border-gray-300 dark:border-gray-600 px-3 py-2">
          <span className="text-sm font-semibold text-red-800 dark:text-red-300">
            Library Version (will be replaced)
          </span>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border-b border-gray-300 dark:border-gray-600 px-3 py-2">
          <span className="text-sm font-semibold text-green-800 dark:text-green-300">
            Local Version (will be pushed)
          </span>
        </div>

        {/* Diff content */}
        {diffLines.map((line, idx) => (
          <div key={idx} className="contents">
            {/* Library side */}
            <div
              className={`px-3 py-0.5 font-mono text-xs border-r border-gray-200 dark:border-gray-700 ${
                line.type === 'removed'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-200'
                  : line.type === 'modified'
                  ? 'bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-200'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span className="text-gray-400 dark:text-gray-500 mr-3 select-none">
                {line.library !== undefined ? line.lineNum : ''}
              </span>
              {line.library || '\u00A0'}
            </div>

            {/* Local side */}
            <div
              className={`px-3 py-0.5 font-mono text-xs ${
                line.type === 'added'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-200'
                  : line.type === 'modified'
                  ? 'bg-green-50 dark:bg-green-900/10 text-green-900 dark:text-green-200'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span className="text-gray-400 dark:text-gray-500 mr-3 select-none">
                {line.local !== undefined ? line.lineNum : ''}
              </span>
              {line.local || '\u00A0'}
            </div>
          </div>
        ))}
      </div>

      {/* Statistics */}
      <div className="mt-4 flex gap-4 text-sm">
        <span className="text-green-700 dark:text-green-300">
          + {diffLines.filter(l => l.type === 'added').length} lines added
        </span>
        <span className="text-red-700 dark:text-red-300">
          - {diffLines.filter(l => l.type === 'removed').length} lines removed
        </span>
        <span className="text-orange-700 dark:text-orange-300">
          ~ {diffLines.filter(l => l.type === 'modified').length} lines modified
        </span>
      </div>
    </div>
  );
}
