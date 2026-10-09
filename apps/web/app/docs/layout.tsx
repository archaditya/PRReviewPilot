'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GitPullRequest, BookOpen, GitBranch, Shield, ArrowUpRight } from 'lucide-react';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const docLinks = [
    { title: 'Overview & quickstart', href: '/docs', icon: BookOpen },
    { title: 'GitHub App setup', href: '/docs/github-setup', icon: GitPullRequest },
    { title: 'Bitbucket Cloud setup', href: '/docs/bitbucket-setup', icon: GitBranch },
    { title: 'Review rules & policies', href: '/docs/rules-guide', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 font-sans antialiased flex flex-col selection:bg-white/20">
      {/* ── Top Header ── */}
      <header className="h-14 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-7 h-7 rounded-lg border border-white/15 bg-white/5 flex items-center justify-center text-white group-hover:border-white/30 transition-colors">
              <GitPullRequest className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-brand font-semibold text-base tracking-tight text-white block">
              ReviewPilot<span className="text-[#FF7D0C]">.</span>
            </span>
          </Link>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/10 bg-white/5 text-neutral-400">
            Documentation
          </span>
        </div>

        <Link
          href="/dashboard"
          className="btn-asym text-xs"
        >
          <span>Open dashboard</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* ── Main Docs Body ── */}
      <div className="flex-1 max-w-6xl w-full mx-auto flex">
        {/* Docs Sidebar */}
        <aside className="w-64 border-r border-white/10 p-6 hidden md:block space-y-6 shrink-0 bg-[#0a0a0a]">
          <div className="text-[10px] font-mono font-medium uppercase tracking-wider text-neutral-500">
            Guides & manuals
          </div>
          <nav className="space-y-1">
            {docLinks.map((doc) => {
              const Icon = doc.icon;
              const isActive = pathname === doc.href;
              return (
                <Link
                  key={doc.href}
                  href={doc.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white border border-white/15'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
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
        <main className="flex-1 p-6 sm:p-10 max-w-3xl overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
