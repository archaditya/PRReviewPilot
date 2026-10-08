'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Bot } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Request failed');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 glow-gradient">
      <Link
        href="/login"
        className="absolute top-8 left-8 flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Sign In</span>
      </Link>

      <div className="max-w-md w-full glass-panel p-8 rounded-2xl shadow-2xl border border-gray-800 space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-3">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Reset Password</h2>
          <p className="mt-1.5 text-xs text-gray-400">
            Enter your account email and we'll send you a secure link to reset your password.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white">Reset Link Dispatched</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                If an account exists for <strong className="text-indigo-300">{email}</strong>, you will receive an email shortly with instructions to reset your password.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-block mt-4 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Return to Sign In →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Account Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="admin@prreviewpilot.archadi.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/30 flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <span>{loading ? 'Sending Request...' : 'Send Reset Link'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
