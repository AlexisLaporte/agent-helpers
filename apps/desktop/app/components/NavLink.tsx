'use client';

import Link from "next/link";

export function NavLink({ href, icon, children }: { href: string; icon: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors"
      style={{
        color: 'var(--foreground)',
      }}
    >
      <span>{icon}</span>
      <span>{children}</span>
    </Link>
  );
}
