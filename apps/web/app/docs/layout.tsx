'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GitPullRequest, BookOpen, GitBranch, Shield, Layers, Key, ArrowLeft } from 'lucide-react';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const docLinks = [
    { title: 'Overview & Quickstart', href: '/docs', icon: BookOpen },
    { title: 'GitHub Integration Setup', href: '/docs/github-setup', icon: GitPullRequest },
    { title: 'Bitbucket Cloud Setup', href: '/docs/bitbucket-setup', icon: GitBranch },
    { title: 'Review Rules & Policies', href: '/docs/rules-guide', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-background text-gray-100 flex flex-col">
      {/* Top Header */}
      <header className="h-16 border-b border-gray-800 bg-surface/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <GitPullRequest className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white">ReviewPilot</span>
          </Link>
          <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
            Documentation
          </span>
        </div>

        <Link
          href="/dashboard"
          className="text-xs font-medium text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-gray-800 hover:border-gray-700 transition"
        >
          Go to Dashboard →
        </Link>
      </header>

      {/* Main Docs Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Docs Sidebar */}
        <aside className="w-64 border-r border-gray-800 p-6 hidden md:block space-y-6">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Guides & Manuals</div>
          <nav className="space-y-1">
            {docLinks.map((doc) => {
              const Icon = doc.icon;
              const isActive = pathname === doc.href;
              return (
                <Link
                  key={doc.href}
                  href={doc.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{doc.title}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-8 max-w-4xl">{children}</main>
      </div>
    </div>
  );
}
