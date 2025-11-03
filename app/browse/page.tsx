import Link from 'next/link';
import LocalSkillsSection from '../../components/LocalSkillsSection';
import LocalCommandsSection from '../../components/LocalCommandsSection';
import LocalAgentsSection from '../../components/LocalAgentsSection';
import LocalOutputStylesSection from '../../components/LocalOutputStylesSection';
import LocalConfigSection from '../../components/LocalConfigSection';
import PageLayout from '../../components/PageLayout';

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
    <PageLayout className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Your Customizations
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Browse and manage your local Claude Code customizations
              </p>
              {projectPath && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Viewing:
                  </span>
                  <span className="text-sm font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                    {projectPath.replace(/\//g, ' › ')}
                  </span>
                  <Link
                    href="/browse"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    (clear)
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                ← Home
              </Link>
              <Link
                href="/projects"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                📁 View Projects
              </Link>
            </div>
          </div>
        </header>

        {/* Local Configuration */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Your Configuration
          </h2>
          <LocalConfigSection projectPath={projectPath} />
        </div>

        {/* Skills */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Your Skills
          </h2>
          <LocalSkillsSection projectPath={projectPath} />
        </div>

        {/* Commands */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Your Commands
          </h2>
          <LocalCommandsSection projectPath={projectPath} />
        </div>

        {/* Agents */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Your Agents
          </h2>
          <LocalAgentsSection projectPath={projectPath} />
        </div>

        {/* Output Styles */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Your Output Styles
          </h2>
          <LocalOutputStylesSection projectPath={projectPath} />
        </div>
      </div>
    </PageLayout>
  );
}
