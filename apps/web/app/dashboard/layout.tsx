'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GitPullRequest, LayoutDashboard, GitFork, ListChecks, Settings, LogOut, BookOpen, Sliders } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Repositories', href: '/dashboard/repositories', icon: GitFork },
    { name: 'Review Jobs', href: '/dashboard/reviews', icon: ListChecks },
    { name: 'Admin Controls', href: '/dashboard/admin', icon: Sliders },
    { name: 'Documentation', href: '/docs', icon: BookOpen },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-background text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800/80 bg-surface/50 backdrop-blur-md flex flex-col justify-between p-4">
        <div>
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3 px-2 py-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <GitPullRequest className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">PRReviewPilot</span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User / Sign Out */}
        <div className="border-t border-gray-800/80 pt-4">
          <Link
            href="/login"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b border-gray-800/80 px-8 flex items-center justify-between bg-surface/30">
          <div className="text-sm font-medium text-gray-400">Workspace</div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs">
              RP
            </div>
          </div>
        </header>
        <div className="p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
