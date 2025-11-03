import Link from 'next/link';
import { redirect } from 'next/navigation';
import PageLayout from '../components/PageLayout';

export const metadata = {
  title: 'Agent Helpers',
  description: 'Manage your Claude Code customizations',
};

interface HomeProps {
  searchParams: Promise<{ project?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;

  // If a project parameter is provided, redirect to browse page
  if (params.project) {
    redirect(`/browse?project=${params.project}`);
  }

  return (
    <PageLayout className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">
                Agent Helpers
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Manage your Claude Code customizations
              </p>
            </div>
          </div>
        </header>

        {/* Main choices */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Browse local customizations */}
          <Link
            href="/browse"
            className="group block bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-5xl mb-4">📁</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Browse Your Customizations
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              View and manage your local skills, commands, agents, and output styles
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                Local mode
              </span>
            </div>
          </Link>

          {/* Explore library */}
          <Link
            href="/library"
            className="group block bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-purple-500"
          >
            <div className="text-5xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Explore Library
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Discover and install customizations from the community library
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                Templates & Examples
              </span>
            </div>
          </Link>
        </div>

        {/* Additional quick links */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/projects"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2"
          >
            <span>🔍</span>
            <span>View all discovered projects</span>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
