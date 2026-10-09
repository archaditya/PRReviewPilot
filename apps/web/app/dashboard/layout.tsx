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
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-neutral-400 text-xs space-y-3">
        <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center animate-pulse">
          <GitPullRequest className="w-4 h-4 text-white" />
        </div>
        <span className="font-mono text-neutral-500">Authenticating workspace session...</span>
      </div>
    );
  }

  const initials = (currentUser?.name || currentUser?.email || 'RP')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#0a0a0a] text-neutral-100 font-sans antialiased">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* FIXED SIDEBAR */}
      <aside
        className={`w-64 h-screen fixed inset-y-0 left-0 bg-[#0a0a0a] border-r border-white/10 z-50 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full justify-between p-4 overflow-y-auto">
          <div>
            {/* Header Brand */}
            <div className="flex items-center justify-between px-2 py-3 mb-6">
              <Link href="/dashboard" className="flex items-center space-x-3 group">
                <div className="w-8 h-8 rounded-lg border border-white/15 bg-white/5 flex items-center justify-center text-white group-hover:border-white/30 transition-colors">
                  <GitPullRequest className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-brand font-semibold text-base tracking-tight text-white block leading-tight">
                    ReviewPilot<span className="text-[#FF7D0C]">.</span>
                  </span>
                  <span className="font-mono text-[10px] text-neutral-500 tracking-wider uppercase block">
                    Enterprise
                  </span>
                </div>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Section */}
            <div className="space-y-1">
              <span className="font-mono text-[10px] font-medium text-neutral-500 uppercase tracking-wider px-3 mb-2 block">
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
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-white/10 text-white border border-white/15'
                          : 'text-neutral-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Bottom Profile & Sign Out (Anchored at Sidebar Bottom) */}
          <div className="border-t border-white/10 pt-4 space-y-3">
            {currentUser && (
              <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] text-xs flex items-center space-x-3">
                <div className="w-7 h-7 rounded-lg border border-white/15 bg-white/5 flex items-center justify-center text-white font-mono font-medium text-xs flex-shrink-0">
                  {initials}
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="font-medium text-white truncate text-xs">
                    {currentUser.name || currentUser.email}
                  </div>
                  <div className="text-[10px] text-neutral-500 truncate font-mono">
                    {currentUser.email}
                  </div>
                  <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono border border-white/10 bg-white/5 text-neutral-400 uppercase tracking-wider">
                    {currentUser.role}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-red-400 hover:bg-red-500/5 border border-white/10 hover:border-red-500/20 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 md:pl-64 flex flex-col h-screen overflow-hidden">
        {/* FIXED STICKY TOP NAVBAR */}
        <header className="h-14 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between z-30 flex-shrink-0 select-none">
          <div className="flex items-center space-x-3">
            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-neutral-500">Workspace:</span>
              <span className="text-white font-medium px-2.5 py-1 rounded-md bg-white/5 border border-white/10 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-neutral-400" />
                <span>{currentUser?.name || "Admin's Workspace"}</span>
              </span>
            </div>
          </div>

          {/* Right Header Status Telemetry */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-[11px] font-mono text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>All Systems Operational</span>
            </div>

            <div className="w-7 h-7 rounded-full border border-white/20 bg-white/10 text-white font-mono text-xs flex items-center justify-center">
              {initials}
            </div>
          </div>
        </header>

        {/* SCROLLABLE PAGE VIEWPORT */}
        <main className="flex-1 overflow-y-auto bg-[#0a0a0a]">
          <div className="p-6 sm:p-8 max-w-6xl w-full mx-auto space-y-8 min-h-[calc(100vh-7rem)]">
            {children}
          </div>

          {/* ENTERPRISE FOOTER */}
          <footer className="border-t border-white/10 py-6 px-8 text-xs text-neutral-500 bg-transparent flex flex-col sm:flex-row items-center justify-between gap-3 max-w-6xl mx-auto">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-neutral-400" />
              <span>ReviewPilot Enterprise • Automated AI Code Review Engine</span>
            </div>
            <div className="text-[11px] font-mono text-neutral-500">
              Multi-tenant architecture with real-time GitHub & Bitbucket webhooks
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
