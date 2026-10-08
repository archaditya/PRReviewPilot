'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GitFork, GitBranch, Plus, ExternalLink, Settings2, CheckCircle2, Shield, RefreshCw, ChevronRight } from 'lucide-react';

interface Repo {
  id: string;
  name: string;
  provider: 'github' | 'bitbucket';
  providerFullName: string;
  defaultBranch: string;
  isActive: boolean;
  reviewPolicy?: {
    strictness?: string;
  };
}

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchRepos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/repositories', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.repositories)) {
          setRepos(data.repositories);
        }
      }
    } catch (err) {
      console.error('Failed to load repositories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncInstallations = async () => {
    try {
      setSyncing(true);
      setSyncNotice(null);
      const res = await fetch('/api/integrations/github/sync', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSyncNotice({
          type: 'success',
          message: data.message || `Successfully synced ${data.count || 0} repositories from GitHub!`,
        });
        await fetchRepos();
      } else {
        setSyncNotice({
          type: 'error',
          message: data.error || 'Failed to sync repositories from GitHub App.',
        });
      }
    } catch (err: any) {
      setSyncNotice({
        type: 'error',
        message: err.message || 'Network error while syncing repositories.',
      });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchRepos();

    // Check if redirected from GitHub App setup
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('installed') === 'true') {
        handleSyncInstallations();
      }
    }
  }, []);

  const toggleRepoStatus = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/repositories/${id}/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
        credentials: 'include',
      });
      if (res.ok) {
        setRepos((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isActive: !currentActive } : r))
        );
      }
    } catch (e) {
      console.error('Failed to toggle repo status:', e);
    }
  };

  const updateStrictness = async (id: string, strictness: string) => {
    try {
      const res = await fetch(`/api/repositories/${id}/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewPolicy: { strictness } }),
        credentials: 'include',
      });
      if (res.ok) {
        setRepos((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, reviewPolicy: { ...r.reviewPolicy, strictness } } : r
          )
        );
      }
    } catch (e) {
      console.error('Failed to update strictness:', e);
    }
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

        {/* Integration Action Buttons */}
        <div className="flex items-center space-x-3">
          <a
            href="/api/integrations/github/install"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 hover:border-gray-500 text-white text-xs font-semibold flex items-center space-x-2 transition shadow-md"
            title="Install app or add more repositories to existing installation"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>+ Add / Manage Repos on GitHub</span>
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

      {/* Sync Status Banner */}
      {syncNotice && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            syncNotice.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}
        >
          <div className="flex items-center space-x-2">
            {syncNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <Shield className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span>{syncNotice.message}</span>
          </div>
          <button
            onClick={() => setSyncNotice(null)}
            className="text-gray-400 hover:text-white text-xs ml-4 font-mono"
          >
            ✕
          </button>
        </div>
      )}

      {/* Repositories List */}
      <div className="glass-panel rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="font-semibold text-white text-sm">Installed Repositories ({repos.length})</h2>
            <span className="text-[11px] text-gray-400">• Zero-config webhook sync enabled</span>
          </div>
          <button
            onClick={handleSyncInstallations}
            disabled={syncing}
            className={`text-xs px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 flex items-center space-x-1.5 transition ${
              syncing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing Repos...' : 'Sync Installations'}</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-gray-400">Loading installed repositories...</div>
        ) : repos.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
              <GitFork className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-semibold text-white">No Repositories Connected</h3>
              <p className="mt-1 text-xs text-gray-400">
                Install the PRReviewPilot GitHub App or link your Bitbucket account to grant access to repositories you want automated reviews on.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleSyncInstallations}
                disabled={syncing}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition flex items-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Syncing...' : 'Sync Now from GitHub'}</span>
              </button>
              <a
                href="/api/integrations/github/install"
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition"
              >
                + Add / Manage on GitHub
              </a>
              <a
                href="/api/auth/login/bitbucket"
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition"
              >
                Connect Bitbucket
              </a>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-800 text-sm">
            {repos.map((repo) => (
              <div key={repo.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-800/20 transition group">
                <Link href={`/dashboard/repositories/${repo.id}`} className="space-y-1 flex-1 cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-base group-hover:text-indigo-400 transition">{repo.providerFullName || repo.name}</span>
                    {repo.provider === 'github' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-800 text-gray-300">GitHub App</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">Bitbucket</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center space-x-4">
                    <span>Default branch: <code className="text-indigo-300">{repo.defaultBranch || 'main'}</code></span>
                    <span className="text-indigo-400 text-[11px] group-hover:underline flex items-center gap-1">
                      <span>View details, telemetry & rules</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>

                {/* Controls */}
                <div className="flex items-center space-x-4">
                  {/* Strictness Policy Selector */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400 font-medium">Policy:</span>
                    <select
                      value={repo.reviewPolicy?.strictness || 'balanced'}
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
                    onClick={() => toggleRepoStatus(repo.id, repo.isActive)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                      repo.isActive !== false
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-gray-800 text-gray-400 border-gray-700'
                    }`}
                  >
                    {repo.isActive !== false ? '● Reviewing Active' : '○ Paused'}
                  </button>

                  <Link
                    href={`/dashboard/repositories/${repo.id}`}
                    className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition"
                    title="Open Repository Analytics & Config"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
