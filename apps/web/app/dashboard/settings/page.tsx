'use client';

import { useState } from 'react';
import { GitPullRequest, GitBranch, Key, Users, Bell, Shield, Check, Copy } from 'lucide-react';

export default function SettingsPage() {
  const [apiKeyCreated, setApiKeyCreated] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Workspace & Security Settings</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage your Git provider credentials, API keys, team access, and review policies.
        </p>
      </div>

      {/* 1. Connected Git Providers */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <h3 className="font-bold text-base text-white flex items-center space-x-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          <span>Connected Git Providers</span>
        </h3>
        <p className="text-xs text-gray-400">
          OAuth accounts linked to your ReviewPilot user profile for repository discovery and webhook access.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* GitHub Card */}
          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gray-800 text-white">
                <GitPullRequest className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">GitHub</h4>
                <span className="text-xs text-emerald-400 font-medium">Connected (@dev-alex)</span>
              </div>
            </div>
            <button className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition">
              Reconnect
            </button>
          </div>

          {/* Bitbucket Card */}
          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Bitbucket Cloud</h4>
                <span className="text-xs text-emerald-400 font-medium">Connected (@alex-corp)</span>
              </div>
            </div>
            <button className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition">
              Reconnect
            </button>
          </div>
        </div>
      </div>

      {/* 2. Team Members & Roles */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white flex items-center space-x-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Team Members (RBAC)</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">Users with access to repository findings and settings.</p>
          </div>
          <button className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition">
            + Invite Member
          </button>
        </div>

        <div className="divide-y divide-gray-800 text-sm">
          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-semibold text-white">Alex Johnson</span>
              <span className="text-xs text-gray-400 block">alex@example.com</span>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20">
              Workspace Owner
            </span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-semibold text-white">Sam Rivera</span>
              <span className="text-xs text-gray-400 block">sam@example.com</span>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-300 font-medium">
              Developer
            </span>
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
            <p className="text-xs text-gray-400 mt-1">Trigger code reviews directly from Jenkins, GitHub Actions, or Bitbucket Pipelines.</p>
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
            <span className="text-xs font-bold text-emerald-400 block">New API Key Generated (Store safely):</span>
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
