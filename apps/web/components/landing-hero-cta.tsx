'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';

export function LandingHeroCta() {
  const { data: user } = useCurrentUser();

  const isAdmin = user?.role === 'admin';
  const targetLink = user ? (isAdmin ? '/dashboard/admin' : '/dashboard') : '/login';

  return (
    <div className="mt-7 flex flex-col sm:flex-row items-center gap-3">
      {user ? (
        <Link
          href={targetLink}
          className="btn-asym text-xs w-full sm:w-auto"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Open Workspace Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      ) : (
        <Link
          href="/login"
          className="btn-asym text-xs w-full sm:w-auto"
        >
          <span>Connect repository</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      )}

      <Link
        href="/docs"
        className="btn-asym-mirror text-xs w-full sm:w-auto"
      >
        <span>Read integration guide</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
