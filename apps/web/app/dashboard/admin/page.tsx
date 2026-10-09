'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Ban,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  Eye,
  Flame,
  FolderGit2,
  GitBranch,
  GitCommit,
  GitFork,
  HardDrive,
  Key,
  Layers,
  Lock,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  Server,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  Wifi,
  X,
  XCircle,
  Zap,
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalRepos: number;
  totalReviews: number;
  totalTokens: number;
  totalCostUsd: number;
  avgDurationMs: number;
}

interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latencyMs?: number;
  message?: string;
  error?: string;
  nodeCount?: number;
  model?: string;
}

interface HealthData {
  postgres?: ServiceHealth;
  redis?: ServiceHealth;
  neo4j?: ServiceHealth;
  aiService?: ServiceHealth;
  indexerService?: ServiceHealth;
}

interface ProcessInfo {
  uptimeSeconds: number;
  nodeVersion: string;
  platform: string;
  heapUsedMb: string;
  rssMb: string;
  environment: string;
}

interface SystemConfig {
  app: { name: string; environment: string; appUrl: string; apiUrl: string };
  github: {
    appId: string;
    slug: string;
    clientId: string;
    hasClientSecret: boolean;
    hasWebhookSecret: boolean;
    hasPrivateKey: boolean;
    privateKeyLength: number;
  };
  bitbucket: {
    clientId: string;
    redirectUri: string;
    hasClientSecret: boolean;
  };
  aiService: {
    url: string;
    model: string;
    hasApiKey: boolean;
    timeoutMs: number;
  };
  graph: {
    neo4jUri: string;
    neo4jUser: string;
    indexerServiceUrl: string;
  };
}

interface ReviewJobItem {
  id: string;
  repositoryId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  trigger: string;
  tokensUsed: number;
  durationMs: number;
  estimatedCostUsd: number;
  error?: string;
  createdAt: string;
  repository?: { id: string; name: string; providerFullName: string };
  pullRequest?: { id: string; prNumber?: number; number?: number; title: string; headBranch?: string; baseBranch?: string };
}

interface RepoIndexItem {
  id: string;
  name: string;
  providerFullName: string;
  indexStatus: 'INDEXED' | 'INDEXING' | 'FAILED' | 'NOT_INDEXED';
  indexedCommitSha?: string;
  indexedAt?: string;
  fileCount: number;
  symbolCount: number;
  indexError?: string;
  updatedAt: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'user';
  status: 'active' | 'suspended' | 'blocked' | 'deactivated';
  githubUsername?: string;
  githubUserId?: string;
  bitbucketUsername?: string;
  avatarUrl?: string;
  usage?: { review_count?: number; total_tokens?: number; cost_usd?: number };
  createdAt: string;
  lastLoginAt?: string;
  ownedOrganizations?: Array<{ id: string; name: string; features?: { max_reviews_per_month?: number } }>;
}

interface UserDetailedData {
  user: AdminUser;
  installations: Array<{
    id: string;
    provider: string;
    providerInstallationId: string;
    accountLogin: string;
    accountType: string;
    status: string;
    createdAt: string;
  }>;
  repositories: Array<{
    id: string;
    name: string;
    providerFullName: string;
    provider: string;
    defaultBranch: string;
    isActive: boolean;
    indexStatus: 'INDEXED' | 'INDEXING' | 'FAILED' | 'NOT_INDEXED';
    fileCount: number;
    symbolCount: number;
    indexedAt?: string;
    indexError?: string;
    createdAt: string;
  }>;
  pullRequests: Array<{
    id: string;
    repositoryId: string;
    prNumber: number;
    title: string;
    headBranch: string;
    baseBranch: string;
    status: string;
    createdAt: string;
  }>;
  reviewJobs: Array<{
    id: string;
    repositoryId: string;
    status: string;
    trigger: string;
    tokensUsed: number;
    estimatedCostUsd: number;
    durationMs: number;
    error?: string;
    createdAt: string;
  }>;
}

type TabType = 'overview' | 'monitoring' | 'jobs' | 'config' | 'users' | 'controls';
type UserDetailSubTab = 'overview' | 'repos' | 'prs' | 'restrictions' | 'danger';

function AdminConsoleInner() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabType;

  const [activeTab, setActiveTab] = useState<TabType>('monitoring');

  useEffect(() => {
    if (tabParam && ['monitoring', 'jobs', 'config', 'users', 'controls'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [processInfo, setProcessInfo] = useState<ProcessInfo | null>(null);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [reviewJobs, setReviewJobs] = useState<ReviewJobItem[]>([]);
  const [repoIndexing, setRepoIndexing] = useState<RepoIndexItem[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser | null>(null);

  // Sub-states & modals
  const [searchQuery, setSearchQuery] = useState('');
  const [testingService, setTestingService] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ service: string; success: boolean; message: string } | null>(null);
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);
  const [selectedUserForQuota, setSelectedUserForQuota] = useState<AdminUser | null>(null);
  const [newQuota, setNewQuota] = useState(100);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // User Detailed View Inspector State
  const [inspectingUser, setInspectingUser] = useState<AdminUser | null>(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetailedData | null>(null);
  const [detailSubTab, setDetailSubTab] = useState<UserDetailSubTab>('overview');
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const [deletingUser, setDeletingUser] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Fetch all initial admin data
  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, healthRes, configRes, jobsRes, usersRes, meRes] = await Promise.all([
        fetch('/api/admin/stats', { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)),
        fetch('/api/admin/health', { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)),
        fetch('/api/admin/config', { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)),
        fetch('/api/admin/jobs', { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)),
        fetch('/api/admin/users', { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)),
        fetch('/api/auth/me', { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)),
      ]);

      if (statsRes?.success) setStats(statsRes.stats);
      if (healthRes?.success) {
        setHealth(healthRes.health);
        setProcessInfo(healthRes.process);
      }
      if (configRes?.success) setConfig(configRes.config);
      if (jobsRes?.success) {
        setReviewJobs(jobsRes.reviewJobs || []);
        setRepoIndexing(jobsRes.repoIndexing || []);
      }
      if (usersRes?.success) setUsers(usersRes.users || []);
      if (meRes?.success && meRes.user) setCurrentAdminUser(meRes.user);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const showNotice = (type: 'success' | 'error', text: string) => {
    setActionNotice({ type, text });
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Inspect User Details Drawer
  const handleInspectUser = async (user: AdminUser) => {
    setInspectingUser(user);
    setUserDetailsLoading(true);
    setUserDetails(null);
    setDetailSubTab('overview');
    setDeleteConfirmEmail('');
    try {
      const res = await fetch(`/api/admin/users/${user.id}/details`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setUserDetails(data);
      } else {
        showNotice('error', data.error || 'Failed to load user details');
      }
    } catch (err: any) {
      showNotice('error', err.message);
    } finally {
      setUserDetailsLoading(false);
    }
  };

  // Service Connection Test
  const handleTestService = async (service: 'github' | 'neo4j' | 'redis' | 'ai' | 'indexer') => {
    setTestingService(service);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/system/test-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ service, success: true, message: `[${data.latencyMs}ms] ${data.message}` });
        showNotice('success', `Test passed for ${service}: ${data.message}`);
      } else {
        setTestResult({ service, success: false, message: data.error || 'Connection failed' });
        showNotice('error', `Test failed for ${service}: ${data.error}`);
      }
    } catch (err: any) {
      setTestResult({ service, success: false, message: err.message });
      showNotice('error', err.message);
    } finally {
      setTestingService(null);
    }
  };

  // Retry a review job
  const handleRetryJob = async (jobId: string) => {
    setRetryingJobId(jobId);
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/retry`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        showNotice('success', `Job ${jobId.substring(0, 8)} queued for retry`);
        setReviewJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, status: 'pending', error: undefined } : j))
        );
      } else {
        showNotice('error', data.error || 'Retry failed');
      }
    } catch (err: any) {
      showNotice('error', err.message);
    } finally {
      setRetryingJobId(null);
    }
  };

  // User status toggle / killswitch
  const handleSetUserStatus = async (userId: string, newStatus: 'active' | 'suspended' | 'blocked') => {
    setActionInProgress(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
        if (inspectingUser && inspectingUser.id === userId) {
          setInspectingUser({ ...inspectingUser, status: newStatus });
        }
        if (userDetails && userDetails.user.id === userId) {
          setUserDetails({ ...userDetails, user: { ...userDetails.user, status: newStatus } });
        }
        showNotice('success', `User account status updated to ${newStatus.toUpperCase()}`);
      } else {
        showNotice('error', data.error || 'Failed to update user status');
      }
    } catch (err: any) {
      showNotice('error', err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  // User role change
  const handleChangeRole = async (user: AdminUser, newRole: 'user' | 'admin' | 'superadmin') => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
        if (inspectingUser && inspectingUser.id === user.id) {
          setInspectingUser({ ...inspectingUser, role: newRole });
        }
        showNotice('success', `Role for ${user.email} updated to ${newRole}`);
      } else {
        showNotice('error', data.error || 'Failed to update role');
      }
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  // Delete User with edge cases and safety checks
  const handleDeleteUser = async () => {
    if (!inspectingUser) return;
    if (deleteConfirmEmail.trim().toLowerCase() !== inspectingUser.email.toLowerCase()) {
      showNotice('error', 'Confirmation email does not match.');
      return;
    }

    setDeletingUser(true);
    try {
      const res = await fetch(`/api/admin/users/${inspectingUser.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        showNotice('success', data.message || `User ${inspectingUser.email} has been permanently deleted.`);
        setUsers((prev) => prev.filter((u) => u.id !== inspectingUser.id));
        setInspectingUser(null);
        setUserDetails(null);
        setDeleteConfirmEmail('');
      } else {
        showNotice('error', data.error || 'Failed to delete user');
      }
    } catch (err: any) {
      showNotice('error', err.message);
    } finally {
      setDeletingUser(false);
    }
  };

  // Password reset
  const handleSavePassword = async () => {
    if (!selectedUserForPassword || !newPassword) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedUserForPassword.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        showNotice('success', `Password successfully updated for ${selectedUserForPassword.email}`);
        setSelectedUserForPassword(null);
        setNewPassword('');
      } else {
        showNotice('error', data.error || 'Failed to update password');
      }
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  // Quota update
  const handleSaveQuota = async () => {
    if (!selectedUserForQuota) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedUserForQuota.id}/quota`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxReviewsPerMonth: newQuota }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        showNotice('success', `Quota updated to ${newQuota} for ${selectedUserForQuota.email}`);
        setSelectedUserForQuota(null);
        // Refresh detail view if inspecting
        if (userDetails && userDetails.user.id === selectedUserForQuota.id) {
          handleInspectUser(selectedUserForQuota);
        }
      } else {
        showNotice('error', data.error || 'Failed to update quota');
      }
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  // Trigger Reindex on user repo from detail drawer
  const handleTriggerRepoReindex = async (repoId: string) => {
    try {
      const res = await fetch(`/api/repositories/${repoId}/reindex`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        showNotice('success', 'Repository indexing triggered directly');
        if (userDetails) {
          setUserDetails({
            ...userDetails,
            repositories: userDetails.repositories.map((r) =>
              r.id === repoId ? { ...r, indexStatus: 'INDEXING' } : r
            ),
          });
        }
      } else {
        showNotice('error', data.error || 'Failed to trigger indexing');
      }
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  // Reset stuck index state on user repo
  const handleResetRepoIndex = async (repoId: string) => {
    try {
      const res = await fetch(`/api/repositories/${repoId}/reset-index`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        showNotice('success', 'Repository index status reset to NOT_INDEXED');
        if (userDetails) {
          setUserDetails({
            ...userDetails,
            repositories: userDetails.repositories.map((r) =>
              r.id === repoId ? { ...r, indexStatus: 'NOT_INDEXED', indexError: undefined } : r
            ),
          });
        }
      } else {
        showNotice('error', data.error || 'Failed to reset index');
      }
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  // Flush cache
  const handleFlushCache = async () => {
    if (!confirm('Flush all keys from Redis cache?')) return;
    try {
      const res = await fetch('/api/admin/system/cache-flush', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        showNotice('success', 'Redis cache flushed successfully');
      } else {
        showNotice('error', data.error || 'Failed to flush cache');
      }
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* ── Executive Header Banner ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-white/10 bg-[#0c0e12] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-[#F6821F]/10 via-transparent to-transparent pointer-events-none" />
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-[#F6821F]/15 border border-[#F6821F]/30 flex items-center justify-center text-[#F6821F]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">
              System Admin & Observability Console
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
              SUPERADMIN PRIVILEGED
            </span>
          </div>
          <p className="text-xs text-neutral-400 max-w-2xl">
            Centralized orchestration hub for system health, Neo4j AST knowledge graph, AI inference tokens, background queues, and user access policies.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 z-10">
          <button
            onClick={loadAllAdminData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-400' : ''}`} />
            <span>Refresh State</span>
          </button>
          <button
            onClick={handleFlushCache}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-colors"
            title="Flush Redis cache keys"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Flush Cache</span>
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
            actionNotice.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span className="font-mono">{actionNotice.text}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-neutral-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Top-Level Navigation Tabs ── */}
      <div className="flex items-center gap-1.5 border-b border-white/10 pb-2 overflow-x-auto">
        {[
          { id: 'monitoring', label: 'Infrastructure & Health', icon: Activity },
          { id: 'jobs', label: 'Background Jobs & Queues', icon: Layers },
          { id: 'config', label: 'System Setup & Config', icon: Settings },
          { id: 'users', label: 'User & Access Controls', icon: Users },
          { id: 'controls', label: 'System Diagnostics & Tools', icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#F6821F]/15 text-[#F6821F] border border-[#F6821F]/30 shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ──────────────── TAB 1: INFRASTRUCTURE & HEALTH ──────────────── */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Registered Users', val: stats.totalUsers, icon: Users, color: 'text-sky-400' },
                { label: 'Connected Repos', val: stats.totalRepos, icon: GitFork, color: 'text-amber-400' },
                { label: 'PR Reviews Done', val: stats.totalReviews, icon: Layers, color: 'text-purple-400' },
                { label: 'Tokens Consumed', val: `${(stats.totalTokens / 1000).toFixed(1)}k`, icon: Flame, color: 'text-rose-400' },
                { label: 'Est. OpenAI Cost', val: `$${stats.totalCostUsd}`, icon: Zap, color: 'text-emerald-400' },
                { label: 'Avg Duration', val: `${Math.round(stats.avgDurationMs / 1000)}s`, icon: Clock, color: 'text-neutral-300' },
              ].map((m, i) => {
                const Icon = m.icon;
                return (
                  <div key={i} className="p-4 rounded-xl border border-white/10 bg-[#0c0e12] space-y-2">
                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="text-[10px] font-mono uppercase">{m.label}</span>
                      <Icon className={`w-3.5 h-3.5 ${m.color}`} />
                    </div>
                    <div className="text-xl font-bold font-mono text-white">{m.val}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Microservices Live Status Grid */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold font-mono text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-[#F6821F]" />
              <span>Containerized Services Live Health</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* PostgreSQL */}
              <div className="p-5 rounded-xl border border-white/10 bg-[#0c0e12] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Database className="w-4 h-4 text-sky-400" />
                    <span className="font-mono text-xs font-semibold text-white">PostgreSQL (16-Alpine)</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                      health?.postgres?.status === 'healthy'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {health?.postgres?.status || 'Unknown'}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-mono">
                  {health?.postgres?.message || health?.postgres?.error || 'Checking status...'}
                </p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                  <span>Latency: {health?.postgres?.latencyMs ?? 0}ms</span>
                  <span>Port 5432</span>
                </div>
              </div>

              {/* Neo4j */}
              <div className="p-5 rounded-xl border border-white/10 bg-[#0c0e12] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <HardDrive className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono text-xs font-semibold text-white">Neo4j Graph Database</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                      health?.neo4j?.status === 'healthy'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {health?.neo4j?.status || 'Unknown'}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-mono">
                  {health?.neo4j?.message || health?.neo4j?.error || 'Checking Bolt connection...'}
                </p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                  <span>Latency: {health?.neo4j?.latencyMs ?? 0}ms</span>
                  <span>Bolt :7687</span>
                </div>
              </div>

              {/* Redis */}
              <div className="p-5 rounded-xl border border-white/10 bg-[#0c0e12] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Wifi className="w-4 h-4 text-rose-400" />
                    <span className="font-mono text-xs font-semibold text-white">Redis (Key-Value & Cache)</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                      health?.redis?.status === 'healthy'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {health?.redis?.status || 'Unknown'}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-mono">
                  {health?.redis?.message || health?.redis?.error || 'Checking ping...'}
                </p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                  <span>Latency: {health?.redis?.latencyMs ?? 0}ms</span>
                  <span>Port 6379</span>
                </div>
              </div>

              {/* AI Microservice */}
              <div className="p-5 rounded-xl border border-white/10 bg-[#0c0e12] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Cpu className="w-4 h-4 text-amber-400" />
                    <span className="font-mono text-xs font-semibold text-white">AI Inference Service</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                      health?.aiService?.status === 'healthy'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {health?.aiService?.status || 'Unknown'}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-mono">
                  Model: {health?.aiService?.model || 'gpt-4o-mini'} • {health?.aiService?.message || 'Checking /health'}
                </p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                  <span>Latency: {health?.aiService?.latencyMs ?? 0}ms</span>
                  <span>Port 8001</span>
                </div>
              </div>

              {/* Tree-sitter Indexer */}
              <div className="p-5 rounded-xl border border-white/10 bg-[#0c0e12] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Terminal className="w-4 h-4 text-teal-400" />
                    <span className="font-mono text-xs font-semibold text-white">Tree-sitter AST Indexer</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                      health?.indexerService?.status === 'healthy'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {health?.indexerService?.status || 'Unknown'}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-mono">
                  AST parsers: TS, JS, Py, Go • {health?.indexerService?.message || 'Checking /health'}
                </p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                  <span>Latency: {health?.indexerService?.latencyMs ?? 0}ms</span>
                  <span>Port 8001</span>
                </div>
              </div>

              {/* Node.js API Host */}
              <div className="p-5 rounded-xl border border-white/10 bg-[#0c0e12] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <span className="font-mono text-xs font-semibold text-white">Node.js API Runtime</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    ONLINE
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-mono">
                  Uptime: {processInfo ? `${Math.floor(processInfo.uptimeSeconds / 3600)}h ${Math.floor((processInfo.uptimeSeconds % 3600) / 60)}m` : '...'} • Node {processInfo?.nodeVersion || 'v20'}
                </p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                  <span>Heap: {processInfo?.heapUsedMb ?? 0}MB</span>
                  <span>RSS: {processInfo?.rssMb ?? 0}MB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 2: BACKGROUND JOBS & QUEUES ──────────────── */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          {/* PR Review Jobs Section */}
          <div className="p-6 rounded-2xl border border-white/10 bg-[#0c0e12] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold font-mono text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#F6821F]" />
                  <span>PR Review Pipeline Execution Audit</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Live state of all AI PR review executions across organizations.
                </p>
              </div>
              <span className="font-mono text-xs text-neutral-400 px-2.5 py-1 rounded bg-white/5 border border-white/10">
                {reviewJobs.length} Recent Jobs
              </span>
            </div>

            {reviewJobs.length === 0 ? (
              <div className="py-12 text-center text-xs font-mono text-neutral-500">
                No review jobs executed yet. Trigger a PR or open a pull request to test the pipeline.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-neutral-400 text-[11px]">
                      <th className="py-2.5 px-3">Job ID</th>
                      <th className="py-2.5 px-3">Repository</th>
                      <th className="py-2.5 px-3">PR Details</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Tokens</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {reviewJobs.map((j) => (
                      <tr key={j.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3 text-neutral-300 font-semibold">
                          {j.id.substring(0, 8)}...
                        </td>
                        <td className="py-3 px-3 text-white">
                          {j.repository?.providerFullName || j.repository?.name || 'Unknown'}
                        </td>
                        <td className="py-3 px-3 text-neutral-300">
                          {j.pullRequest ? (
                            <span>
                              #{j.pullRequest.prNumber || j.pullRequest.number}: {j.pullRequest.title?.substring(0, 25)}...
                            </span>
                          ) : (
                            <span className="text-neutral-500">Direct execution</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              j.status === 'completed'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : j.status === 'running'
                                ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 animate-pulse'
                                : j.status === 'failed'
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                : 'bg-neutral-500/15 text-neutral-400 border border-neutral-500/30'
                            }`}
                          >
                            {j.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-neutral-400">
                          {j.durationMs ? `${(j.durationMs / 1000).toFixed(1)}s` : '—'}
                        </td>
                        <td className="py-3 px-3 text-neutral-400">{j.tokensUsed || 0}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleRetryJob(j.id)}
                            disabled={retryingJobId === j.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-white/10 hover:border-orange-500/40 bg-white/5 hover:bg-orange-500/10 text-neutral-300 hover:text-orange-400 transition-colors disabled:opacity-50"
                            title="Retry review job"
                          >
                            <RotateCcw className={`w-3 h-3 ${retryingJobId === j.id ? 'animate-spin' : ''}`} />
                            <span>Retry</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Repository AST Index Jobs Section */}
          <div className="p-6 rounded-2xl border border-white/10 bg-[#0c0e12] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold font-mono text-white flex items-center gap-2">
                  <GitCommit className="w-4 h-4 text-[#F6821F]" />
                  <span>Repository AST Knowledge Graph Indexing Status</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Inspect repositories parsed into Neo4j with Tree-sitter symbol extractors.
                </p>
              </div>
              <span className="font-mono text-xs text-neutral-400 px-2.5 py-1 rounded bg-white/5 border border-white/10">
                {repoIndexing.length} Repositories
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400 text-[11px]">
                    <th className="py-2.5 px-3">Repository</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Files</th>
                    <th className="py-2.5 px-3">AST Symbols</th>
                    <th className="py-2.5 px-3">Commit SHA</th>
                    <th className="py-2.5 px-3">Error Log</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {repoIndexing.map((r) => (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 text-white font-medium">
                        {r.providerFullName || r.name}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            r.indexStatus === 'INDEXED'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : r.indexStatus === 'INDEXING'
                              ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 animate-pulse'
                              : r.indexStatus === 'FAILED'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-neutral-500/15 text-neutral-400 border border-neutral-500/30'
                          }`}
                        >
                          {r.indexStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-neutral-300">{r.fileCount ?? 0}</td>
                      <td className="py-3 px-3 text-neutral-300">{r.symbolCount ?? 0}</td>
                      <td className="py-3 px-3 text-neutral-400">
                        {r.indexedCommitSha ? r.indexedCommitSha.substring(0, 7) : 'None'}
                      </td>
                      <td className="py-3 px-3 text-red-300 max-w-xs truncate" title={r.indexError}>
                        {r.indexError || <span className="text-neutral-500 font-normal">None</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 3: SYSTEM SETUP & CONFIG ──────────────── */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* GitHub App Setup */}
            <div className="p-6 rounded-2xl border border-white/10 bg-[#0c0e12] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-orange-400" />
                  <h3 className="font-mono text-sm font-semibold text-white">GitHub App Integration</h3>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                    config?.github?.hasPrivateKey
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {config?.github?.hasPrivateKey ? 'Private Key Loaded' : 'Key Missing'}
                </span>
              </div>
              <div className="space-y-2 text-xs font-mono text-neutral-400">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>App ID</span>
                  <span className="text-white">{config?.github?.appId || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>App Slug</span>
                  <span className="text-white">{config?.github?.slug || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>Client ID</span>
                  <span className="text-white">{config?.github?.clientId || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>Webhook Secret</span>
                  <span className={config?.github?.hasWebhookSecret ? 'text-emerald-400' : 'text-red-400'}>
                    {config?.github?.hasWebhookSecret ? 'Active' : 'Missing'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Private Key Bytes</span>
                  <span className="text-neutral-300">{config?.github?.privateKeyLength ?? 0} chars</span>
                </div>
              </div>

              <button
                onClick={() => handleTestService('github')}
                disabled={testingService === 'github'}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-medium border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 transition-colors"
              >
                <Zap className={`w-3.5 h-3.5 ${testingService === 'github' ? 'animate-spin' : ''}`} />
                <span>Test GitHub App Authenticated Handshake</span>
              </button>
            </div>

            {/* AI Inference Model Setup */}
            <div className="p-6 rounded-2xl border border-white/10 bg-[#0c0e12] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <h3 className="font-mono text-sm font-semibold text-white">AI Reasoning Model & Engine</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {config?.aiService?.model || 'gpt-4o-mini'}
                </span>
              </div>
              <div className="space-y-2 text-xs font-mono text-neutral-400">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>Service Endpoint</span>
                  <span className="text-white">{config?.aiService?.url || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>Default Model</span>
                  <span className="text-white">{config?.aiService?.model || 'gpt-4o-mini'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>Internal API Key</span>
                  <span className={config?.aiService?.hasApiKey ? 'text-emerald-400' : 'text-red-400'}>
                    {config?.aiService?.hasApiKey ? 'Configured' : 'Missing'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Inference Timeout</span>
                  <span className="text-neutral-300">{(config?.aiService?.timeoutMs ?? 120000) / 1000}s</span>
                </div>
              </div>

              <button
                onClick={() => handleTestService('ai')}
                disabled={testingService === 'ai'}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-medium border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 transition-colors"
              >
                <Zap className={`w-3.5 h-3.5 ${testingService === 'ai' ? 'animate-spin' : ''}`} />
                <span>Ping AI Service Healthcheck</span>
              </button>
            </div>

            {/* Neo4j Graph DB Config */}
            <div className="p-6 rounded-2xl border border-white/10 bg-[#0c0e12] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-mono text-sm font-semibold text-white">Neo4j Bolt Protocol</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Bolt 7687
                </span>
              </div>
              <div className="space-y-2 text-xs font-mono text-neutral-400">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>URI</span>
                  <span className="text-white">{config?.graph?.neo4jUri || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>User</span>
                  <span className="text-white">{config?.graph?.neo4jUser || 'neo4j'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Tree-sitter Indexer URL</span>
                  <span className="text-white">{config?.graph?.indexerServiceUrl || '—'}</span>
                </div>
              </div>

              <button
                onClick={() => handleTestService('neo4j')}
                disabled={testingService === 'neo4j'}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-medium border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-colors"
              >
                <Zap className={`w-3.5 h-3.5 ${testingService === 'neo4j' ? 'animate-spin' : ''}`} />
                <span>Test Neo4j Cypher Handshake</span>
              </button>
            </div>

            {/* Bitbucket OAuth Setup */}
            <div className="p-6 rounded-2xl border border-white/10 bg-[#0c0e12] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-blue-400" />
                  <h3 className="font-mono text-sm font-semibold text-white">Bitbucket Integration</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-neutral-500/15 text-neutral-400 border border-neutral-500/30">
                  OAuth 2.0
                </span>
              </div>
              <div className="space-y-2 text-xs font-mono text-neutral-400">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>Client ID</span>
                  <span className="text-white">{config?.bitbucket?.clientId || 'Not configured'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>Client Secret</span>
                  <span className={config?.bitbucket?.hasClientSecret ? 'text-emerald-400' : 'text-neutral-500'}>
                    {config?.bitbucket?.hasClientSecret ? 'Configured' : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Redirect URI</span>
                  <span className="text-white truncate max-w-[200px]" title={config?.bitbucket?.redirectUri}>
                    {config?.bitbucket?.redirectUri || '—'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleTestService('redis')}
                disabled={testingService === 'redis'}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-medium border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors"
              >
                <Zap className={`w-3.5 h-3.5 ${testingService === 'redis' ? 'animate-spin' : ''}`} />
                <span>Ping Redis In-Memory Store</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 4: USER & ACCESS CONTROLS ──────────────── */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl border border-white/10 bg-[#0c0e12] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold font-mono text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#F6821F]" />
                  <span>Platform Identity & Access Control Directory</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Click any user to inspect connected repositories, pull requests, usage logs, or administer restrictions.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500/50"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400 text-[11px]">
                    <th className="py-2.5 px-3">User & Identity</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Monthly Quota</th>
                    <th className="py-2.5 px-3">PRs Done</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => {
                    const quota = u.ownedOrganizations?.[0]?.features?.max_reviews_per_month ?? 100;
                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                        onClick={(e) => {
                          // Ignore if clicking action buttons/selects
                          if ((e.target as HTMLElement).closest('button, select')) return;
                          handleInspectUser(u);
                        }}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                              {u.name?.slice(0, 1).toUpperCase() || u.email?.slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-white group-hover:text-orange-400 transition-colors flex items-center gap-1.5">
                                <span>{u.name || 'User'}</span>
                                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-orange-400" />
                              </div>
                              <div className="text-[11px] text-neutral-500">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u, e.target.value as any)}
                            className="bg-black/50 border border-white/10 rounded px-2 py-1 text-xs font-mono text-orange-400 focus:outline-none"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Superadmin</option>
                          </select>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              u.status === 'active'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : u.status === 'blocked'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-neutral-300">
                          <span>{quota} reviews/mo</span>
                        </td>
                        <td className="py-3 px-3 text-neutral-300">{u.usage?.review_count ?? 0}</td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Inspect User Deep View */}
                            <button
                              onClick={() => handleInspectUser(u)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-white/10 hover:border-orange-500/40 bg-white/5 hover:bg-orange-500/10 text-neutral-300 hover:text-orange-400 font-mono text-[11px] transition-colors"
                              title="Inspect connected repos, PRs, and user diagnostics"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect</span>
                            </button>

                            {/* Killswitch Toggle */}
                            <button
                              onClick={() => handleSetUserStatus(u.id, u.status === 'active' ? 'blocked' : 'active')}
                              disabled={actionInProgress === u.id}
                              className={`p-1.5 rounded border transition-colors ${
                                u.status === 'active'
                                  ? 'border-red-500/20 text-neutral-400 hover:text-red-400 hover:bg-red-500/10'
                                  : 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'
                              }`}
                              title={u.status === 'active' ? 'Block User Account' : 'Reactivate User Account'}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>

                            {/* Reset Password */}
                            <button
                              onClick={() => {
                                setSelectedUserForPassword(u);
                                setNewPassword('');
                              }}
                              className="p-1.5 rounded border border-white/10 text-neutral-400 hover:text-orange-400 hover:bg-orange-500/10 transition-colors"
                              title="Reset Password"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 5: SYSTEM DIAGNOSTICS & TOOLS ──────────────── */}
      {activeTab === 'controls' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-white/10 bg-[#0c0e12] space-y-4">
            <div>
              <h2 className="text-sm font-semibold font-mono text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#F6821F]" />
                <span>Live Microservices Diagnostic Suite</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Run explicit end-to-end network handshakes directly from the Node.js API container.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { id: 'github', name: 'Test GitHub App Auth', desc: 'Validates private key & Octokit app token' },
                { id: 'neo4j', name: 'Test Neo4j Bolt Handshake', desc: 'Runs live Cypher test query on port 7687' },
                { id: 'redis', name: 'Test Redis Cache Connection', desc: 'Sends PING to Redis cluster on port 6379' },
                { id: 'ai', name: 'Ping AI Microservice', desc: 'Checks internal endpoint http://ai-service:8001' },
                { id: 'indexer', name: 'Ping Tree-sitter Indexer', desc: 'Checks internal endpoint http://indexer-service:8001' },
              ].map((test) => (
                <div key={test.id} className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-mono text-xs font-semibold text-white">{test.name}</h3>
                    <p className="text-[11px] text-neutral-400 mt-1">{test.desc}</p>
                  </div>
                  <button
                    onClick={() => handleTestService(test.id as any)}
                    disabled={testingService === test.id}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border border-white/10 hover:border-orange-500/40 bg-white/5 hover:bg-orange-500/10 text-neutral-200 hover:text-orange-400 transition-colors disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 ${testingService === test.id ? 'animate-spin' : ''}`} />
                    <span>Run Diagnostic</span>
                  </button>
                </div>
              ))}
            </div>

            {testResult && (
              <div
                className={`p-4 rounded-xl border font-mono text-xs space-y-1 ${
                  testResult.success
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-red-500/30 bg-red-500/10 text-red-300'
                }`}
              >
                <div className="font-semibold uppercase tracking-wider text-[11px]">
                  Diagnostic Result: {testResult.service}
                </div>
                <div className="text-white/90 break-all">{testResult.message}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────── MODAL / DRAWER: USER DEEP INSPECTOR & CONTROLS ──────────────── */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-white/15 bg-[#0c0e12] shadow-2xl overflow-hidden">
            {/* Inspector Header */}
            <div className="p-5 sm:p-6 border-b border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F6821F]/20 to-orange-600/10 border border-[#F6821F]/30 flex items-center justify-center text-lg font-bold text-[#F6821F] font-mono">
                  {inspectingUser.name?.slice(0, 1).toUpperCase() || inspectingUser.email?.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-mono text-base sm:text-lg font-bold text-white">
                      {inspectingUser.name || 'User Profile'}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                        inspectingUser.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : inspectingUser.status === 'blocked'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {inspectingUser.status}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-white/5 border border-white/10 text-orange-400">
                      {inspectingUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5 flex items-center gap-2">
                    <span>{inspectingUser.email}</span>
                    <span className="text-neutral-600">•</span>
                    <span className="text-neutral-500 text-[11px]">ID: {inspectingUser.id}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInspectingUser(null)}
                  className="p-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-1 px-6 border-b border-white/10 bg-black/20 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview & Diagnostics' },
                { id: 'repos', label: `Connected Repos (${userDetails?.repositories?.length ?? 0})` },
                { id: 'prs', label: `PRs & Reviews (${userDetails?.reviewJobs?.length ?? 0})` },
                { id: 'restrictions', label: 'Restrictions & Quotas' },
                { id: 'danger', label: 'Account Deletion' },
              ].map((subTab) => (
                <button
                  key={subTab.id}
                  onClick={() => setDetailSubTab(subTab.id as UserDetailSubTab)}
                  className={`py-3 px-3.5 text-xs font-mono font-medium border-b-2 transition-colors whitespace-nowrap ${
                    detailSubTab === subTab.id
                      ? 'border-[#F6821F] text-[#F6821F]'
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  {subTab.label}
                </button>
              ))}
            </div>

            {/* Inspector Body Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {userDetailsLoading ? (
                <div className="py-16 text-center space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-orange-400 mx-auto" />
                  <p className="text-xs font-mono text-neutral-400">Loading user repositories and review pipeline state...</p>
                </div>
              ) : (
                <>
                  {/* SUBTAB: OVERVIEW */}
                  {detailSubTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-1">
                          <span className="text-[11px] font-mono text-neutral-500 uppercase">Total Tokens Billed</span>
                          <div className="text-xl font-bold font-mono text-white">
                            {userDetails?.user?.usage?.total_tokens ?? 0}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-1">
                          <span className="text-[11px] font-mono text-neutral-500 uppercase">PR Reviews Executed</span>
                          <div className="text-xl font-bold font-mono text-white">
                            {userDetails?.user?.usage?.review_count ?? 0}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-1">
                          <span className="text-[11px] font-mono text-neutral-500 uppercase">Estimated OpenAI Spend</span>
                          <div className="text-xl font-bold font-mono text-emerald-400">
                            ${userDetails?.user?.usage?.cost_usd ?? 0.0}
                          </div>
                        </div>
                      </div>

                      <div className="p-5 rounded-xl border border-white/10 bg-black/40 space-y-3 text-xs font-mono">
                        <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider text-orange-400">
                          Identity & Authentication Metadata
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-neutral-400">
                          <div>
                            <span className="text-neutral-500 block">GitHub Username:</span>
                            <span className="text-white">{userDetails?.user?.githubUsername || 'Not linked'}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500 block">Bitbucket Username:</span>
                            <span className="text-white">{userDetails?.user?.bitbucketUsername || 'Not linked'}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500 block">Account Created:</span>
                            <span className="text-white">{new Date(inspectingUser.createdAt).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500 block">Last Active Session:</span>
                            <span className="text-white">
                              {inspectingUser.lastLoginAt ? new Date(inspectingUser.lastLoginAt).toLocaleString() : 'Never'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Killswitch Controls */}
                      <div className="p-5 rounded-xl border border-white/10 bg-black/40 space-y-3">
                        <h4 className="font-mono text-xs font-semibold text-white">Direct Account Killswitch Controls</h4>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <button
                            onClick={() => handleSetUserStatus(inspectingUser.id, 'active')}
                            disabled={inspectingUser.status === 'active'}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 disabled:opacity-40 transition-colors"
                          >
                            Set Active
                          </button>
                          <button
                            onClick={() => handleSetUserStatus(inspectingUser.id, 'suspended')}
                            disabled={inspectingUser.status === 'suspended'}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 disabled:opacity-40 transition-colors"
                          >
                            Suspend Access
                          </button>
                          <button
                            onClick={() => handleSetUserStatus(inspectingUser.id, 'blocked')}
                            disabled={inspectingUser.status === 'blocked'}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 disabled:opacity-40 transition-colors"
                          >
                            Hard Block & Revoke Sessions
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB: CONNECTED REPOSITORIES */}
                  {detailSubTab === 'repos' && (
                    <div className="space-y-4">
                      {userDetails?.repositories?.length === 0 ? (
                        <div className="py-12 text-center text-xs font-mono text-neutral-500">
                          This user has not connected any repositories yet.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-mono">
                            <thead>
                              <tr className="border-b border-white/10 text-neutral-400 text-[11px]">
                                <th className="py-2.5 px-3">Repository</th>
                                <th className="py-2.5 px-3">Branch</th>
                                <th className="py-2.5 px-3">Index Status</th>
                                <th className="py-2.5 px-3">Files / Symbols</th>
                                <th className="py-2.5 px-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {userDetails?.repositories?.map((repo) => (
                                <tr key={repo.id} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="py-3 px-3">
                                    <div className="font-semibold text-white">{repo.providerFullName || repo.name}</div>
                                    <div className="text-[10px] text-neutral-500">{repo.provider}</div>
                                  </td>
                                  <td className="py-3 px-3 text-neutral-400">{repo.defaultBranch || 'main'}</td>
                                  <td className="py-3 px-3">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                        repo.indexStatus === 'INDEXED'
                                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                          : repo.indexStatus === 'INDEXING'
                                          ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 animate-pulse'
                                          : repo.indexStatus === 'FAILED'
                                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                          : 'bg-neutral-500/15 text-neutral-400 border border-neutral-500/30'
                                      }`}
                                    >
                                      {repo.indexStatus}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-neutral-300">
                                    {repo.fileCount ?? 0} files / {repo.symbolCount ?? 0} symbols
                                  </td>
                                  <td className="py-3 px-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => handleTriggerRepoReindex(repo.id)}
                                        className="px-2.5 py-1 rounded border border-white/10 hover:border-orange-500/40 bg-white/5 hover:bg-orange-500/10 text-orange-300 transition-colors"
                                        title="Trigger Reindexing"
                                      >
                                        Reindex
                                      </button>
                                      <button
                                        onClick={() => handleResetRepoIndex(repo.id)}
                                        className="px-2.5 py-1 rounded border border-white/10 hover:border-red-500/40 bg-white/5 hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-colors"
                                        title="Reset Index Lock"
                                      >
                                        Reset
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUBTAB: RECENT PRS & REVIEWS */}
                  {detailSubTab === 'prs' && (
                    <div className="space-y-4">
                      {userDetails?.pullRequests?.length === 0 ? (
                        <div className="py-12 text-center text-xs font-mono text-neutral-500">
                          No pull requests detected for this user.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-mono">
                            <thead>
                              <tr className="border-b border-white/10 text-neutral-400 text-[11px]">
                                <th className="py-2.5 px-3">PR #</th>
                                <th className="py-2.5 px-3">Title</th>
                                <th className="py-2.5 px-3">Branches</th>
                                <th className="py-2.5 px-3">Status</th>
                                <th className="py-2.5 px-3">Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {userDetails?.pullRequests?.map((pr) => (
                                <tr key={pr.id} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="py-3 px-3 text-orange-400 font-bold">#{pr.prNumber}</td>
                                  <td className="py-3 px-3 text-white max-w-xs truncate">{pr.title}</td>
                                  <td className="py-3 px-3 text-neutral-400 text-[11px]">
                                    {pr.headBranch} → {pr.baseBranch}
                                  </td>
                                  <td className="py-3 px-3">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-white/5 text-neutral-300 border border-white/10">
                                      {pr.status}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-neutral-500 text-[11px]">
                                    {new Date(pr.createdAt).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUBTAB: RESTRICTIONS & QUOTAS */}
                  {detailSubTab === 'restrictions' && (
                    <div className="space-y-5 max-w-xl">
                      <div className="p-5 rounded-xl border border-white/10 bg-black/40 space-y-4 text-xs font-mono">
                        <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider text-orange-400">
                          Monthly Review Quota Override
                        </h4>
                        <p className="text-neutral-400 text-xs">
                          Override monthly automated AI review budget for this account.
                        </p>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            value={newQuota}
                            onChange={(e) => setNewQuota(Number(e.target.value))}
                            className="w-48 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-orange-500/50"
                          />
                          <button
                            onClick={async () => {
                              setSelectedUserForQuota(inspectingUser);
                              await handleSaveQuota();
                            }}
                            className="px-4 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[#F6821F] hover:bg-[#ff9538] text-black transition-colors"
                          >
                            Save Quota
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB: DANGER ZONE & DELETION */}
                  {detailSubTab === 'danger' && (
                    <div className="space-y-5 max-w-xl">
                      <div className="p-5 rounded-xl border border-red-500/30 bg-red-500/5 space-y-4">
                        <div className="flex items-center gap-2 text-red-400">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <h4 className="font-mono text-sm font-semibold">Danger Zone: Permanent Account Deletion</h4>
                        </div>
                        <p className="text-xs text-neutral-300 leading-relaxed">
                          Permanently delete this user, revoke all active sessions in Redis, and delete organization memberships. This action cannot be undone.
                        </p>

                        {/* Edge Case Safeguard: Cannot delete self */}
                        {currentAdminUser && currentAdminUser.id === inspectingUser.id ? (
                          <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs font-mono text-red-300">
                            Protected Safeguard: You cannot delete your own currently logged-in administrator account.
                          </div>
                        ) : (
                          <div className="space-y-3 pt-2">
                            <p className="text-xs text-neutral-400 font-mono">
                              To confirm deletion, please type <span className="text-white font-bold">{inspectingUser.email}</span> below:
                            </p>
                            <input
                              type="text"
                              value={deleteConfirmEmail}
                              onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                              placeholder="Enter user email to confirm"
                              className="w-full px-3 py-2 rounded-lg bg-black/60 border border-red-500/30 text-white font-mono text-xs focus:outline-none focus:border-red-500"
                            />
                            <button
                              onClick={handleDeleteUser}
                              disabled={
                                deleteConfirmEmail.trim().toLowerCase() !== inspectingUser.email.toLowerCase() ||
                                deletingUser
                              }
                              className="w-full py-2 rounded-lg text-xs font-mono font-semibold bg-red-600 hover:bg-red-500 text-white disabled:opacity-30 transition-colors flex items-center justify-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{deletingUser ? 'Deleting Account...' : 'Permanently Delete User Account'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Quota Override (Direct from table) ── */}
      {selectedUserForQuota && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl border border-white/10 bg-[#0c0e12] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-sm font-semibold text-white">Override Monthly Quota</h3>
              <button onClick={() => setSelectedUserForQuota(null)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-400">
              Set maximum permitted automated PR reviews per billing cycle for{' '}
              <span className="text-white font-mono">{selectedUserForQuota.email}</span>.
            </p>
            <input
              type="number"
              value={newQuota}
              onChange={(e) => setNewQuota(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-orange-500/50"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedUserForQuota(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono border border-white/10 hover:bg-white/5 text-neutral-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuota}
                className="px-4 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[#F6821F] hover:bg-[#ff9538] text-black transition-colors"
              >
                Save Quota
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Password Reset ── */}
      {selectedUserForPassword && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl border border-white/10 bg-[#0c0e12] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-sm font-semibold text-white">Reset User Password</h3>
              <button onClick={() => setSelectedUserForPassword(null)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-400">
              Enter a new temporary or permanent password for{' '}
              <span className="text-white font-mono">{selectedUserForPassword.email}</span> (min 8 characters).
            </p>
            <input
              type="password"
              placeholder="Enter new password..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-orange-500/50"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedUserForPassword(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono border border-white/10 hover:bg-white/5 text-neutral-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePassword}
                disabled={newPassword.length < 8}
                className="px-4 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[#F6821F] hover:bg-[#ff9538] text-black transition-colors disabled:opacity-50"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminConsolePage() {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-400 font-mono text-xs">Loading Admin Operations...</div>}>
      <AdminConsoleInner />
    </Suspense>
  );
}
