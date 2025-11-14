import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';

export const metadata = {
  title: 'Skills Library - Agent Helpers',
  description: 'Browse 12 curated skills for Claude Code',
};

interface Skill {
  name: string;
  description: string;
  source?: string;
}

async function loadSkills(): Promise<Skill[]> {
  const libraryPath = path.join(process.cwd(), '..', '..', 'packages', 'library', 'skills');
  const skills: Skill[] = [];

  try {
    const skillDirs = await fs.readdir(libraryPath, { withFileTypes: true });

    for (const dir of skillDirs) {
      if (dir.isDirectory()) {
        try {
          const skillPath = path.join(libraryPath, dir.name, 'SKILL.md');
          const content = await fs.readFile(skillPath, 'utf-8');

          // Parse frontmatter
          const match = content.match(/^---\n([\s\S]*?)\n---/);
          if (match) {
            const frontmatter = match[1];
            const nameMatch = frontmatter.match(/name:\s*(.+)/);
            const descMatch = frontmatter.match(/description:\s*(.+)/);
            const sourceMatch = frontmatter.match(/source:\s*(.+)/);

            skills.push({
              name: nameMatch?.[1]?.trim() || dir.name,
              description: descMatch?.[1]?.trim() || 'No description',
              source: sourceMatch?.[1]?.trim(),
            });
          }
        } catch (e) {
          // Skip if SKILL.md doesn't exist
        }
      }
    }
  } catch (e) {
    console.error('Error loading skills:', e);
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

export default async function LibraryPage() {
  const skills = await loadSkills();

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-surface)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-6 font-medium transition-all hover:gap-3"
            style={{ color: 'var(--accent)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>

          <h1 className="text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Skills Library
          </h1>
          <p className="text-xl mb-10" style={{ color: 'var(--text-secondary)' }}>
            {skills.length} production-ready skills for Claude Code
          </p>

          <div className="p-8 rounded-2xl surface-elevated max-w-2xl mx-auto" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gradient-brand)' }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-left" style={{ color: 'var(--text-secondary)' }}>
                Install and manage these skills using the desktop application
              </p>
            </div>
            <a
              href="https://github.com/AlexisLaporte/agent-helpers/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 rounded-xl font-medium transition-all duration-200 hover:scale-105"
              style={{
                background: 'var(--gradient-brand)',
                color: 'white',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              Download Desktop App
            </a>
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill) => (
            <Link
              key={skill.name}
              href={`/library/${encodeURIComponent(skill.name)}`}
              className="block group"
            >
              <div className="surface-elevated rounded-xl p-6 h-full transition-all duration-200 hover:scale-105" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold transition-colors" style={{ color: 'var(--foreground)' }}>
                    {skill.name}
                  </h3>
                  {skill.source && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                      {skill.source}
                    </span>
                  )}
                </div>

                <p className="line-clamp-3 mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {skill.description}
                </p>

                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--accent)' }}>
                  View details
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {skills.length === 0 && (
          <div className="text-center py-12 surface-elevated rounded-xl" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              No skills found in library
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
