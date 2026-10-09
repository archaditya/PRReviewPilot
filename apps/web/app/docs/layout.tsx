'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GitPullRequest, BookOpen, GitBranch, Shield, ArrowUpRight } from 'lucide-react';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const docSections = [
    {
      category: 'Getting Started',
      items: [
        { title: 'Overview & Quickstart', href: '/docs', icon: BookOpen },
      ],
    },
    {
      category: 'Git Integrations',
      items: [
        { title: 'GitHub App Setup', href: '/docs/github-setup', icon: GitPullRequest },
        { title: 'Bitbucket Cloud Setup', href: '/docs/bitbucket-setup', icon: GitBranch },
      ],
    },
    {
      category: 'Engine Configuration',
      items: [
        { title: 'Review Rules & Policies', href: '/docs/rules-guide', icon: Shield },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0c0e12] text-neutral-100 font-sans antialiased flex flex-col selection:bg-orange-500/30">
      {/* ── Standalone Docs Header ── */}
      <header className="h-14 border-b border-white/10 bg-[#0d0f14]/90 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-7 h-7 rounded-lg border border-orange-500/30 bg-orange-500/10 flex items-center justify-center text-white group-hover:border-orange-500/60 transition-colors">
              <GitPullRequest className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <span className="font-brand font-semibold text-base tracking-tight text-white block">
              ReviewPilot<span className="text-[#F6821F]">.</span>
            </span>
          </Link>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-orange-500/25 bg-orange-500/10 text-orange-300 uppercase tracking-wider">
            Docs Portal
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="text-xs text-neutral-400 hover:text-white transition-colors px-2.5 py-1"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="btn-asym text-xs"
          >
            <span>Open Dashboard</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ── Main Docs Body ── */}
      <div className="flex-1 max-w-6xl w-full mx-auto flex">
        {/* Docs Sidebar */}
        <aside className="w-64 border-r border-white/10 p-6 hidden md:block space-y-6 shrink-0 bg-[#0d0f14]">
          {docSections.map((sec) => (
            <div key={sec.category} className="space-y-2">
              <div className="text-[10px] font-mono font-medium uppercase tracking-wider text-neutral-500">
                {sec.category}
              </div>
              <nav className="space-y-1">
                {sec.items.map((doc) => {
                  const Icon = doc.icon;
                  const isActive = pathname === doc.href;
                  return (
                    <Link
                      key={doc.href}
                      href={doc.href}
                      className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-orange-500/10 text-white font-medium border-l-2 border-[#F6821F] rounded-l-none'
                          : 'text-neutral-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-400' : ''}`} />
                      <span>{doc.title}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 sm:p-10 max-w-3xl overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
