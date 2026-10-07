'use client';

import Link from 'next/link';
import { ListChecks, AlertTriangle, CheckCircle2, Clock, GitPullRequest, ArrowRight } from 'lucide-react';

export default function ReviewJobsPage() {
  const reviews = [
    {
      id: 'rev-101',
      repoName: 'org/core-api',
      prNumber: 42,
      prTitle: 'Add OAuth refresh token rotation and session revocation',
      author: 'dev-alex',
      provider: 'github',
      riskLevel: 'critical',
      findingsCount: 3,
      status: 'completed',
      createdAt: '15 mins ago',
    },
    {
      id: 'rev-102',
      repoName: 'org/mobile-client',
      prNumber: 15,
      prTitle: 'Update Bitbucket webhook verification logic',
      author: 'dev-sam',
      provider: 'bitbucket',
      riskLevel: 'low',
      findingsCount: 0,
      status: 'completed',
      createdAt: '2 hours ago',
    },
    {
      id: 'rev-103',
      repoName: 'org/core-api',
      prNumber: 43,
      prTitle: 'Refactor database connection pool settings',
      author: 'dev-alex',
      provider: 'github',
      riskLevel: 'medium',
      findingsCount: 2,
      status: 'completed',
      createdAt: '5 hours ago',
    },
  ];

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'critical':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">Critical Risk</span>;
      case 'high':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">High Risk</span>;
      case 'medium':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Medium Risk</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Low Risk</span>;
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
                  <span className="text-xs font-semibold text-gray-400">{rev.repoName}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-xs text-indigo-400 font-medium">PR #{rev.prNumber}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-xs text-gray-500 capitalize">{rev.provider}</span>
                </div>
                <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition">
                  {rev.prTitle}
                </h3>
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span>Author: {rev.author}</span>
                  <span>{rev.findingsCount} findings</span>
                  <span>{rev.createdAt}</span>
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
    </div>
  );
}
