'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GitPullRequest, GitBranch, ArrowLeft, Mail, Lock, User, ArrowUpRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const body = mode === 'register' ? { email, password, name } : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = {};
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        if (res.status === 502) {
          throw new Error('502 Bad Gateway: API container is currently starting up. Wait 10 seconds and retry.');
        }
        throw new Error(`Server error (${res.status}): ${text.slice(0, 100)}`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Authentication failed');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0e12] text-neutral-100 font-sans antialiased flex flex-col selection:bg-orange-500/30">
      {/* ── Consistent Top Header ── */}
      <header className="h-14 border-b border-white/10 bg-[#0d0f14]/85 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-7 h-7 rounded-lg border border-orange-500/30 bg-orange-500/10 flex items-center justify-center text-white group-hover:border-orange-500/60 transition-colors">
            <GitPullRequest className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <span className="font-brand font-semibold text-base tracking-tight text-white block">
            ReviewPilot<span className="text-[#F6821F]">.</span>
          </span>
        </Link>

        <Link
          href="/"
          className="flex items-center space-x-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to home</span>
        </Link>
      </header>

      {/* ── Form Viewport ── */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-12">
        <div className="max-w-md w-full card-chai p-8 space-y-6">
          <div className="flex flex-col items-center text-center">
            <h2 className="font-montserrat text-lg font-semibold text-white tracking-tight">
              {mode === 'login' ? 'Sign in to ReviewPilot' : 'Create your workspace account'}
            </h2>
            <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
              {mode === 'login'
                ? 'Access your code knowledge graphs and review telemetry.'
                : 'Automated AI pull request reviews on GitHub and Bitbucket.'}
            </p>
          </div>

          {/* Tab Segmented Control */}
          <div className="grid grid-cols-2 p-1 bg-white/[0.03] rounded-lg border border-white/10 text-xs font-medium">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`py-1.5 rounded-md transition-all ${
                mode === 'login' ? 'bg-orange-500/10 text-white font-medium border border-orange-500/30' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`py-1.5 rounded-md transition-all ${
                mode === 'register' ? 'bg-orange-500/10 text-white font-medium border border-orange-500/30' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-xs leading-relaxed font-mono">
              {error}
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Aditya Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-md bg-neutral-900 border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-md bg-neutral-900 border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-white/30 font-sans"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-mono text-neutral-400">Password</label>
                {mode === 'login' && (
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-mono text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 rounded-md bg-neutral-900 border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-white/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-neutral-500 hover:text-neutral-300 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-asym w-full justify-center text-xs py-2.5 mt-2"
            >
              <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign in' : 'Create workspace'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
              <span className="bg-[#0a0a0a] px-2 text-neutral-500">Or continue with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/api/auth/login/github"
              className="py-2 px-3 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-xs flex items-center justify-center space-x-2 transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </a>

            <a
              href="/api/auth/login/bitbucket"
              className="py-2 px-3 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-xs flex items-center justify-center space-x-2 transition-colors"
            >
              <GitBranch className="w-4 h-4 text-neutral-400" />
              <span>Bitbucket</span>
            </a>
          </div>
        </div>
      </main>

      {/* ── Consistent Footer ── */}
      <footer className="border-t border-white/10 py-6 px-8 text-center text-xs text-neutral-500 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-brand font-medium text-white">ReviewPilot<span className="text-[#FF7D0C]">.</span></span>
            <span>&bull;</span>
            <span className="font-mono text-[11px]">Automated AI Code Review Engine</span>
          </div>
          <div className="text-[11px] font-mono text-neutral-500">
            Multi-tenant architecture with real-time GitHub & Bitbucket webhooks
          </div>
        </div>
      </footer>
    </div>
  );
}
