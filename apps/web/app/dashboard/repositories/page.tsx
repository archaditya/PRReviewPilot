'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GitFork, GitBranch, Plus, ExternalLink, Settings2, CheckCircle2, Shield, RefreshCw, ChevronRight, ArrowUpRight } from 'lucide-react';

interface Repo {
  id: string;
  name: string;
  provider: 'github' | 'bitbucket';
  providerFullName: string;
  defaultBranch: string;
  isActive: boolean;
  indexStatus?: string;
  reviewPolicy?: {
    strictness?: string;
  };
}

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [reindexingId, setReindexingId] = useState<string | null>(null);
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

  const handleReindex = async (id: string, repoName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setReindexingId(id);
      setSyncNotice(null);
      const res = await fetch(`/api/repositories/${id}/reindex`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSyncNotice({
          type: 'success',
          message: `Re-indexing triggered for ${repoName}. Neo4j AST extraction started.`,
        });
        await fetchRepos();
      } else {
        setSyncNotice({
          type: 'error',
          message: data.error || 'Failed to trigger re-index.',
        });
      }
    } catch (err: any) {
      setSyncNotice({
        type: 'error',
        message: err.message || 'Network error triggering re-index.',
      });
    } finally {
      setReindexingId(null);
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
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-white">Monitored Repositories</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Repositories automatically synced via your GitHub App & Bitbucket installations for <span className="highlight">deep ast code analysis</span>.
          </p>
        </div>

        {/* Integration Action Buttons */}
        <div className="flex items-center space-x-3">
          <a
            href="/api/integrations/github/install"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-asym text-xs"
            title="Install app or add more repositories to existing installation"
          >
            <span>Add Repos on GitHub</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>

          <a
            href="/api/auth/login/bitbucket"
            className="btn-asym-mirror text-xs"
          >
            <span>Connect Bitbucket</span>
            <GitBranch className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncNotice && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            syncNotice.type === 'success'
              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
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
            className="text-neutral-400 hover:text-white text-xs ml-4 font-mono"
          >
            ✕
          </button>
        </div>
      )}

      {/* Repositories List */}
      <div className="card-chai p-0 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="font-montserrat font-medium text-white text-sm">Installed Repositories ({repos.length})</h2>
            <span className="text-[11px] font-mono text-neutral-500">• Zero-config webhook sync enabled</span>
          </div>
          <button
            onClick={handleSyncInstallations}
            disabled={syncing}
            className={`text-xs px-3 py-1.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 flex items-center space-x-1.5 transition-colors ${
              syncing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing Repos...' : 'Sync Installations'}</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm font-mono text-neutral-500">Loading installed repositories...</div>
        ) : repos.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 text-neutral-400 flex items-center justify-center mx-auto border border-white/10">
              <GitFork className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="font-montserrat text-base font-medium text-white">No Repositories Connected</h3>
              <p className="mt-1 text-xs text-neutral-400">
                Install the PRReviewPilot GitHub App or link your Bitbucket account to grant access to repositories for automated PR reviews.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleSyncInstallations}
                disabled={syncing}
                className="btn-asym text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>Sync from GitHub</span>
              </button>
              <a
                href="/api/auth/login/bitbucket"
                className="btn-asym-mirror text-xs"
              >
                Connect Bitbucket
              </a>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/5 text-sm">
            {repos.map((repo) => (
              <div key={repo.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors group">
                <Link href={`/dashboard/repositories/${repo.id}`} className="space-y-1 flex-1 cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-medium text-white text-base group-hover:text-neutral-200 transition-colors">{repo.providerFullName || repo.name}</span>
                    {repo.provider === 'github' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-white/10 bg-white/5 text-neutral-400">GitHub App</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-blue-500/20 bg-blue-500/5 text-blue-400">Bitbucket</span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-400 flex items-center space-x-4">
                    <span>Default branch: <code className="text-neutral-300 font-mono">{repo.defaultBranch || 'main'}</code></span>
                    <span className="text-neutral-400 text-[11px] group-hover:text-white flex items-center gap-1 transition-colors">
                      <span>View details, telemetry & rules</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>

                {/* Controls */}
                <div className="flex items-center space-x-4">
                  {/* Strictness Policy Selector */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-neutral-400 font-medium">Policy:</span>
                    <select
                      value={repo.reviewPolicy?.strictness || 'balanced'}
                      onChange={(e) => updateStrictness(repo.id, e.target.value)}
                      className="px-2.5 py-1 rounded-md bg-neutral-900 border border-white/10 text-xs text-neutral-200 focus:outline-none focus:border-white/30"
                    >
                      <option value="lenient">Lenient (Critical Only)</option>
                      <option value="balanced">Balanced (Recommended)</option>
                      <option value="strict">Strict (High Scrutiny)</option>
                    </select>
                  </div>

                  {/* Re-index Graph Button */}
                  <button
                    onClick={(e) => handleReindex(repo.id, repo.providerFullName || repo.name, e)}
                    disabled={reindexingId === repo.id}
                    className="px-2.5 py-1 rounded-md text-xs font-mono border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                    title="Re-index Code Knowledge Graph in Neo4j"
                  >
                    <RefreshCw className={`w-3 h-3 ${reindexingId === repo.id ? 'animate-spin text-orange-400' : 'text-neutral-400'}`} />
                    <span>{reindexingId === repo.id ? 'Indexing...' : 'Re-index'}</span>
                  </button>

                  {/* Status Toggle Switch */}
                  <button
                    onClick={() => toggleRepoStatus(repo.id, repo.isActive)}
                    className={`px-3 py-1 rounded-full text-xs font-mono border transition-colors ${
                      repo.isActive !== false
                        ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20'
                        : 'bg-white/5 text-neutral-400 border-white/10'
                    }`}
                  >
                    {repo.isActive !== false ? '● Active' : '○ Paused'}
                  </button>

                  <Link
                    href={`/dashboard/repositories/${repo.id}`}
                    className="p-1.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
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
