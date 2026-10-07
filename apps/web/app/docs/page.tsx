import Link from 'next/link';
import { ArrowRight, CheckCircle2, Shield, Zap, GitPullRequest } from 'lucide-react';

export default function DocsOverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">ReviewPilot Documentation & Integration Guide</h1>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">
          Welcome to the official developer guide for ReviewPilot. Learn how to connect your GitHub and Bitbucket Cloud repositories, configure automated PR reviews, customize strictness policies, and explore blast radius dependency graphs.
        </p>
      </div>

      {/* Quickstart steps */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Quickstart in 3 Minutes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">1</div>
            <h3 className="font-semibold text-white text-sm">Connect Git Account</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Authenticate via GitHub OAuth or Bitbucket Cloud OAuth 2.0 consumer.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">2</div>
            <h3 className="font-semibold text-white text-sm">Select Repositories</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Enable ReviewPilot on your repos. Webhooks are registered automatically.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">3</div>
            <h3 className="font-semibold text-white text-sm">Open a Pull Request</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Get automated risk assessment, blast radius graph, and inline suggestions.
            </p>
          </div>
        </div>
      </div>

      {/* Integration Guides Links */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <h2 className="text-lg font-bold text-white">Featured Integration Guides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/docs/github-setup"
            className="p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-indigo-500/50 transition flex items-center justify-between group"
          >
            <div>
              <h4 className="font-semibold text-white text-sm group-hover:text-indigo-400 transition">GitHub Integration Guide</h4>
              <p className="text-xs text-gray-400 mt-1">Configure GitHub Apps, webhooks, and inline review permissions.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition" />
          </Link>

          <Link
            href="/docs/bitbucket-setup"
            className="p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-indigo-500/50 transition flex items-center justify-between group"
          >
            <div>
              <h4 className="font-semibold text-white text-sm group-hover:text-indigo-400 transition">Bitbucket Cloud Guide</h4>
              <p className="text-xs text-gray-400 mt-1">Set up OAuth 2.0 Consumers and automated webhook triggers.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition" />
          </Link>
        </div>
      </div>
    </div>
  );
}
