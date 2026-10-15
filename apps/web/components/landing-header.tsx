'use client';

import React from 'react';
import Link from 'next/link';
import { GitPullRequest, BookOpen, ArrowUpRight, ArrowRight, User as UserIcon, LogOut } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';

export function LandingHeader() {
  const { data: user, isLoading } = useCurrentUser();

  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        document.cookie = 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location.href = '/login';
      }
    } catch {
      window.location.href = '/login';
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0c0e12]/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
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
        <div className="flex items-center space-x-3">
          {/* Docs Link */}
          <Link
            href="/docs"
            className="text-xs font-mono px-2.5 py-1 rounded-md border border-orange-500/25 bg-orange-500/5 text-orange-300 hover:bg-orange-500/15 hover:border-orange-500/40 transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3 h-3 text-orange-400" />
            <span>Docs</span>
            <ArrowUpRight className="w-2.5 h-2.5 opacity-70" />
          </Link>

          {!isLoading && user ? (
            <div className="flex items-center gap-2.5">
              {/* User Identity Pill */}
              <Link
                href="/dashboard"
                className="flex items-center gap-2 py-1 px-2.5 rounded-full border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 hover:border-orange-500/50 transition-all text-xs text-neutral-200 group"
              >
                <div className="w-5 h-5 rounded-full bg-[#F6821F] text-black font-bold flex items-center justify-center text-[10px] uppercase">
                  {(user.name || user.email || 'U')[0]}
                </div>
                <span className="truncate max-w-[120px] text-xs font-medium text-white">
                  {user.name || user.email?.split('@')[0]}
                </span>
                {user.role === 'admin' && (
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    Admin
                  </span>
                )}
              </Link>

              {/* Direct Dashboard Button */}
              <Link
                href="/dashboard"
                className="btn-asym text-xs gap-1.5"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-medium text-neutral-400 hover:text-white transition-colors px-2.5 py-1"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="btn-asym text-xs"
              >
                <span>Get started</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
