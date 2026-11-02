'use client';

import { useState } from 'react';
import {
  GitPullRequest,
  GitBranch,
  Key,
  Users,
  Shield,
  Check,
  Copy,
  Lock,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Download,
  Trash2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export default function SettingsPage() {
  const [apiKeyCreated, setApiKeyCreated] = useState(false);
  const [copied, setCopied] = useState(false);

  // Data Privacy & Erasure State (DPDP Act, 2023)
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleExportData = async () => {
    try {
      setExportLoading(true);
      const res = await fetch('/api/users/me/export', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to export personal data');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reviewpilot-user-data.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || 'Error downloading personal data');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    setDeleting(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationEmail: deleteEmail, password: deletePassword }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete account');
      }
      alert('Your account and personal data have been permanently erased under the DPDP Act.');
      window.location.href = '/login';
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback({ type: null, message: '' });

    if (newPassword.length < 8) {
      setPasswordFeedback({ type: 'error', message: 'New password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Failed to update password');
      }

      setPasswordFeedback({ type: 'success', message: 'Your password has been updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordFeedback({ type: 'error', message: err.message || 'Error updating password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Workspace & Security Settings</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage your account credentials, security policies, API keys, and Git integrations.
        </p>
      </div>

      {/* 1. Change Password / Security */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-5">
        <div className="flex items-center space-x-2">
          <Lock className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-base text-white">Change Account Password</h3>
        </div>
        <p className="text-xs text-gray-400">
          Update the password used to sign in to your PRReviewPilot account.
        </p>

        {passwordFeedback.type && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center space-x-2 ${
              passwordFeedback.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {passwordFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{passwordFeedback.message}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md pt-1">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 pr-10 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300 transition"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">New Password (min 8 chars)</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 pr-10 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300 transition"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 pr-10 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300 transition"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
          >
            {passwordLoading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* 2. Connected Git Providers */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <h3 className="font-bold text-base text-white flex items-center space-x-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          <span>Connected Git Providers</span>
        </h3>
        <p className="text-xs text-gray-400">
          OAuth accounts and App installations linked to your ReviewPilot profile.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gray-800 text-white">
                <GitPullRequest className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">GitHub</h4>
                <span className="text-xs text-gray-400">GitHub App Integration</span>
              </div>
            </div>
            <a
              href="/api/integrations/github/install"
              className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
            >
              Configure
            </a>
          </div>

          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Bitbucket Cloud</h4>
                <span className="text-xs text-gray-400">Workspace OAuth 2.0</span>
              </div>
            </div>
            <a
              href="/api/auth/login/bitbucket"
              className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
            >
              Connect
            </a>
          </div>
        </div>
      </div>

      {/* 3. API Keys */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white flex items-center space-x-2">
              <Key className="w-4 h-4 text-indigo-400" />
              <span>CI/CD Pipeline API Keys</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Trigger automated code reviews programmatically from CI pipelines.
            </p>
          </div>
          <button
            onClick={() => setApiKeyCreated(true)}
            className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium border border-gray-700 transition"
          >
            Generate New Key
          </button>
        </div>

        {apiKeyCreated && (
          <div className="p-4 rounded-xl bg-gray-950 border border-emerald-500/40 space-y-2">
            <span className="text-xs font-bold text-emerald-400 block">New API Key Generated:</span>
            <div className="flex items-center justify-between bg-black/60 p-2.5 rounded-lg font-mono text-xs text-gray-200">
              <span>rp_live_89f0a213e481c9b2d04a6e19</span>
              <button
                onClick={() => copyToClipboard('rp_live_89f0a213e481c9b2d04a6e19')}
                className="text-xs text-indigo-400 hover:text-white flex items-center space-x-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Data Privacy & Statutory Governance (DPDP Act, 2023) */}
      <div className="card-chai p-6 space-y-6 border border-white/10">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-orange-400" />
          <h3 className="font-montserrat font-semibold text-base text-white">
            Data Privacy &amp; Statutory Rights (DPDP Act, 2023)
          </h3>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed font-sans">
          Under India&apos;s Digital Personal Data Protection Act, 2023, you retain the statutory right to access an immutable summary of your personal data and to request permanent erasure of your account and AST knowledge graph records.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 font-sans">
          {/* Export Personal Data */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <span className="font-semibold text-white text-xs flex items-center gap-1.5">
                <Download className="w-4 h-4 text-orange-400" />
                <span>Export My Data (JSON)</span>
              </span>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Download a complete, machine-readable JSON archive of your personal credentials, organizations, and review telemetry.
              </p>
            </div>
            <button
              onClick={handleExportData}
              disabled={exportLoading}
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <Download className={`w-3.5 h-3.5 ${exportLoading ? 'animate-bounce' : ''}`} />
              <span>{exportLoading ? 'Generating Export...' : 'Download Data Archive'}</span>
            </button>
          </div>

          {/* Right to Erasure */}
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <span className="font-semibold text-red-400 text-xs flex items-center gap-1.5">
                <Trash2 className="w-4 h-4" />
                <span>Right to Erasure (Delete Account)</span>
              </span>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Permanently purge your account, revoke all API sessions, and wipe connected repository AST graphs from Neo4j.
              </p>
            </div>
            <button
              onClick={() => {
                setDeleteModalOpen(true);
                setDeleteError(null);
                setDeleteEmail('');
                setDeletePassword('');
              }}
              className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 font-medium text-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete My Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full card-chai p-6 space-y-5 border border-red-500/30 bg-[#0e1117] shadow-2xl">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <h3 className="font-montserrat font-bold text-base text-white">Permanently Delete Account?</h3>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              This action is <strong className="text-red-400">permanent and irreversible</strong>. Your user account, authentication sessions, and Neo4j AST knowledge graph symbols will be completely erased.
            </p>

            {deleteError && (
              <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-xs font-mono">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-3 font-sans">
              <div>
                <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                  Type your email address to confirm:
                </label>
                <input
                  type="email"
                  required
                  placeholder="your-email@example.com"
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                  Account Password (if set):
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deleting}
                  className="px-3.5 py-1.5 rounded-lg border border-white/10 text-xs text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting || !deleteEmail.trim()}
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-all disabled:opacity-40"
                >
                  {deleting ? 'Erasing Data...' : 'Confirm Account Erasure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
