'use client';

import Link from 'next/link';
import { GitFork, ListChecks, ShieldAlert, CheckCircle2, ArrowRight, GitBranch } from 'lucide-react';

export default function DashboardOverviewPage() {
  const stats = [
    { label: 'Connected Repositories', value: '4', change: '+2 this week', icon: GitFork, color: 'text-indigo-400' },
    { label: 'PR Reviews Processed', value: '38', change: '100% automated', icon: ListChecks, color: 'text-purple-400' },
    { label: 'Critical Risks Detected', value: '12', change: 'Prevented in CI', icon: ShieldAlert, color: 'text-rose-400' },
    { label: 'Average Review Time', value: '14s', change: 'Instant feedback', icon: CheckCircle2, color: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-sm text-gray-400 mt-1">Real-time health of your GitHub and Bitbucket pull request reviews.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/repositories"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition shadow-md shadow-indigo-600/30 flex items-center space-x-2"
          >
            <GitFork className="w-4 h-4" />
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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900/40 text-gray-400 text-xs uppercase border-b border-gray-800">
              <tr>
                <th className="px-6 py-3">Repository</th>
                <th className="px-6 py-3">Pull Request</th>
                <th className="px-6 py-3">Provider</th>
                <th className="px-6 py-3">Risk Level</th>
                <th className="px-6 py-3">Findings</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-300">
              <tr className="hover:bg-gray-800/30 transition">
                <td className="px-6 py-4 font-medium text-white">auth-service</td>
                <td className="px-6 py-4">PR #42: Add OAuth refresh token rotation</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300">
                    <span>GitHub</span>
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                    Critical Risk
                  </span>
                </td>
                <td className="px-6 py-4">3 issues</td>
                <td className="px-6 py-4">
                  <span className="text-emerald-400 text-xs font-medium">Completed</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-800/30 transition">
                <td className="px-6 py-4 font-medium text-white">billing-gateway</td>
                <td className="px-6 py-4">PR #15: Update webhook signature verification</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-300">
                    <GitBranch className="w-3 h-3 mr-1" />
                    <span>Bitbucket</span>
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    Low Risk
                  </span>
                </td>
                <td className="px-6 py-4">0 issues</td>
                <td className="px-6 py-4">
                  <span className="text-emerald-400 text-xs font-medium">Completed</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
