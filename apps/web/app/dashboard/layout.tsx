'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  GitPullRequest,
  LayoutDashboard,
  GitFork,
  ListChecks,
  Settings,
  LogOut,
  BookOpen,
  Sliders,
  Menu,
  X,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user && isMounted) {
            setCurrentUser(data.user);
            setLoading(false);
            return;
          }
        }

        // Silent token refresh if access token expired
        const refreshRes = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshRes.ok) {
          const retryRes = await fetch('/api/auth/me', { credentials: 'include' });
          if (retryRes.ok) {
            const retryData = await retryRes.json();
            if (retryData.success && retryData.user && isMounted) {
              setCurrentUser(retryData.user);
              setLoading(false);
              return;
            }
          }
        }

        if (isMounted) router.replace('/login');
      } catch (e) {
        if (isMounted) router.replace('/login');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0A0D14] text-gray-400 text-xs space-y-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center animate-pulse">
          <GitPullRequest className="w-4 h-4 text-indigo-400" />
        </div>
        <span>Authenticating workspace session...</span>
      </div>
    );
  }

  const initials = (currentUser?.name || currentUser?.email || 'RP')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#0A0D14] text-gray-100 font-sans antialiased">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* FIXED SIDEBAR */}
      <aside
        className={`w-64 h-screen fixed inset-y-0 left-0 bg-[#0B0F17] border-r border-gray-800/80 z-50 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full justify-between p-4 overflow-y-auto">
          <div>
            {/* Header Brand */}
            <div className="flex items-center justify-between px-2 py-3 mb-6">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                  <GitPullRequest className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-base tracking-tight text-white block leading-tight">
                    PRReviewPilot
                  </span>
                  <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase block">
                    Enterprise
                  </span>
                </div>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Section */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2 block">
                Workspace Menu
              </span>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Bottom Profile & Sign Out (Anchored at Sidebar Bottom) */}
          <div className="border-t border-gray-800/80 pt-4 space-y-3">
            {currentUser && (
              <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 text-xs flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {initials}
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="font-semibold text-white truncate text-xs">
                    {currentUser.name || currentUser.email}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate">
                    {currentUser.email}
                  </div>
                  <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] bg-indigo-500/20 text-indigo-300 font-bold uppercase tracking-wider">
                    {currentUser.role}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 border border-gray-800 hover:border-rose-500/30 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER (Shifted for fixed sidebar on md+) */}
      <div className="flex-1 md:pl-64 flex flex-col h-screen overflow-hidden">
        {/* FIXED STICKY TOP NAVBAR */}
        <header className="h-16 border-b border-gray-800/80 bg-[#0B0F17]/90 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between z-30 flex-shrink-0 select-none">
          <div className="flex items-center space-x-3">
            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-gray-400">Workspace:</span>
              <span className="text-white font-bold px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 flex items-center gap-1.5 shadow-sm">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>{currentUser?.name || "Admin's Workspace"}</span>
              </span>
            </div>
          </div>

          {/* Right Header Status Telemetry */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-[11px] text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>All Systems Operational</span>
            </div>

            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold flex items-center justify-center text-xs shadow-md">
              {initials}
            </div>
          </div>
        </header>

        {/* SCROLLABLE PAGE VIEWPORT (Body scrolls independently) */}
        <main className="flex-1 overflow-y-auto bg-[#0A0D14]">
          <div className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-8 min-h-[calc(100vh-8rem)]">
            {children}
          </div>

          {/* ENTERPRISE FOOTER (Anchored at page bottom) */}
          <footer className="border-t border-gray-800/60 py-6 px-8 text-center text-xs text-gray-500 bg-[#0B0F17]/40 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>PRReviewPilot Enterprise v1.0 • Automated AI Code Review Engine</span>
            </div>
            <div className="text-[11px] text-gray-500">
              Multi-tenant architecture with real-time GitHub & Bitbucket webhooks
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
