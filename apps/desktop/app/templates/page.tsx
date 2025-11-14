import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import type { Skill, Command, Agent, OutputStyle } from '@agent-helpers/core/types';

export const metadata = {
  title: 'Templates - Agent Helpers',
  description: 'Browse and install customization templates',
};

async function getLibraryPath() {
  // Library is always in packages/library in the monorepo
  return path.join(process.cwd(), '..', '..', 'packages', 'library');
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
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
            Template Library
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            {totalTemplates} templates available in bundled library
          </p>

          <div className="mt-6 p-6 rounded-xl surface-elevated" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              These templates are bundled with the app. Click any template to view details and install to ~/.claude/
            </p>
          </div>
        </header>

        {/* Skills Templates */}
        {templates.skills.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--foreground)' }}>
              Skills ({templates.skills.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.skills.map((skill) => (
                <div
                  key={skill.name}
                  className="relative p-6 surface-elevated rounded-xl transition-all duration-200 hover:scale-105"
                  style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
                >
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                      Template
                    </span>
                  </div>
                  <h4 className="text-xl font-semibold mb-2 pr-20" style={{ color: 'var(--foreground)' }}>
                    {skill.name}
                  </h4>
                  <p className="line-clamp-3 mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {skill.description}
                  </p>
                  <Link
                    href={`/templates/${skill.name}?type=skills`}
                    className="flex items-center gap-2 text-sm font-medium"
                    style={{ color: 'var(--accent)' }}
                  >
                    View details
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Commands Templates */}
        {templates.commands.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--foreground)' }}>
              Commands ({templates.commands.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.commands.map((command) => (
                <div
                  key={command.name}
                  className="relative p-6 surface-elevated rounded-xl transition-all duration-200 hover:scale-105"
                  style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
                >
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                      Template
                    </span>
                  </div>
                  <h4 className="text-xl font-semibold mb-2 pr-20" style={{ color: 'var(--foreground)' }}>
                    {command.name}
                  </h4>
                  <p className="line-clamp-3 mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {command.description}
                  </p>
                  <Link
                    href={`/templates/${command.name}?type=commands`}
                    className="flex items-center gap-2 text-sm font-medium"
                    style={{ color: 'var(--accent)' }}
                  >
                    View details
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agents Templates */}
        {templates.agents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--foreground)' }}>
              Agents ({templates.agents.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.agents.map((agent) => (
                <div
                  key={agent.name}
                  className="relative p-6 surface-elevated rounded-xl transition-all duration-200 hover:scale-105"
                  style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
                >
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                      Template
                    </span>
                  </div>
                  <h4 className="text-xl font-semibold mb-2 pr-20" style={{ color: 'var(--foreground)' }}>
                    {agent.name}
                  </h4>
                  <p className="line-clamp-3 mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {agent.description}
                  </p>
                  <Link
                    href={`/templates/${agent.name}?type=agents`}
                    className="flex items-center gap-2 text-sm font-medium"
                    style={{ color: 'var(--accent)' }}
                  >
                    View details
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Output Styles Templates */}
        {templates.outputStyles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--foreground)' }}>
              Output Styles ({templates.outputStyles.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.outputStyles.map((style) => (
                <div
                  key={style.name}
                  className="relative p-6 surface-elevated rounded-xl transition-all duration-200 hover:scale-105"
                  style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
                >
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                      Template
                    </span>
                  </div>
                  <h4 className="text-xl font-semibold mb-2 pr-20" style={{ color: 'var(--foreground)' }}>
                    {style.name}
                  </h4>
                  <p className="line-clamp-3 mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {style.description}
                  </p>
                  <Link
                    href={`/templates/${style.name}?type=output-styles`}
                    className="flex items-center gap-2 text-sm font-medium"
                    style={{ color: 'var(--accent)' }}
                  >
                    View details
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalTemplates === 0 && (
          <div className="text-center py-12 surface-elevated rounded-xl" style={{ border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              No templates found in library/
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
