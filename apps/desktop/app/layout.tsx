import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Agent Helpers - Claude Code Customizations",
    template: "%s | Agent Helpers",
  },
  description: "Browse, manage, and sync Claude Code customizations including skills, commands, agents, and output styles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-56 surface border-r" style={{ borderColor: 'var(--border)' }}>
            {/* Header */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <Link href="/" className="flex items-center gap-2">
                <svg viewBox="0 0 100 100" width="32" height="32">
                  <defs>
                    <linearGradient id="logo" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1e40af" />
                      <stop offset="50%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="40" fill="url(#logo)" />
                </svg>
                <div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                    Agent Helpers
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Claude Code
                  </div>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="p-3 space-y-1">
              <NavLink href="/browse" icon="📁">Browse</NavLink>
              <NavLink href="/templates" icon="📦">Templates</NavLink>
              <NavLink href="/projects" icon="🗂️">Projects</NavLink>
              <NavLink href="/duplicates" icon="🔍">Duplicates</NavLink>
              <NavLink href="/claude-md" icon="📝">CLAUDE.md</NavLink>

              <div className="pt-3 mt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="text-xs font-semibold px-2 mb-2" style={{ color: 'var(--text-muted)' }}>
                  SETTINGS
                </div>
                <NavLink href="/settings/sources" icon="🌐">Sources</NavLink>
              </div>
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                v0.1.2
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1" style={{ background: 'var(--background)' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: string; children: React.ReactNode }) {
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
