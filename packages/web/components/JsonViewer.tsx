'use client';

import { useState } from 'react';

interface JsonViewerProps {
  content: string;
}

export default function JsonViewer({ content }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);

  let parsedJson: any;
  let parseError: string | null = null;

  try {
    parsedJson = JSON.parse(content);
  } catch (err) {
    parseError = err instanceof Error ? err.message : 'Invalid JSON';
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderValue = (value: any, depth: number = 0): JSX.Element => {
    const indent = depth * 24;

    if (value === null) {
      return <span className="text-gray-500 dark:text-gray-400">null</span>;
    }

    if (typeof value === 'boolean') {
      return <span className="text-purple-600 dark:text-purple-400">{value.toString()}</span>;
    }

    if (typeof value === 'number') {
      return <span className="text-blue-600 dark:text-blue-400">{value}</span>;
    }

    if (typeof value === 'string') {
      return <span className="text-green-600 dark:text-green-400">&quot;{value}&quot;</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-600 dark:text-gray-400">[]</span>;
      }

      return (
        <div>
          <span className="text-gray-600 dark:text-gray-400">[</span>
          <div className="ml-6">
            {value.map((item, index) => (
              <div key={index} className="py-1">
                {renderValue(item, depth + 1)}
                {index < value.length - 1 && (
                  <span className="text-gray-600 dark:text-gray-400">,</span>
                )}
              </div>
            ))}
          </div>
          <span className="text-gray-600 dark:text-gray-400">]</span>
        </div>
      );
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);

      if (keys.length === 0) {
        return <span className="text-gray-600 dark:text-gray-400">{'{}'}</span>;
      }

      return (
        <div>
          <span className="text-gray-600 dark:text-gray-400">{'{'}</span>
          <div className="ml-6">
            {keys.map((key, index) => (
              <div key={key} className="py-1">
                <span className="text-blue-700 dark:text-blue-300 font-medium">
                  &quot;{key}&quot;
                </span>
                <span className="text-gray-600 dark:text-gray-400">: </span>
                {renderValue(value[key], depth + 1)}
                {index < keys.length - 1 && (
                  <span className="text-gray-600 dark:text-gray-400">,</span>
                )}
              </div>
            ))}
          </div>
          <span className="text-gray-600 dark:text-gray-400">{'}'}</span>
        </div>
      );
    }

    return <span>{String(value)}</span>;
  };

  if (parseError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Invalid JSON
          </h3>
          <p className="text-red-800 dark:text-red-200 font-mono text-sm">{parseError}</p>
        </div>
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Raw Content:
          </h4>
          <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
            <code className="text-gray-900 dark:text-gray-100">{content}</code>
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-800 text-white rounded-md font-medium transition-colors"
        >
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>

      <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-x-auto">
        <div className="font-mono text-sm leading-relaxed">
          {renderValue(parsedJson)}
        </div>
      </div>
    </div>
  );
}
