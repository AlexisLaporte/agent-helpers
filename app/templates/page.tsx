import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import PageLayout from '../../components/PageLayout';
import type { Skill, Command, Agent, OutputStyle } from '@/lib/types';

export const metadata = {
  title: 'Templates - Agent Helpers',
  description: 'Browse and install customization templates',
};

async function getLibraryPath() {
  // In production (Electron), library is in resources/app/library
  // In dev, it's in ./library
  const prodPath = path.join(process.cwd(), 'library');
  const devPath = path.join(process.cwd(), 'library');

  try {
    await fs.access(prodPath);
    return prodPath;
  } catch {
    return devPath;
  }
}

async function loadTemplates() {
  const libraryPath = await getLibraryPath();
  const templates = {
    skills: [] as Skill[],
    commands: [] as Command[],
    agents: [] as Agent[],
    outputStyles: [] as OutputStyle[],
  };

  // Load skills
  try {
    const skillsPath = path.join(libraryPath, 'skills');
    const skillDirs = await fs.readdir(skillsPath, { withFileTypes: true });

    for (const dir of skillDirs) {
      if (dir.isDirectory()) {
        try {
          const skillPath = path.join(skillsPath, dir.name, 'SKILL.md');
          const content = await fs.readFile(skillPath, 'utf-8');

          // Parse frontmatter
          const match = content.match(/^---\n([\s\S]*?)\n---/);
          if (match) {
            const frontmatter = match[1];
            const nameMatch = frontmatter.match(/name:\s*(.+)/);
            const descMatch = frontmatter.match(/description:\s*(.+)/);

            templates.skills.push({
              name: nameMatch?.[1]?.trim() || dir.name,
              description: descMatch?.[1]?.trim() || 'No description',
              content,
            });
          }
        } catch (e) {
          // Skip if SKILL.md doesn't exist
        }
      }
    }
  } catch (e) {
    console.error('Error loading skills templates:', e);
  }

  // Load commands
  try {
    const commandsPath = path.join(libraryPath, 'commands');
    const commandFiles = await fs.readdir(commandsPath, { withFileTypes: true });

    for (const file of commandFiles) {
      if (file.isFile() && file.name.endsWith('.md') && file.name !== 'README.md') {
        try {
          const content = await fs.readFile(path.join(commandsPath, file.name), 'utf-8');
          const name = file.name.replace('.md', '');

          templates.commands.push({
            name,
            description: content.split('\n')[0].replace(/^#\s*/, '') || 'No description',
            content,
          });
        } catch (e) {
          // Skip
        }
      }
    }
  } catch (e) {
    console.error('Error loading commands templates:', e);
  }

  // Load agents
  try {
    const agentsPath = path.join(libraryPath, 'agents');
    const agentFiles = await fs.readdir(agentsPath, { withFileTypes: true });

    for (const file of agentFiles) {
      if (file.isFile() && file.name.endsWith('.md') && file.name !== 'README.md') {
        try {
          const content = await fs.readFile(path.join(agentsPath, file.name), 'utf-8');
          const name = file.name.replace('.md', '');

          templates.agents.push({
            name,
            description: content.split('\n')[0].replace(/^#\s*/, '') || 'No description',
            content,
          });
        } catch (e) {
          // Skip
        }
      }
    }
  } catch (e) {
    console.error('Error loading agents templates:', e);
  }

  // Load output styles
  try {
    const stylesPath = path.join(libraryPath, 'output-styles');
    const styleFiles = await fs.readdir(stylesPath, { withFileTypes: true });

    for (const file of styleFiles) {
      if (file.isFile() && file.name.endsWith('.md') && file.name !== 'README.md') {
        try {
          const content = await fs.readFile(path.join(stylesPath, file.name), 'utf-8');
          const name = file.name.replace('.md', '');

          templates.outputStyles.push({
            name,
            description: content.split('\n')[0].replace(/^#\s*/, '') || 'No description',
            content,
          });
        } catch (e) {
          // Skip
        }
      }
    }
  } catch (e) {
    console.error('Error loading output styles templates:', e);
  }

  return templates;
}

export default async function TemplatesPage() {
  const templates = await loadTemplates();
  const totalTemplates =
    templates.skills.length +
    templates.commands.length +
    templates.agents.length +
    templates.outputStyles.length;

  return (
    <PageLayout className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Templates
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Browse and install customization templates
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {totalTemplates} templates available
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/browse"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                ← Your Customizations
              </Link>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Templates inclus dans l'app</strong> - Ces customizations sont empaquetées avec l'application.
              Cliquez sur "View details" pour voir le contenu et installer dans votre ~/.claude/
            </p>
          </div>
        </header>

        {/* Skills Templates */}
        {templates.skills.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Skills ({templates.skills.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.skills.map((skill) => (
                <div
                  key={skill.name}
                  className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-purple-500 dark:border-purple-600"
                >
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 text-xs font-semibold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                      Template
                    </span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 pr-20">
                    {skill.name}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                    {skill.description}
                  </p>
                  <Link
                    href={`/templates/${skill.name}?type=skills`}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    View details →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Commands Templates */}
        {templates.commands.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Commands ({templates.commands.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.commands.map((command) => (
                <div
                  key={command.name}
                  className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-blue-500 dark:border-blue-600"
                >
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                      Template
                    </span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 pr-20">
                    {command.name}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                    {command.description}
                  </p>
                  <Link
                    href={`/templates/${command.name}?type=commands`}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    View details →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agents Templates */}
        {templates.agents.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Agents ({templates.agents.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.agents.map((agent) => (
                <div
                  key={agent.name}
                  className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-green-500 dark:border-green-600"
                >
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                      Template
                    </span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 pr-20">
                    {agent.name}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                    {agent.description}
                  </p>
                  <Link
                    href={`/templates/${agent.name}?type=agents`}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    View details →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Output Styles Templates */}
        {templates.outputStyles.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Output Styles ({templates.outputStyles.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.outputStyles.map((style) => (
                <div
                  key={style.name}
                  className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-yellow-500 dark:border-yellow-600"
                >
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
                      Template
                    </span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 pr-20">
                    {style.name}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                    {style.description}
                  </p>
                  <Link
                    href={`/templates/${style.name}?type=output-styles`}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    View details →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalTemplates === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No templates found in library/
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
