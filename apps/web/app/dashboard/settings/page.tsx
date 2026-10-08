'use client';

import { useState } from 'react';
import { GitPullRequest, GitBranch, Key, Users, Shield, Check, Copy, Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const [apiKeyCreated, setApiKeyCreated] = useState(false);
  const [copied, setCopied] = useState(false);

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
    </div>
  );
}
