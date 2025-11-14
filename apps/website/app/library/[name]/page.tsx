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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/library"
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
          >
            ← Back to Library
          </Link>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {skill.name}
              </h1>
              {skill.description && (
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {skill.description}
                </p>
              )}
            </div>

            {skill.source && (
              <span className="px-3 py-1 text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded whitespace-nowrap">
                {skill.source}
              </span>
            )}
          </div>

          {/* Install CTA */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <p className="text-blue-800 dark:text-blue-200 mb-4">
              💡 To install <strong>{skill.name}</strong>, download the desktop app
            </p>
            <a
              href="https://github.com/yourusername/agent-helpers/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Download Desktop App
            </a>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{skill.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
