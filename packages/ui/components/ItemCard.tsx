import Link from 'next/link';

interface ItemCardProps {
  name: string;
  description?: string;
  href: string;
  installed?: boolean;
}

export default function ItemCard({ name, description, href, installed = true }: ItemCardProps) {
  return (
    <div
      className="relative p-6 surface-elevated rounded-xl transition-all duration-200 hover:scale-105"
      style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
          {name}
        </h3>
        {installed && (
          <span className="px-2 py-1 text-xs font-semibold rounded flex-shrink-0" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}>
            Installed
          </span>
        )}
      </div>
      {description && (
        <p className="text-sm mb-4 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
      )}
      <Link
        href={href}
        className="text-sm hover:underline inline-block"
        style={{ color: 'var(--accent)' }}
      >
        View details →
      </Link>
    </div>
  );
}
