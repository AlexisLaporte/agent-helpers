'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  description?: string;
}

const iconPaths = {
  browse: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
  templates: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  projects: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  duplicates: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  claude: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  sources: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
};

const navigation: NavItem[] = [
  {
    name: 'Browse',
    href: '/browse',
    icon: 'browse',
    description: 'Your local customizations',
  },
  {
    name: 'Templates',
    href: '/templates',
    icon: 'templates',
    description: 'Install from library',
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: 'projects',
    description: 'Switch between projects',
  },
  {
    name: 'Duplicates',
    href: '/duplicates',
    icon: 'duplicates',
    description: 'Find duplicate files',
  },
  {
    name: 'CLAUDE.md',
    href: '/claude-md',
    icon: 'claude',
    description: 'Global instructions',
  },
];

const settingsItems: NavItem[] = [
  {
    name: 'Sources',
    href: '/settings/sources',
    icon: 'sources',
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
    <div className="w-72 surface flex flex-col h-screen sticky top-0" style={{ borderRight: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="p-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <Link href="/" className="flex flex-col items-center gap-3 group">
          <svg
            viewBox="0 0 100 100"
            width="48"
            height="48"
            className="flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="sidebarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e40af" stopOpacity="1" />
                <stop offset="50%" stopColor="#6366f1" stopOpacity="1" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="1" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="42" fill="url(#sidebarGrad)" opacity="0.9" />
            <circle cx="50" cy="50" r="30" fill="url(#sidebarGrad)" opacity="0.6" />
            <circle cx="50" cy="50" r="8" fill="white" opacity="0.9" />
          </svg>
          <div className="text-center">
            <h1 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>
              Agent Helpers
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Claude Code
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all group"
              style={{
                backgroundColor: active ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--foreground)',
              }}
            >
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPaths[item.icon as keyof typeof iconPaths]} />
              </svg>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{item.name}</div>
                {item.description && (
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {item.description}
                  </div>
                )}
              </div>
            </Link>
          );
        })}

        {/* Settings Section */}
        <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="text-xs font-semibold uppercase tracking-wider px-3 mb-2" style={{ color: 'var(--text-muted)' }}>
            Settings
          </div>
          {settingsItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all group"
                style={{
                  backgroundColor: active ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--foreground)',
                }}
              >
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPaths[item.icon as keyof typeof iconPaths]} />
                </svg>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.name}</div>
                  {item.description && (
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {item.description}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          v0.1.2
        </div>
      </div>
    </div>
  );
}
