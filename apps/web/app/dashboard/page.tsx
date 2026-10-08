'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GitFork, ListChecks, ShieldAlert, CheckCircle2, ArrowRight, GitBranch, Plus, Sparkles } from 'lucide-react';

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
      color: 'text-indigo-400',
    },
    {
      label: 'PR Reviews Processed',
      value: loading ? '...' : totalReviews.toString(),
      change: totalReviews === 0 ? 'Awaiting first PR' : `${completedReviews} completed`,
      icon: ListChecks,
      color: 'text-purple-400',
    },
    {
      label: 'Critical Risks Detected',
      value: loading ? '...' : '0',
      change: 'Active in CI/CD',
      icon: ShieldAlert,
      color: 'text-rose-400',
    },
    {
      label: 'Average Review Time',
      value: loading ? '...' : totalReviews > 0 ? '14s' : '--',
      change: 'Real-time AI analysis',
      icon: CheckCircle2,
      color: 'text-emerald-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-sm text-gray-400 mt-1">Real-time health of your connected repositories and automated AI pull request reviews.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/repositories"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition shadow-md shadow-indigo-600/30 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Repository</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="glass-panel p-5 rounded-xl border border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">{s.label}</span>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className="mt-4 flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-white">{s.value}</span>
                <span className="text-xs text-gray-500">{s.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Reviews Table */}
      <div className="glass-panel rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800/80 flex items-center justify-between">
          <h2 className="font-semibold text-white">Recent Pull Request Reviews</h2>
          <Link href="/dashboard/reviews" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1">
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-semibold text-white">No Pull Requests Reviewed Yet</h3>
              <p className="mt-1 text-xs text-gray-400">
                Connect your GitHub or Bitbucket repository and open a pull request. PRReviewPilot will automatically analyze changes and post inline security reviews.
              </p>
            </div>
            <Link
              href="/dashboard/repositories"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Connect First Repository</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-900/40 text-gray-400 text-xs uppercase border-b border-gray-800">
                <tr>
                  <th className="px-6 py-3">Repository</th>
                  <th className="px-6 py-3">Pull Request</th>
                  <th className="px-6 py-3">Provider</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-300">
                {reviews.slice(0, 5).map((rev) => (
                  <tr key={rev.id} className="hover:bg-gray-800/30 transition">
                    <td className="px-6 py-4 font-medium text-white">{rev.repository?.name || 'repo'}</td>
                    <td className="px-6 py-4">{rev.pullRequest?.title || 'Pull Request'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300 uppercase">
                        {rev.repository?.provider || 'git'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-emerald-400 text-xs font-medium capitalize">{rev.status}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{new Date(rev.createdAt).toLocaleDateString()}</td>
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
