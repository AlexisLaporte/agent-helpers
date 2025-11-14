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
    <div className="min-h-screen" style={{ background: 'var(--gradient-surface)' }}>
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <div className="text-center">
          <div className="flex justify-center mb-10">
            <div className="relative w-28 h-28">
              {/* Gradient circle icon */}
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#1e40af', stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                  </linearGradient>
                  <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 0.4 }} />
                    <stop offset="100%" style={{ stopColor: '#6366f1', stopOpacity: 0 }} />
                  </radialGradient>
                </defs>
                {/* Glow effect */}
                <circle cx="50" cy="50" r="48" fill="url(#glowGradient)" />
                {/* Main gradient circle */}
                <circle cx="50" cy="50" r="42" fill="url(#brandGradient)" opacity="0.9" />
                {/* Inner circle for depth */}
                <circle cx="50" cy="50" r="30" fill="url(#brandGradient)" opacity="0.6" />
                {/* Center dot */}
                <circle cx="50" cy="50" r="8" fill="white" opacity="0.9" />
              </svg>
            </div>
          </div>

          <h1 className="text-6xl font-bold mb-6 tracking-tight" style={{ color: 'var(--foreground)' }}>
            Agent Helpers
          </h1>

          <p className="text-xl mb-12 max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Professional toolkit for Claude Code. Curated skills library and desktop management interface.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/library"
              className="px-8 py-4 rounded-xl font-medium transition-all duration-200 hover:scale-105"
              style={{
                background: 'var(--gradient-brand)',
                color: 'white',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              Browse Skills Library
            </Link>
            <a
              href="https://github.com/yourusername/agent-helpers/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl font-medium transition-all duration-200 hover:scale-105 surface-elevated"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              Download Desktop App
            </a>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl surface-elevated transition-all duration-200 hover:scale-105" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
            <div className="w-12 h-12 rounded-full mb-6 flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>12 Curated Skills</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Production-ready skills for Notion, Slack, Figma, PDF, Playwright, and more
            </p>
          </div>

          <div className="p-8 rounded-2xl surface-elevated transition-all duration-200 hover:scale-105" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
            <div className="w-12 h-12 rounded-full mb-6 flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Desktop App</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Professional interface for managing Claude Code customizations
            </p>
          </div>

          <div className="p-8 rounded-2xl surface-elevated transition-all duration-200 hover:scale-105" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
            <div className="w-12 h-12 rounded-full mb-6 flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Direct Installation</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Deploy skills directly to ~/.claude directory with single click
            </p>
          </div>
        </div>
      </div>

      {/* Skills Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-center mb-4" style={{ color: 'var(--foreground)' }}>
          Featured Skills
        </h2>
        <p className="text-center mb-16 text-lg" style={{ color: 'var(--text-secondary)' }}>
          Professional integrations for enterprise workflows
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Playwright', desc: 'Browser automation & E2E testing' },
            { name: 'Notion', desc: 'Workspace integration' },
            { name: 'PDF', desc: 'Extract, merge, split PDFs' },
            { name: 'Slack', desc: 'Messaging & bot automation' },
            { name: 'Figma', desc: 'Design tokens & assets' },
            { name: 'YouTube', desc: 'Video transcripts' },
            { name: 'Git Worktrees', desc: 'Multiple branches' },
            { name: 'File Organizer', desc: 'Smart file sorting' },
          ].map((skill) => (
            <div
              key={skill.name}
              className="p-6 rounded-xl surface-elevated transition-all duration-200 hover:scale-105 group"
              style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="w-10 h-10 rounded-lg mb-4 flex items-center justify-center" style={{ background: 'var(--gradient-brand)', opacity: 0.8 }}>
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <h4 className="font-semibold mb-2 group-hover:text-[var(--accent)]" style={{ color: 'var(--foreground)' }}>{skill.name}</h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{skill.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/library"
            className="inline-flex items-center gap-2 font-medium hover:gap-3 transition-all"
            style={{ color: 'var(--accent)' }}
          >
            View all 12 skills
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="p-12 rounded-3xl surface-elevated" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}>
          <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Start Building with Agent Helpers
          </h2>
          <p className="mb-10 text-lg" style={{ color: 'var(--text-secondary)' }}>
            Download the desktop app or explore the skills library
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="https://github.com/yourusername/agent-helpers/releases"
              className="px-8 py-4 rounded-xl font-medium transition-all duration-200 hover:scale-105"
              style={{
                background: 'var(--gradient-brand)',
                color: 'white',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              Download for Linux/macOS
            </a>
            <Link
              href="/library"
              className="px-8 py-4 rounded-xl font-medium transition-all duration-200 hover:scale-105"
              style={{
                border: '2px solid var(--accent)',
                color: 'var(--accent)'
              }}
            >
              Browse Library
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
