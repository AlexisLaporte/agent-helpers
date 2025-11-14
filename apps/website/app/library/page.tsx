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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
          >
            ← Back to Home
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Skills Library
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            {skills.length} curated skills for Claude Code
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-blue-800 dark:text-blue-200 mb-4">
              💡 To install these skills, download the desktop app
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

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill) => (
            <Link
              key={skill.name}
              href={`/library/${encodeURIComponent(skill.name)}`}
              className="block group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 h-full border-2 border-transparent hover:border-blue-500">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {skill.name}
                  </h3>
                  {skill.source && (
                    <span className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                      {skill.source}
                    </span>
                  )}
                </div>

                <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                  {skill.description}
                </p>

                <div className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium">
                  View details →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {skills.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-600 dark:text-gray-400">
              No skills found in library
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
