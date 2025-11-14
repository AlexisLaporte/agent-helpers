'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  // In Electron app, skip landing page and go straight to dashboard
  const isElectron = process.env.NEXT_PUBLIC_IS_ELECTRON === 'true';

  useEffect(() => {
    if (isElectron) {
      redirect('/browse');
    }
  }, [isElectron]);

  if (isElectron) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <svg
              viewBox="0 0 40 40"
              className="w-20 h-20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400" />
              <circle cx="20" cy="20" r="4" fill="currentColor" className="text-blue-600 dark:text-blue-400" />
              <circle cx="12" cy="12" r="2.5" fill="currentColor" className="text-blue-500 dark:text-blue-300" />
              <circle cx="28" cy="12" r="2.5" fill="currentColor" className="text-blue-500 dark:text-blue-300" />
              <circle cx="28" cy="28" r="2.5" fill="currentColor" className="text-blue-500 dark:text-blue-300" />
              <circle cx="12" cy="28" r="2.5" fill="currentColor" className="text-blue-500 dark:text-blue-300" />
            </svg>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Agent Helpers
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Manage and extend Claude Code with curated skills and a powerful desktop app
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/library"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Browse Skills Library
            </Link>
            <a
              href="https://github.com/yourusername/agent-helpers/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
            >
              Download Desktop App
            </a>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">12 Curated Skills</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Ready-to-use skills for Notion, Slack, Figma, PDF, Playwright, and more
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-4">🖥️</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Desktop App</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your Claude Code customizations with an intuitive interface
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Easy Installation</h3>
            <p className="text-gray-600 dark:text-gray-400">
              One-click install skills directly to your ~/.claude directory
            </p>
          </div>
        </div>
      </div>

      {/* Skills Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Featured Skills
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Playwright', icon: '🎭', desc: 'Browser automation & E2E testing' },
            { name: 'Notion', icon: '📝', desc: 'Workspace integration' },
            { name: 'PDF', icon: '📄', desc: 'Extract, merge, split PDFs' },
            { name: 'Slack', icon: '💬', desc: 'Messaging & bot automation' },
            { name: 'Figma', icon: '🎨', desc: 'Design tokens & assets' },
            { name: 'YouTube', icon: '📺', desc: 'Video transcripts' },
            { name: 'Git Worktrees', icon: '🌳', desc: 'Multiple branches' },
            { name: 'File Organizer', icon: '📁', desc: 'Smart file sorting' },
          ].map((skill) => (
            <div key={skill.name} className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="text-3xl mb-2">{skill.icon}</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{skill.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{skill.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/library"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            View all 12 skills →
          </Link>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Ready to supercharge Claude Code?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Download the desktop app or browse the skills library
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="https://github.com/yourusername/agent-helpers/releases"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Download for Linux/macOS
          </a>
          <Link
            href="/library"
            className="px-6 py-3 border border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium"
          >
            Browse Library
          </Link>
        </div>
      </div>
    </div>
  );
}
