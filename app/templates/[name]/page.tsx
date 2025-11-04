import { promises as fs } from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import InstallButton from '../../../components/InstallButton';

interface TemplateDetailProps {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ type?: string }>;
}

async function getLibraryPath() {
  const prodPath = path.join(process.cwd(), 'library');
  const devPath = path.join(process.cwd(), 'library');

  try {
    await fs.access(prodPath);
    return prodPath;
  } catch {
    return devPath;
  }
}

async function loadTemplate(name: string, type: string) {
  const libraryPath = await getLibraryPath();
  let filePath: string;

  if (type === 'skills') {
    filePath = path.join(libraryPath, 'skills', name, 'SKILL.md');
  } else {
    filePath = path.join(libraryPath, type, `${name}.md`);
  }

  try {
    const content = await fs.readFile(filePath, 'utf-8');

    // Parse frontmatter for skills
    let metadata = { name, description: '' };
    if (type === 'skills') {
      const match = content.match(/^---\n([\s\S]*?)\n---/);
      if (match) {
        const frontmatter = match[1];
        const nameMatch = frontmatter.match(/name:\s*(.+)/);
        const descMatch = frontmatter.match(/description:\s*(.+)/);

        metadata = {
          name: nameMatch?.[1]?.trim() || name,
          description: descMatch?.[1]?.trim() || '',
        };
      }
    } else {
      // Extract first line as description
      const firstLine = content.split('\n')[0];
      metadata.description = firstLine.replace(/^#\s*/, '');
    }

    return { ...metadata, content, type };
  } catch (error) {
    console.error('Error loading template:', error);
    return null;
  }
}

export default async function TemplateDetailPage({ params, searchParams }: TemplateDetailProps) {
  const { name } = await params;
  const { type = 'skills' } = await searchParams;

  const template = await loadTemplate(name, type);

  if (!template) {
    notFound();
  }

  const typeLabels: Record<string, string> = {
    skills: 'Skill',
    commands: 'Command',
    agents: 'Agent',
    'output-styles': 'Output Style',
  };

  const typeColors: Record<string, string> = {
    skills: 'purple',
    commands: 'blue',
    agents: 'green',
    'output-styles': 'yellow',
  };

  const color = typeColors[type] || 'gray';
  const label = typeLabels[type] || type;

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link
                href="/templates"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                ← Templates
              </Link>
              <span className={`px-3 py-1 text-sm font-semibold bg-${color}-100 dark:bg-${color}-900 text-${color}-800 dark:text-${color}-200 rounded`}>
                {label}
              </span>
            </div>
            <InstallButton
              type={type}
              name={name}
              content={template.content}
            />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {template.name}
          </h1>
          {template.description && (
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {template.description}
            </p>
          )}
        </div>

        {/* Content Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Template Content
            </span>
          </div>
          <div className="p-6">
            <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-mono overflow-x-auto">
              {template.content}
            </pre>
          </div>
        </div>

        {/* Help */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Click <strong>"Install to ~/.claude/"</strong> to copy this template to your local customizations directory.
            You can then edit it from the Browse page.
          </p>
        </div>
      </div>
    </div>
  );
}
