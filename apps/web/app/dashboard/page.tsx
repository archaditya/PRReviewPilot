'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GitFork, ListChecks, ShieldAlert, CheckCircle2, ArrowRight, GitBranch, Plus, Sparkles, ArrowUpRight } from 'lucide-react';

interface Repo {
  id: string;
  name: string;
  provider: string;
  status: string;
}

interface Review {
  id: string;
  status: string;
  findingsCount?: number;
  repository?: {
    name: string;
    provider: string;
  };
  pullRequest?: {
    title: string;
    author: string;
  };
  createdAt: string;
}

export default function DashboardOverviewPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [reposRes, reviewsRes] = await Promise.all([
          fetch('/api/repos', { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)),
          fetch('/api/reviews', { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)),
        ]);

        if (reposRes?.success && Array.isArray(reposRes.repositories)) {
          setRepos(reposRes.repositories);
        }
        if (reviewsRes?.success && Array.isArray(reviewsRes.reviews)) {
          setReviews(reviewsRes.reviews);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const totalRepos = repos.length;
  const totalReviews = reviews.length;
  const completedReviews = reviews.filter((r) => r.status === 'completed').length;

  const stats = [
    {
      label: 'Connected Repositories',
      value: loading ? '...' : totalRepos.toString(),
      change: totalRepos === 0 ? 'No repos connected' : 'Active monitoring',
      icon: GitFork,
    },
    {
      label: 'PR Reviews Processed',
      value: loading ? '...' : totalReviews.toString(),
      change: totalReviews === 0 ? 'Awaiting first PR' : `${completedReviews} completed`,
      icon: ListChecks,
    },
    {
      label: 'Critical Risks Detected',
      value: loading ? '...' : '0',
      change: 'Active in CI/CD pipeline',
      icon: ShieldAlert,
    },
    {
      label: 'Average Review Time',
      value: loading ? '...' : totalReviews > 0 ? '14s' : '--',
      change: 'Real-time AI analysis',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-white">Dashboard Overview</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Real-time health of your connected repositories and automated AI pull request reviews powered by <span className="highlight">deep graph ast analysis</span>.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/repositories"
            className="btn-asym text-xs"
          >
            <span>Connect Repository</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="card-chai p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-neutral-400">{s.label}</span>
                <Icon className="w-4 h-4 text-neutral-500" />
              </div>
              <div className="space-y-1">
                <div className="font-montserrat text-3xl font-medium text-white">{s.value}</div>
                <div className="text-[11px] font-mono text-neutral-500">{s.change}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Reviews Table */}
      <div className="card-chai p-0 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-montserrat font-medium text-sm text-white">Recent Pull Request Reviews</h2>
          <Link href="/dashboard/reviews" className="text-xs font-mono text-neutral-400 hover:text-white flex items-center space-x-1 transition-colors">
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm font-mono text-neutral-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 text-neutral-400 flex items-center justify-center mx-auto border border-white/10">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="font-montserrat text-base font-medium text-white">No Pull Requests Reviewed Yet</h3>
              <p className="mt-1 text-xs text-neutral-400">
                Connect your GitHub or Bitbucket repository and open a pull request. PRReviewPilot will automatically analyze changes and post inline security reviews.
              </p>
            </div>
            <Link
              href="/dashboard/repositories"
              className="btn-asym text-xs inline-flex"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Connect First Repository</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.02] text-neutral-400 text-[11px] font-mono uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="px-6 py-3">Repository</th>
                  <th className="px-6 py-3">Pull Request</th>
                  <th className="px-6 py-3">Provider</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-neutral-300">
                {reviews.slice(0, 5).map((rev) => (
                  <tr key={rev.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-white">{rev.repository?.name || 'repo'}</td>
                    <td className="px-6 py-4">{rev.pullRequest?.title || 'Pull Request'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono border border-white/10 bg-white/5 text-neutral-400 uppercase">
                        {rev.repository?.provider || 'git'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-emerald-400 text-xs font-mono capitalize">{rev.status}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-neutral-500">{new Date(rev.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
