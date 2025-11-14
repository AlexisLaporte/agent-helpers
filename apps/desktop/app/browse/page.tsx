import Link from 'next/link';
import LocalSkillsSection from '@agent-helpers/ui/components/LocalSkillsSection';
import LocalCommandsSection from '@agent-helpers/ui/components/LocalCommandsSection';
import LocalAgentsSection from '@agent-helpers/ui/components/LocalAgentsSection';
import LocalOutputStylesSection from '@agent-helpers/ui/components/LocalOutputStylesSection';
import LocalConfigSection from '@agent-helpers/ui/components/LocalConfigSection';

export const metadata = {
  title: 'Browse - Agent Helpers',
  description: 'Browse and manage your local Claude Code customizations',
};

interface BrowseProps {
  searchParams: Promise<{ project?: string }>;
}

export default async function BrowsePage({ searchParams }: BrowseProps) {
  const params = await searchParams;
  const projectPath = params.project;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
            Your Customizations
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Browse and manage your local Claude Code customizations
          </p>
          {projectPath && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Viewing:
              </span>
              <span className="text-sm font-mono px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--surface-elevated)', color: 'var(--accent)', border: '1px solid var(--border)' }}>
                {projectPath.replace(/\//g, ' › ')}
              </span>
              <Link
                href="/browse"
                className="text-sm font-medium hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                (clear)
              </Link>
            </div>
          )}
        </header>

        {/* Local Configuration */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--foreground)' }}>
            Configuration
          </h2>
          <LocalConfigSection projectPath={projectPath} />
        </div>

        {/* Skills */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--foreground)' }}>
            Skills
          </h2>
          <LocalSkillsSection projectPath={projectPath} />
        </div>

        {/* Commands */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--foreground)' }}>
            Commands
          </h2>
          <LocalCommandsSection projectPath={projectPath} />
        </div>

        {/* Agents */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--foreground)' }}>
            Agents
          </h2>
          <LocalAgentsSection projectPath={projectPath} />
        </div>

        {/* Output Styles */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--foreground)' }}>
            Output Styles
          </h2>
          <LocalOutputStylesSection projectPath={projectPath} />
        </div>
      </div>
    </div>
  );
}
