import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/browse"
            className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Agent Helpers
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/browse"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Your Customizations
            </Link>
            <Link
              href="/templates"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Templates
            </Link>
            <Link
              href="/duplicates"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Duplicates
            </Link>
            <Link
              href="/projects"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Projects
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
