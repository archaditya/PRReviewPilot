'use client';

import { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  DollarSign,
  Activity,
  Layers,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sliders,
  RotateCcw,
  Ban,
  Search,
} from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  provider: 'github' | 'bitbucket';
  role: 'superadmin' | 'admin' | 'user';
  status: 'active' | 'suspended';
  reviewsCount: number;
  maxReviews: number;
  tokensUsed: number;
  costUsd: number;
}

export default function AdminMonitoringPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [newQuota, setNewQuota] = useState(50);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalRepos: 0,
    totalReviews: 0,
    totalTokens: 0,
    totalCostUsd: 0,
  });

  const [users, setUsers] = useState<AdminUser[]>([]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats', { credentials: 'include' }).then(r => r.ok ? r.json() : null),
        fetch('/api/admin/users', { credentials: 'include' }).then(r => r.ok ? r.json() : null),
      ]);

      if (statsRes?.success && statsRes.stats) {
        setStatsData(statsRes.stats);
      }

      if (usersRes?.success && Array.isArray(usersRes.users)) {
        const mappedUsers: AdminUser[] = usersRes.users.map((u: any) => ({
          id: u.id,
          name: u.name || (u.email ? u.email.split('@')[0] : 'User'),
          email: u.email,
          provider: u.bitbucketUsername ? 'bitbucket' : 'github',
          role: u.role || 'user',
          status: u.status || 'active',
          reviewsCount: u.usage?.review_count || 0,
          maxReviews: u.ownedOrganizations?.[0]?.features?.max_reviews_per_month || 100,
          tokensUsed: u.usage?.total_tokens || 0,
          costUsd: Number((((u.usage?.total_tokens || 0) / 1000) * 0.0002).toFixed(4)),
        }));
        setUsers(mappedUsers);
      }
    } catch (e) {
      console.error('Failed to load admin stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const totalTokens = statsData.totalTokens || users.reduce((acc, u) => acc + u.tokensUsed, 0);
  const totalCost = statsData.totalCostUsd || users.reduce((acc, u) => acc + u.costUsd, 0);
  const totalReviews = statsData.totalReviews || users.reduce((acc, u) => acc + u.reviewsCount, 0);

  const handleToggleStatus = async (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
        credentials: 'include',
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, status: nextStatus } : u))
        );
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const handleResetUsage = async (id: string) => {
    if (!confirm('Reset usage counter and tokens for this user?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}/reset-usage`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, reviewsCount: 0, tokensUsed: 0, costUsd: 0 } : u))
        );
      }
    } catch (e) {
      console.error('Failed to reset usage:', e);
    }
  };

  const handleSaveQuota = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/quota`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxReviewsPerMonth: newQuota }),
        credentials: 'include',
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, maxReviews: newQuota } : u))
        );
      }
    } catch (e) {
      console.error('Failed to save quota:', e);
    } finally {
      setSelectedUser(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white">Admin Observability & AI Cost Controls</h1>
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30">
              SUPERADMIN CONTROL
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Real-time token billing monitoring, per-user rate limiting, hard diff caps, and user killswitch controls.
          </p>
        </div>
      </div>

      {/* Observability Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Total Tokens Consumed</span>
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{(totalTokens / 1_000_000).toFixed(2)}M</span>
            <span className="text-xs text-indigo-400">tokens billed</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Estimated OpenAI Cost</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-emerald-400">${totalCost.toFixed(3)}</span>
            <span className="text-xs text-gray-500">USD</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Total PR Reviews</span>
            <Layers className="w-5 h-5 text-purple-400" />
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{totalReviews}</span>
            <span className="text-xs text-purple-400">runs</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Diff Capping Guardrail</span>
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">16k tokens</span>
            <span className="text-xs text-emerald-400">Hard ceiling ACTIVE</span>
          </div>
        </div>
      </div>

      {/* User Management & Usage Table */}
      <div className="glass-panel rounded-2xl border border-gray-800 overflow-hidden space-y-4">
        <div className="p-6 border-b border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">User-by-User Quota & Cost Tracking</h2>
            <p className="text-xs text-gray-400 mt-1">
              Adjust monthly limits, monitor token usage, or suspend users exceeding fair-use limits.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search user or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-indigo-500 w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-900/60 text-gray-400 uppercase text-[11px] border-b border-gray-800">
              <tr>
                <th className="px-6 py-3">User & Provider</th>
                <th className="px-6 py-3">Reviews / Quota</th>
                <th className="px-6 py-3">Tokens Used</th>
                <th className="px-6 py-3">Est. Cost</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    Loading admin observability metrics...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No users registered yet. When users sign up, their metrics and quota controls will appear here.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                const percentUsed = Math.min(Math.round((u.reviewsCount / u.maxReviews) * 100), 100);
                const isOverLimit = u.reviewsCount >= u.maxReviews;

                return (
                  <tr key={u.id} className="hover:bg-gray-800/20 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-gray-400 text-[11px]">{u.email}</div>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-gray-800 text-gray-400 uppercase">
                        {u.provider} • {u.role}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`font-mono font-bold ${isOverLimit ? 'text-rose-400' : 'text-white'}`}>
                          {u.reviewsCount} / {u.maxReviews}
                        </span>
                        <span className="text-[10px] text-gray-500">({percentUsed}%)</span>
                      </div>
                      <div className="w-28 bg-gray-900 rounded-full h-1.5 mt-1.5">
                        <div
                          className={`h-1.5 rounded-full ${isOverLimit ? 'bg-rose-500' : percentUsed > 75 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                          style={{ width: `${percentUsed}%` }}
                        />
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono">
                      {(u.tokensUsed / 1000).toFixed(1)}k tokens
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                      ${u.costUsd.toFixed(3)}
                    </td>

                    <td className="px-6 py-4">
                      {u.status === 'active' ? (
                        <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] bg-rose-500/10 text-rose-400 font-medium border border-rose-500/20">
                          Suspended
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setNewQuota(u.maxReviews);
                        }}
                        className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300"
                        title="Adjust Monthly Quota"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleResetUsage(u.id)}
                        className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300"
                        title="Reset Usage Counter"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`p-1.5 rounded-lg transition ${
                          u.status === 'active'
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                        }`}
                        title={u.status === 'active' ? 'Suspend User (Killswitch)' : 'Reactivate User'}
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Quota Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-gray-700 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Adjust Review Quota</h3>
            <p className="text-xs text-gray-400">
              Set monthly pull request review ceiling for <span className="text-white font-semibold">{selectedUser.name}</span>.
            </p>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Max Reviews per Month (Hard Stop)
              </label>
              <input
                type="number"
                value={newQuota}
                onChange={(e) => setNewQuota(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuota}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Save Quota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
