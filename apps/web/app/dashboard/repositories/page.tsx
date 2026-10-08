'use client';

import { useState } from 'react';
import { GitFork, GitBranch, Plus, ExternalLink, Settings2, CheckCircle2, Shield, RefreshCw } from 'lucide-react';

export default function RepositoriesPage() {
  const [repos, setRepos] = useState([
    {
      id: '1',
      name: 'core-api',
      fullName: 'acme-corp/core-api',
      provider: 'github',
      defaultBranch: 'main',
      status: 'active',
      strictness: 'balanced',
      lastReviewed: '15 mins ago',
      installationAccount: 'acme-corp (GitHub Org)',
    },
    {
      id: '2',
      name: 'payments-service',
      fullName: 'acme-corp/payments-service',
      provider: 'github',
      defaultBranch: 'main',
      status: 'active',
      strictness: 'strict',
      lastReviewed: '3 hours ago',
      installationAccount: 'acme-corp (GitHub Org)',
    },
    {
      id: '3',
      name: 'mobile-app',
      fullName: 'acme-mobile/ios-android',
      provider: 'bitbucket',
      defaultBranch: 'master',
      status: 'active',
      strictness: 'lenient',
      lastReviewed: '1 day ago',
      installationAccount: 'acme-workspace (Bitbucket)',
    },
  ]);

  const toggleRepoStatus = (id: string) => {
    setRepos((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r
      )
    );
  };

  const updateStrictness = (id: string, strictness: string) => {
    setRepos((prev) =>
      prev.map((r) => (r.id === id ? { ...r, strictness } : r))
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Monitored Repositories</h1>
          <p className="text-sm text-gray-400 mt-1">
            Repositories automatically synced via your GitHub App & Bitbucket Workspace installations.
          </p>
        </div>

        {/* SaaS Integration Action Buttons */}
        <div className="flex items-center space-x-3">
          <a
            href="/api/integrations/github/install"
            className="px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 hover:border-gray-500 text-white text-xs font-semibold flex items-center space-x-2 transition shadow-md"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>+ Install GitHub App</span>
          </a>

          <a
            href="/api/auth/login/bitbucket"
            className="px-4 py-2.5 rounded-xl bg-blue-600/10 border border-blue-500/40 hover:border-blue-400 text-blue-300 text-xs font-semibold flex items-center space-x-2 transition shadow-md"
          >
            <GitBranch className="w-4 h-4 text-blue-400" />
            <span>+ Connect Bitbucket</span>
          </a>
        </div>
      </div>

      {/* Auto-Discovered Repositories List */}
      <div className="glass-panel rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="font-semibold text-white text-sm">Installed Repositories ({repos.length})</h2>
            <span className="text-[11px] text-gray-400">• Zero-config webhook sync enabled</span>
          </div>
          <button className="text-xs text-indigo-400 hover:text-white flex items-center space-x-1">
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            <span>Sync Installations</span>
          </button>
        </div>

        <div className="divide-y divide-gray-800 text-sm">
          {repos.map((repo) => (
            <div key={repo.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-800/20 transition">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-base">{repo.fullName}</span>
                  {repo.provider === 'github' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-800 text-gray-300">GitHub App</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">Bitbucket</span>
                  )}
                  <span className="text-xs text-gray-500">({repo.installationAccount})</span>
                </div>
                <div className="text-xs text-gray-400 flex items-center space-x-4">
                  <span>Default branch: <code className="text-indigo-300">{repo.defaultBranch}</code></span>
                  <span>Last PR review: {repo.lastReviewed}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-4">
                {/* Strictness Policy Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400 font-medium">Policy:</span>
                  <select
                    value={repo.strictness}
                    onChange={(e) => updateStrictness(repo.id, e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="lenient">Lenient (Critical Only)</option>
                    <option value="balanced">Balanced (Recommended)</option>
                    <option value="strict">Strict (High Scrutiny)</option>
                  </select>
                </div>

                {/* Status Toggle Switch */}
                <button
                  onClick={() => toggleRepoStatus(repo.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                    repo.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-gray-800 text-gray-400 border-gray-700'
                  }`}
                >
                  {repo.status === 'active' ? '● Reviewing Active' : '○ Paused'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
