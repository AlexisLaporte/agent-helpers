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
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Your Customizations
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Browse and manage your local Claude Code customizations
          </p>
          {projectPath && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Viewing:
              </span>
              <span className="text-sm font-mono bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded">
                {projectPath.replace(/\//g, ' › ')}
              </span>
              <Link
                href="/browse"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                (clear)
              </Link>
            </div>
          )}
        </header>

        {/* Local Configuration */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Configuration
          </h2>
          <LocalConfigSection projectPath={projectPath} />
        </div>

        {/* Skills */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Skills
          </h2>
          <LocalSkillsSection projectPath={projectPath} />
        </div>

        {/* Commands */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Commands
          </h2>
          <LocalCommandsSection projectPath={projectPath} />
        </div>

        {/* Agents */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Agents
          </h2>
          <LocalAgentsSection projectPath={projectPath} />
        </div>

        {/* Output Styles */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Output Styles
          </h2>
          <LocalOutputStylesSection projectPath={projectPath} />
        </div>
      </div>
    </div>
  );
}
