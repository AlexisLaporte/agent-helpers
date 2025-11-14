import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import { getLocalHooksPath } from '@agent-helpers/core/config';

interface LocalConfigSectionProps {
  projectPath?: string;
}

async function getLocalConfig(basePath?: string) {
  const hooksPath = getLocalHooksPath(basePath);
  const baseDir = basePath || path.join(require('os').homedir(), '.claude');

  const config = {
    hasSettings: false,
    hasSettingsLocal: false,
    hasStatusline: false,
    hasClaudeMd: false,
    hooks: [] as string[],
  };

  try {
    // Check for settings.json
    await fs.access(path.join(baseDir, 'settings.json'));
    config.hasSettings = true;
  } catch {
    // No settings file
  }

  try {
    // Check for settings.local.json
    await fs.access(path.join(baseDir, 'settings.local.json'));
    config.hasSettingsLocal = true;
  } catch {
    // No settings.local file
  }

  try {
    // Check for statusline.sh
    await fs.access(path.join(baseDir, 'statusline.sh'));
    config.hasStatusline = true;
  } catch {
    // No statusline file
  }

  try {
    // Check for CLAUDE.md
    await fs.access(path.join(baseDir, 'CLAUDE.md'));
    config.hasClaudeMd = true;
  } catch {
    // No CLAUDE.md file
  }

  try {
    // List hooks
    const entries = await fs.readdir(hooksPath, { withFileTypes: true });
    config.hooks = entries
      .filter(e => e.isFile() && !e.name.startsWith('.'))
      .map(e => e.name);
  } catch {
    // No hooks directory
  }

  return config;
}

export default async function LocalConfigSection({ projectPath }: LocalConfigSectionProps) {
  const config = await getLocalConfig(projectPath);
  const hasAnyConfig = config.hasSettings || config.hasSettingsLocal || config.hasStatusline || config.hasClaudeMd || config.hooks.length > 0;

  if (!hasAnyConfig) {
    return null;
  }

  const projectParam = projectPath ? `?basePath=${encodeURIComponent(projectPath)}` : '';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Settings.json */}
          {config.hasSettings && (
            <div className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-blue-500 dark:border-blue-600">
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                  Installed
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 pr-20">
                settings.json
              </h3>
              <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                Project settings and preferences
              </p>
              <Link
                href={`/file/settings.json${projectParam}`}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Edit →
              </Link>
            </div>
          )}

          {/* Settings.local.json */}
          {config.hasSettingsLocal && (
            <div className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-cyan-500 dark:border-cyan-600">
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                  Installed
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 pr-20">
                settings.local.json
              </h3>
              <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                Local settings (machine-specific)
              </p>
              <Link
                href={`/file/settings.local.json${projectParam}`}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Edit →
              </Link>
            </div>
          )}

          {/* CLAUDE.md */}
          {config.hasClaudeMd && (
            <div className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-indigo-500 dark:border-indigo-600">
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                  Installed
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 pr-20">
                CLAUDE.md
              </h3>
              <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                Global instructions for Claude Code
              </p>
              <Link
                href={projectPath ? `/claude-md?project=${encodeURIComponent(projectPath)}` : '/claude-md'}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Edit →
              </Link>
            </div>
          )}

          {/* Statusline.sh */}
          {config.hasStatusline && (
            <div className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-green-500 dark:border-green-600">
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                  Installed
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 pr-20">
                statusline.sh
              </h3>
              <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                Custom status line script
              </p>
              <Link
                href={`/file/statusline.sh${projectParam}`}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Edit →
              </Link>
            </div>
          )}

          {/* Hooks */}
          {config.hooks.map(hook => (
            <div key={hook} className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-purple-500 dark:border-purple-600">
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                  Installed
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 pr-20">
                {hook}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                Hook script
              </p>
              <Link
                href={`/file/hooks/${hook}${projectParam}`}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Edit →
              </Link>
            </div>
          ))}
    </div>
  );
}
