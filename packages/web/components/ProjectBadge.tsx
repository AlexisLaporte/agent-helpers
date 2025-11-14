import Link from 'next/link';

interface ProjectBadgeProps {
  projectName: string;
  projectPath?: string;
  href?: string;
}

export default function ProjectBadge({ projectName, projectPath, href }: ProjectBadgeProps) {
  const className = "px-2 py-1 text-xs font-semibold rounded bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors";

  if (href) {
    return (
      <Link
        href={href}
        className={className}
        title={projectPath}
      >
        {projectName}
      </Link>
    );
  }

  return (
    <span
      className="px-2 py-1 text-xs font-semibold rounded bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
      title={projectPath}
    >
      {projectName}
    </span>
  );
}
