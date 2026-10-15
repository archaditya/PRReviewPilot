'use client';

import React from 'react';
import Link from 'next/link';
import {
  GitPullRequest,
  BookOpen,
  ArrowUpRight,
  ArrowRight,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function LandingHeader() {
  const { data: user, isLoading } = useCurrentUser();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    }
    queryClient.setQueryData(['me'], null);
    queryClient.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('prbot_app_key');
      document.cookie = 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      window.location.href = '/login';
    }
  };

  const isAdmin = user?.role === 'admin';
  const dashboardLink = isAdmin ? '/dashboard/admin' : '/dashboard';

  const initials = (user?.name || user?.email || 'U')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0c0e12]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-7 h-7 rounded-lg border border-orange-500/30 bg-orange-500/10 flex items-center justify-center text-white group-hover:border-orange-500/60 transition-colors">
            <GitPullRequest className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <span className="font-brand font-semibold text-base tracking-tight text-white block">
            ReviewPilot<span className="text-[#F6821F]">.</span>
          </span>
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center space-x-6 text-xs text-neutral-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#terminal-preview" className="hover:text-white transition-colors">Live Preview</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
        </nav>

        {/* Right Auth / Session Actions */}
        <div className="flex items-center space-x-2.5">
          {/* Developer Documentation Link */}
          <Link
            href="/docs"
            className="text-xs font-mono px-2.5 py-1 rounded-md border border-orange-500/25 bg-orange-500/5 text-orange-300 hover:bg-orange-500/15 hover:border-orange-500/40 transition-colors hidden sm:flex items-center gap-1.5"
          >
            <BookOpen className="w-3 h-3 text-orange-400" />
            <span>Docs</span>
            <ArrowUpRight className="w-2.5 h-2.5 opacity-70" />
          </Link>

          {!isLoading && user ? (
            <div className="flex items-center gap-2">
              {/* User Profile Pill */}
              <Link
                href={dashboardLink}
                className="flex items-center gap-2 py-1 px-2.5 rounded-full border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 hover:border-orange-500/50 transition-all text-xs text-neutral-200 group"
                title={`Signed in as ${user.name || user.email}`}
              >
                <div className="w-5 h-5 rounded-full bg-[#F6821F] text-black font-bold flex items-center justify-center text-[10px] uppercase shrink-0">
                  {initials[0]}
                </div>
                <span className="truncate max-w-[110px] sm:max-w-[150px] text-xs font-semibold text-white">
                  {user.name || user.email?.split('@')[0]}
                </span>
                {isAdmin && (
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    Admin
                  </span>
                )}
              </Link>

              {/* Direct Dashboard Action */}
              <Link
                href={dashboardLink}
                className="btn-asym text-xs gap-1.5 px-3 py-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Go to Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
                <ArrowRight className="w-3 h-3 ml-0.5" />
              </Link>

              {/* Quick Sign Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 transition-all"
                title="Sign out of ReviewPilot"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : !isLoading && (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-medium text-neutral-400 hover:text-white transition-colors px-2.5 py-1"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="btn-asym text-xs px-3 py-1.5"
              >
                <span>Get started</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
