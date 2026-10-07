import Link from 'next/link';
import { GitPullRequest, ShieldCheck, Zap, GitBranch, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between glow-gradient">
      {/* Navigation */}
      <header className="border-b border-gray-800/80 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GitPullRequest className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              ReviewPilot
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 pt-20 pb-16 flex flex-col items-center text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8">
          <span>⚡ Next-Gen Code Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl text-white leading-tight">
          AI Code Reviews for <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            GitHub & Bitbucket Cloud
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl leading-relaxed">
          Cut code review turnaround by 80%. Automated security vulnerability scanning, bug risk detection, and contextual inline comments directly on your pull requests.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <a
            href="http://localhost:4000/api/auth/login/github"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gray-900 border border-gray-700 hover:border-gray-500 text-white font-semibold flex items-center justify-center space-x-3 transition shadow-lg"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>Connect with GitHub</span>
          </a>

          <a
            href="http://localhost:4000/api/auth/login/bitbucket"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600/10 border border-blue-500/40 hover:border-blue-400 text-blue-300 font-semibold flex items-center justify-center space-x-3 transition shadow-lg"
          >
            <GitBranch className="w-5 h-5 text-blue-400" />
            <span>Connect with Bitbucket</span>
          </a>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="glass-panel p-6 rounded-2xl hover:border-indigo-500/50 transition">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Security Vulnerabilities</h3>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">
              Detect injection vulnerabilities, credential exposures, insecure deserialization, and dangerous dependencies before merging.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl hover:border-indigo-500/50 transition">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Instant Inline Comments</h3>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">
              Actionable inline code suggestions posted directly to the relevant line in your GitHub PR or Bitbucket Cloud pull request.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl hover:border-indigo-500/50 transition">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <GitBranch className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Unified Multi-Provider</h3>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">
              Single pane of glass across your organization. Monitor GitHub and Bitbucket repositories seamlessly with consistent review policies.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-xs text-gray-500">
        ReviewPilot © 2026. Production AI Code Review Engine.
      </footer>
    </div>
  );
}
