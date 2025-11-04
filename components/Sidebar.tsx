'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  description?: string;
}

const navigation: NavItem[] = [
  {
    name: 'Browse',
    href: '/browse',
    icon: '📂',
    description: 'Your local customizations',
  },
  {
    name: 'Templates',
    href: '/templates',
    icon: '📦',
    description: 'Install from library',
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: '🗂️',
    description: 'Switch between projects',
  },
  {
    name: 'Duplicates',
    href: '/duplicates',
    icon: '🔎',
    description: 'Find duplicate files',
  },
  {
    name: 'CLAUDE.md',
    href: '/claude-md',
    icon: '📝',
    description: 'Global instructions',
  },
];

const settingsItems: NavItem[] = [
  {
    name: 'Sources',
    href: '/settings/sources',
    icon: '🌐',
    description: 'Manage template libraries',
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/browse') {
      return pathname === '/' || pathname === '/browse' || pathname.startsWith('/browse/');
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen sticky top-0">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <Link href="/">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Agent Helpers
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Claude Code Manager
          </p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors group
              ${
                isActive(item.href)
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
          >
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{item.name}</div>
              {item.description && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {item.description}
                </div>
              )}
            </div>
          </Link>
        ))}

        {/* Settings Section */}
        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">
            Settings
          </div>
          {settingsItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors group
                ${
                  isActive(item.href)
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{item.name}</div>
                {item.description && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {item.description}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          v0.1.2
        </div>
      </div>
    </div>
  );
}
