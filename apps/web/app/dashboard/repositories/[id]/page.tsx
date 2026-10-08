'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ExternalLink,
  GitBranch,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Settings2,
  FileCode,
  Zap,
  BarChart3,
  Sliders,
  Play,
  Pause,
  RefreshCw,
  GitPullRequest,
  AlertTriangle,
  ChevronRight,
  Code,
  Layers,
  Save,
  Activity,
} from 'lucide-react';

interface ReviewJob {
  id: string;
  prNumber: number;
  commitSha?: string;
  status: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary?: string;
  findingsCount: number;
  tokensUsed: number;
  createdAt: string;
  pullRequest?: {
    title: string;
    author: string;
    baseBranch: string;
    headBranch: string;
  };
}

interface RepoData {
  id: string;
  name: string;
  provider: 'github' | 'bitbucket';
  providerFullName: string;
  defaultBranch: string;
  language?: string;
  isPrivate: boolean;
  htmlUrl?: string;
  status: string;
  reviewConfig?: {
    auto_review_on_pr?: boolean;
    review_strictness?: 'lenient' | 'balanced' | 'strict';
    ignored_paths?: string[];
    custom_rules?: string[];
    review_language?: string;
  };
  organization?: {
    name: string;
  };
}

export default function RepositoryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const repoId = params.id;

  const [repo, setRepo] = useState<RepoData | null>(null);
  const [jobs, setJobs] = useState<ReviewJob[]>([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    completedReviews: 0,
    highRiskReviews: 0,
    totalFindings: 0,
    totalTokens: 0,
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reviews' | 'config' | 'info'>('reviews');
  const [savingConfig, setSavingConfig] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Editable config state
  const [autoReview, setAutoReview] = useState(true);
  const [strictness, setStrictness] = useState<'lenient' | 'balanced' | 'strict'>('balanced');
  const [ignoredPathsStr, setIgnoredPathsStr] = useState('node_modules/**, *.lock, dist/**');
  const [customRuleInput, setCustomRuleInput] = useState('');
  const [customRules, setCustomRules] = useState<string[]>([]);
  const [reviewLanguage, setReviewLanguage] = useState('en');

  const fetchRepoDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/repositories/${repoId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Repository not found');

      const data = await res.json();
      if (data.success && data.repository) {
        setRepo(data.repository);
        setJobs(data.jobs || []);
        if (data.stats) setStats(data.stats);

        // Populate config state
        const cfg = data.repository.reviewConfig || {};
        setAutoReview(cfg.auto_review_on_pr !== false);
        setStrictness(cfg.review_strictness || 'balanced');
        setReviewLanguage(cfg.review_language || 'en');
        if (Array.isArray(cfg.ignored_paths)) {
          setIgnoredPathsStr(cfg.ignored_paths.join(', '));
        }
        if (Array.isArray(cfg.custom_rules)) {
          setCustomRules(cfg.custom_rules);
        }
      }
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Failed to load repository details' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (repoId) fetchRepoDetails();
  }, [repoId]);

  const handleToggleStatus = async () => {
    if (!repo) return;
    const newStatus = repo.status === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch(`/api/repositories/${repoId}/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include',
      });
      if (res.ok) {
        setRepo({ ...repo, status: newStatus });
        setNotice({
          type: 'success',
          message: `Repository automated review is now ${newStatus === 'active' ? 'resumed' : 'paused'}.`,
        });
      }
    } catch (e: any) {
      setNotice({ type: 'error', message: e.message || 'Failed to update status' });
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setNotice(null);

    const ignoredPaths = ignoredPathsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const reviewConfig = {
      auto_review_on_pr: autoReview,
      review_strictness: strictness,
      ignored_paths: ignoredPaths,
      custom_rules: customRules,
      review_language: reviewLanguage,
    };

    try {
      const res = await fetch(`/api/repositories/${repoId}/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewConfig }),
        credentials: 'include',
      });

      if (res.ok) {
        setNotice({ type: 'success', message: 'Review policies and configuration saved successfully!' });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Could not save configuration' });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleAddRule = () => {
    if (!customRuleInput.trim()) return;
    setCustomRules([...customRules, customRuleInput.trim()]);
    setCustomRuleInput('');
  };

  const handleRemoveRule = (index: number) => {
    setCustomRules(customRules.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-gray-800 rounded"></div>
        <div className="h-24 bg-gray-900 border border-gray-800 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-900 border border-gray-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-white">Repository Not Found</h2>
        <p className="text-sm text-gray-400">The repository requested may have been deleted or disconnected.</p>
        <Link
          href="/dashboard/repositories"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 rounded-xl text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Repositories</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-gray-400">
        <Link href="/dashboard/repositories" className="hover:text-white transition flex items-center space-x-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Repositories</span>
        </Link>
        <span>/</span>
        <span className="text-gray-200 font-semibold">{repo.name}</span>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            notice.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}
        >
          <div className="flex items-center space-x-2">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-gray-400 hover:text-white text-xs ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Header Profile Card */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">{repo.providerFullName}</h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                repo.status === 'active'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-gray-800 border-gray-700 text-gray-400'
              }`}
            >
              {repo.status === 'active' ? '● Reviewing Active' : '○ Paused'}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-800 text-gray-300 uppercase">
              {repo.provider}
            </span>
            {repo.isPrivate && (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                Private
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
              <span>Default: <code>{repo.defaultBranch || 'main'}</code></span>
            </span>
            {repo.language && (
              <span className="flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-purple-400" />
                <span>{repo.language}</span>
              </span>
            )}
            {repo.organization?.name && (
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Workspace: {repo.organization.name}</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleStatus}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition shadow-sm ${
              repo.status === 'active'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
            }`}
          >
            {repo.status === 'active' ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Reviews</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Resume Reviews</span>
              </>
            )}
          </button>

          {repo.htmlUrl && (
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-700 hover:border-gray-500 text-gray-200 text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <span>Open on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
            </a>
          )}
        </div>
      </div>

      {/* KPI Stats & Activity Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Total AI Reviews</span>
            <GitPullRequest className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalReviews}</div>
          <p className="text-[11px] text-gray-500">{stats.completedReviews} automated reviews completed</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>High Risk Issues</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">{stats.highRiskReviews}</div>
          <p className="text-[11px] text-gray-500">Flagged critical & high risk pull requests</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Security & Code Findings</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300">{stats.totalFindings}</div>
          <p className="text-[11px] text-gray-500">Bugs, performance & security hints posted</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Review Strictness</span>
            <Sliders className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-300 capitalize">{strictness}</div>
          <p className="text-[11px] text-gray-500">Auto-review on PR opened is {autoReview ? 'ON' : 'OFF'}</p>
        </div>
      </div>

      {/* Activity Overview Visual Graph */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">Review Activity & Risk Distribution</h2>
          </div>
          <span className="text-[11px] text-gray-500">Live AI telemetry</span>
        </div>

        {jobs.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-500">
            No PR reviews recorded yet for this repository. Create or synchronize a Pull Request on GitHub to trigger AI analysis!
          </div>
        ) : (
          <div className="space-y-3">
            <div className="h-4 bg-gray-900 rounded-full overflow-hidden flex border border-gray-800">
              <div
                style={{
                  width: `${Math.max(10, ((stats.completedReviews - stats.highRiskReviews) / Math.max(1, stats.totalReviews)) * 100)}%`,
                }}
                className="bg-emerald-500 h-full transition-all"
                title="Low Risk / Healthy PRs"
              ></div>
              <div
                style={{
                  width: `${Math.max(5, (stats.highRiskReviews / Math.max(1, stats.totalReviews)) * 100)}%`,
                }}
                className="bg-rose-500 h-full transition-all"
                title="High Risk / Security PRs"
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
              <div className="flex items-center space-x-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Healthy Reviews ({stats.completedReviews - stats.highRiskReviews})</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span>High Risk Flagged ({stats.highRiskReviews})</span>
                </span>
              </div>
              <span>Total Tokens Analyzed: {stats.totalTokens.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-800 text-sm font-semibold gap-6">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 transition flex items-center space-x-2 border-b-2 ${
            activeTab === 'reviews'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <GitPullRequest className="w-4 h-4" />
          <span>Pull Request Reviews ({jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`pb-3 transition flex items-center space-x-2 border-b-2 ${
            activeTab === 'config'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>AI Review Configuration & Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('info')}
          className={`pb-3 transition flex items-center space-x-2 border-b-2 ${
            activeTab === 'info'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Repository Info & Webhooks</span>
        </button>
      </div>

      {/* Tab 1: Pull Request Reviews */}
      {activeTab === 'reviews' && (
        <div className="glass-panel rounded-2xl border border-gray-800 overflow-hidden">
          {jobs.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gray-800 text-gray-400 flex items-center justify-center mx-auto">
                <GitPullRequest className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">No Pull Requests Reviewed Yet</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                PRReviewPilot automatically reviews code whenever a PR is created or new commits are pushed on this repo.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800 text-xs">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/dashboard/reviews/${job.id}`}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-800/30 transition group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-bold text-white text-sm group-hover:text-indigo-400 transition">
                        PR #{job.prNumber} {job.pullRequest?.title ? `— ${job.pullRequest.title}` : ''}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          job.riskLevel === 'critical' || job.riskLevel === 'high'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : job.riskLevel === 'medium'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {job.riskLevel} risk
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-gray-800 text-gray-300">
                        {job.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-gray-400">
                      {job.pullRequest?.author && <span>Author: @{job.pullRequest.author}</span>}
                      {job.commitSha && <span>SHA: <code>{job.commitSha.substring(0, 7)}</code></span>}
                      <span>Findings: <strong className="text-gray-200">{job.findingsCount}</strong></span>
                      <span>Reviewed: {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-indigo-400 font-semibold group-hover:translate-x-1 transition">
                    <span>View Full Review</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: AI Review Configuration */}
      {activeTab === 'config' && (
        <form onSubmit={handleSaveConfig} className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Automated Review Rules & Scrutiny</h3>
            <p className="text-xs text-gray-400">Customize how the AI evaluates and comments on Pull Requests for this repository.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Toggle Auto Review */}
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-white block">Auto Review Pull Requests</label>
                <p className="text-[11px] text-gray-400">Automatically inspect PRs as soon as opened or updated.</p>
              </div>
              <input
                type="checkbox"
                checked={autoReview}
                onChange={(e) => setAutoReview(e.target.checked)}
                className="w-5 h-5 rounded accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Strictness Level */}
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-1.5">
              <label className="text-xs font-semibold text-white block">Review Strictness</label>
              <select
                value={strictness}
                onChange={(e: any) => setStrictness(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="lenient">Lenient — Focus only on critical bugs & security flaws</option>
                <option value="balanced">Balanced (Recommended) — Code health, styling, logic flaws</option>
                <option value="strict">Strict — High scrutiny, design patterns, micro-optimizations</option>
              </select>
            </div>
          </div>

          {/* Ignored Paths */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white block">Ignored Files & Paths (Comma Separated)</label>
            <input
              type="text"
              value={ignoredPathsStr}
              onChange={(e) => setIgnoredPathsStr(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. node_modules/**, *.lock, dist/**, *.min.js"
            />
            <p className="text-[11px] text-gray-500">Matching files will be skipped from the AI review to save tokens and avoid false positives.</p>
          </div>

          {/* Custom Rules */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-white block">Custom Repository Review Guidelines</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customRuleInput}
                onChange={(e) => setCustomRuleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRule();
                  }
                }}
                className="flex-1 px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g. Always check for proper TypeScript types instead of any"
              />
              <button
                type="button"
                onClick={handleAddRule}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition"
              >
                + Add Rule
              </button>
            </div>

            {customRules.length > 0 && (
              <div className="space-y-2 pt-1">
                {customRules.map((rule, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-gray-900/60 border border-gray-800/80 flex items-center justify-between text-xs">
                    <span className="text-gray-300">• {rule}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(idx)}
                      className="text-gray-500 hover:text-rose-400 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingConfig}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center space-x-2 transition"
            >
              <Save className="w-4 h-4" />
              <span>{savingConfig ? 'Saving Changes...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Repository Metadata */}
      {activeTab === 'info' && (
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="text-base font-bold text-white">Repository & Webhook Metadata</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 space-y-1">
              <span className="text-gray-400">Provider Repo ID</span>
              <p className="font-mono text-gray-200">{repo.id}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 space-y-1">
              <span className="text-gray-400">Default Branch</span>
              <p className="font-mono text-gray-200">{repo.defaultBranch || 'main'}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 space-y-1">
              <span className="text-gray-400">Git Provider</span>
              <p className="font-mono text-gray-200 capitalize">{repo.provider}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 space-y-1">
              <span className="text-gray-400">Webhook Status</span>
              <p className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero-Config Webhook Delivery Active</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
