'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ListChecks, AlertTriangle, CheckCircle2, Clock, GitPullRequest, ArrowRight, Sparkles } from 'lucide-react';

interface ReviewJob {
  id: string;
  prNumber: number;
  status: string;
  riskLevel?: string;
  findingsCount?: number;
  tokensUsed?: number;
  repository?: {
    name: string;
    provider: string;
    providerFullName: string;
  };
  pullRequest?: {
    title: string;
    author: string;
  };
  createdAt: string;
}

export default function ReviewJobsPage() {
  const [reviews, setReviews] = useState<ReviewJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        setLoading(true);
        const res = await fetch('/api/reviews', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.reviews)) {
            setReviews(data.reviews);
          }
        }
      } catch (err) {
        console.error('Failed to load review jobs:', err);
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, []);

  const getRiskBadge = (risk?: string) => {
    switch (risk) {
      case 'critical':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">Critical Risk</span>;
      case 'high':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">High Risk</span>;
      case 'medium':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Medium Risk</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Clean / Passed</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Pull Request Review Jobs</h1>
          <p className="text-sm text-gray-400 mt-1">Audit log of all automated AI code reviews run on your repositories.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-gray-400 glass-panel rounded-xl border border-gray-800">
          Loading review jobs...
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-12 text-center space-y-4 glass-panel rounded-2xl border border-gray-800">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-semibold text-white">No Review Jobs Yet</h3>
            <p className="mt-1 text-xs text-gray-400">
              When pull requests are opened or updated on your connected repositories, automated AI reviews will appear here with line-by-line findings.
            </p>
          </div>
          <Link
            href="/dashboard/repositories"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
          >
            <span>View Connected Repos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((rev) => (
            <Link
              key={rev.id}
              href={`/dashboard/reviews/${rev.id}`}
              className="block glass-panel p-5 rounded-xl border border-gray-800 hover:border-indigo-500/50 transition group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-gray-400">{rev.repository?.providerFullName || rev.repository?.name || 'Repository'}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-xs text-indigo-400 font-medium">PR #{rev.prNumber || 1}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-xs text-gray-500 uppercase">{rev.repository?.provider || 'git'}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition">
                    {rev.pullRequest?.title || 'Automated Pull Request Review'}
                  </h3>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span>Status: <strong className="text-white capitalize">{rev.status}</strong></span>
                    <span>Created: {new Date(rev.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {getRiskBadge(rev.riskLevel)}
                  <div className="p-2 rounded-lg bg-gray-800 text-gray-400 group-hover:text-white group-hover:bg-indigo-600 transition">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
