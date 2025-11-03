export default function Footer() {
  return (
    <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          Maintained by{' '}
          <a
            href="https://github.com/AlexisLaporte"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            @AlexisLaporte
          </a>
          {' '}for{' '}
          <a
            href="https://github.com/321founded"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            @321founded
          </a>
        </p>
        <p className="mt-2">
          <a
            href="https://github.com/321founded/agent-helpers"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            View on GitHub
          </a>
          {' · '}
          <a
            href="https://github.com/AlexisLaporte/agent-helpers"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Upstream Repository
          </a>
        </p>
      </div>
    </footer>
  );
}
