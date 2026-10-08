'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { GitPullRequest, LayoutDashboard, GitFork, ListChecks, Settings, LogOut, BookOpen, Sliders } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Not authenticated');
        }
        return res.json();
      })
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
        } else {
          router.replace('/login');
        }
      })
      .catch(() => {
        router.replace('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      // ignore
    }
    router.replace('/login');
  };

  const isSuperOrAdmin = currentUser?.role === 'superadmin' || currentUser?.role === 'admin';

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Repositories', href: '/dashboard/repositories', icon: GitFork },
    { name: 'Review Jobs', href: '/dashboard/reviews', icon: ListChecks },
    ...(isSuperOrAdmin ? [{ name: 'Admin Controls', href: '/dashboard/admin', icon: Sliders }] : []),
    { name: 'Documentation', href: '/docs', icon: BookOpen },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-gray-400 text-sm">
        Authenticating workspace session...
      </div>
    );
  }

  const initials = (currentUser?.name || currentUser?.email || 'RP')
    .slice(0, 2)
    .toUpperCase();

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
        <div className="border-t border-gray-800/80 pt-4 space-y-2">
          {currentUser && (
            <div className="px-3 py-2 text-xs">
              <div className="font-semibold text-white truncate">{currentUser.name || currentUser.email}</div>
              <div className="text-gray-400 truncate">{currentUser.email}</div>
              <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 uppercase font-semibold">
                {currentUser.role}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b border-gray-800/80 px-8 flex items-center justify-between bg-surface/30">
          <div className="text-sm font-medium text-gray-400">
            Workspace: <span className="text-white font-semibold">{currentUser?.name || 'My Org'}</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
              {initials}
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
