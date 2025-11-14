import { promises as fs } from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface SkillDetailProps {
  params: Promise<{ name: string }>;
}

async function loadSkill(name: string) {
  const libraryPath = path.join(process.cwd(), '..', '..', 'packages', 'library', 'skills');
  const skillPath = path.join(libraryPath, name, 'SKILL.md');

  try {
    const content = await fs.readFile(skillPath, 'utf-8');

    // Parse frontmatter
    let metadata = { name, description: '', source: '' };
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (match) {
      const frontmatter = match[1];
      const nameMatch = frontmatter.match(/name:\s*(.+)/);
      const descMatch = frontmatter.match(/description:\s*(.+)/);
      const sourceMatch = frontmatter.match(/source:\s*(.+)/);

      metadata = {
        name: nameMatch?.[1]?.trim() || name,
        description: descMatch?.[1]?.trim() || '',
        source: sourceMatch?.[1]?.trim() || '',
      };
    }

    return { ...metadata, content };
  } catch (error) {
    console.error('Error loading skill:', error);
    return null;
  }
}

export default async function SkillDetailPage({ params }: SkillDetailProps) {
  const { name } = await params;
  const skill = await loadSkill(name);

  if (!skill) {
    notFound();
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-surface)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/library"
            className="inline-flex items-center gap-2 mb-8 font-medium transition-all hover:gap-3"
            style={{ color: 'var(--accent)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Library
          </Link>

          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
                {skill.name}
              </h1>
              {skill.description && (
                <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                  {skill.description}
                </p>
              )}
            </div>

            {skill.source && (
              <span className="px-3 py-1 text-sm font-semibold rounded-full whitespace-nowrap" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                {skill.source}
              </span>
            )}
          </div>

          {/* Install CTA */}
          <div className="p-8 rounded-2xl surface-elevated" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gradient-brand)' }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <p style={{ color: 'var(--text-secondary)' }}>
                Install <strong style={{ color: 'var(--foreground)' }}>{skill.name}</strong> using the desktop application
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

        {/* Content */}
        <div className="surface-elevated rounded-2xl p-8" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{skill.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
