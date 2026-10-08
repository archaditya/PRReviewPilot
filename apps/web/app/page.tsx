import Link from 'next/link';
import { ShieldCheck, Zap, BarChart3, ArrowRight, CheckCircle2, Code2, Eye, Bot, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-600/8 blur-[100px]" />
        <div className="absolute top-[40%] left-[-10%] w-[400px] h-[300px] rounded-full bg-cyan-600/5 blur-[80px]" />
      </div>

      {/* Navigation */}
      <header className="relative z-50 border-b border-white/5 bg-[#090d16]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Bot className="w-5 h-5 text-white" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#090d16] animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              PR<span className="text-indigo-400">Review</span>Pilot
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-300 hover:text-white transition px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/25 transition-all duration-200 hover:shadow-indigo-500/40"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-20 sm:pt-28 pb-20 flex flex-col items-center text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-semibold tracking-wide mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Code Intelligence Engine</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight max-w-5xl leading-[1.1]">
            <span className="text-white">Your AI Code Reviewer</span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              That Never Sleeps
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl leading-relaxed">
            PRReviewPilot catches security vulnerabilities, logic bugs, and code smells <strong className="text-gray-200">before they reach production</strong>. Automated inline comments on every pull request in under 30 seconds.
          </p>

          {/* Primary CTA */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/login"
              className="group w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-base flex items-center justify-center space-x-2 transition-all duration-200 shadow-2xl shadow-indigo-600/25 hover:shadow-indigo-500/40 hover:scale-[1.02]"
            >
              <span>Get Started — Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-medium text-base flex items-center justify-center space-x-2 transition"
            >
              <Eye className="w-4 h-4" />
              <span>See How It Works</span>
            </a>
          </div>

          {/* Supported Providers (subtle, not the hero) */}
          <div className="mt-10 flex items-center space-x-2 text-xs text-gray-500">
            <span>Works with</span>
            <div className="flex items-center space-x-3 px-3 py-1 rounded-full border border-white/5 bg-white/[0.02]">
              <svg className="w-4 h-4 fill-gray-400" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
              <span className="text-gray-400">GitHub</span>
              <span className="text-gray-600">•</span>
              <svg className="w-4 h-4 fill-gray-400" viewBox="0 0 24 24"><path d="M.778 1.213a.768.768 0 00-.768.892L3.326 20.83a1.053 1.053 0 001.014.852l.014-.001a.946.946 0 00.163-.029l6.206-1.793a.386.386 0 00.183-.119l-.001-.001 7.003-9.168a.12.12 0 00-.02-.172l-3.373-2.593a.12.12 0 00-.166.023l-5.46 7.044-2.078-.63 4.053-12.622a.768.768 0 00-.734-.981L.778 1.213z"/></svg>
              <span className="text-gray-400">Bitbucket</span>
            </div>
          </div>

          {/* Hero Visual: Animated Review Card */}
          <div className="mt-16 w-full max-w-3xl relative">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent rounded-3xl blur-xl" />
            <div className="relative glass-panel rounded-2xl border border-white/10 overflow-hidden">
              {/* Fake terminal header */}
              <div className="flex items-center space-x-2 px-5 py-3 border-b border-white/5 bg-white/[0.02]">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="ml-3 text-xs text-gray-500 font-mono">prreviewpilot — ai review in progress</span>
              </div>
              {/* Simulated review output */}
              <div className="p-6 space-y-4 font-mono text-xs leading-relaxed">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="space-y-2 text-gray-300">
                    <p className="text-indigo-400 font-semibold">PRReviewPilot — Automated Review</p>
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-rose-300">
                      <p className="font-semibold flex items-center space-x-1.5"><span>🔴</span><span>Critical: SQL Injection Risk</span></p>
                      <p className="mt-1 text-rose-300/80">Line 47: User input passed directly to query without parameterization. Use prepared statements.</p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-amber-300">
                      <p className="font-semibold flex items-center space-x-1.5"><span>🟡</span><span>Warning: Missing Error Boundary</span></p>
                      <p className="mt-1 text-amber-300/80">The async handler at line 83 lacks try-catch. Unhandled rejections will crash the process.</p>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-emerald-300">
                      <p className="font-semibold flex items-center space-x-1.5"><span>🟢</span><span>Good: Proper input validation detected</span></p>
                      <p className="mt-1 text-emerald-300/80">Zod schema on line 12 correctly validates request body. Clean implementation.</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-gray-500 text-[10px] pt-2 border-t border-white/5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Review completed in 18s • 3 findings • 847 tokens used • $0.002 cost</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-6xl mx-auto px-6 pb-24">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">What PRReviewPilot Catches For You</h2>
            <p className="mt-3 text-gray-400 max-w-xl mx-auto">Every pull request gets a comprehensive AI-powered audit — automatically, before any human reviewer even opens it.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group glass-panel p-7 rounded-2xl hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-600/10 flex items-center justify-center text-rose-400 mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Security Vulnerabilities</h3>
              <p className="mt-2.5 text-sm text-gray-400 leading-relaxed">
                SQL injection, XSS, credential exposure, insecure deserialization, and hardcoded secrets — caught before merge.
              </p>
            </div>

            <div className="group glass-panel p-7 rounded-2xl hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">30-Second Inline Reviews</h3>
              <p className="mt-2.5 text-sm text-gray-400 leading-relaxed">
                Contextual suggestions posted directly on the exact line of your PR. No tab switching, no manual triggering.
              </p>
            </div>

            <div className="group glass-panel p-7 rounded-2xl hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Cost & Token Intelligence</h3>
              <p className="mt-2.5 text-sm text-gray-400 leading-relaxed">
                Real-time dashboard showing review spend per team, token usage trends, and per-PR cost breakdowns. No billing surprises.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-6 pb-24">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Setup in 3 Steps</h2>
            <p className="mt-3 text-gray-400">From zero to automated AI reviews in under 5 minutes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Your Workspace', desc: 'Sign up with email or connect your existing GitHub / Bitbucket account. Your isolated workspace is created instantly.', icon: <Code2 className="w-5 h-5" /> },
              { step: '02', title: 'Install on Your Repos', desc: 'One click to install PRReviewPilot on your GitHub Org or Bitbucket workspace. All repos auto-sync instantly.', icon: <Bot className="w-5 h-5" /> },
              { step: '03', title: 'Open a PR — Done', desc: 'Open any pull request as usual. PRReviewPilot detects it automatically and posts AI review comments within 30 seconds.', icon: <CheckCircle2 className="w-5 h-5" /> },
            ].map((item) => (
              <div key={item.step} className="relative glass-panel p-7 rounded-2xl group hover:border-indigo-500/20 transition-all">
                <div className="absolute -top-4 left-6 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-lg">
                  Step {item.step}
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    {item.icon}
                    <span>{item.title}</span>
                  </h3>
                  <p className="mt-3 text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="max-w-4xl mx-auto px-6 pb-24 text-center">
          <div className="glass-panel rounded-3xl p-12 border border-indigo-500/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-transparent to-purple-600/5" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">Ship Safer Code, Faster</h2>
              <p className="mt-4 text-gray-400 max-w-lg mx-auto">Join engineering teams using PRReviewPilot to catch critical bugs before they reach production.</p>
              <Link
                href="/login"
                className="inline-flex items-center space-x-2 mt-8 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-base shadow-2xl shadow-indigo-600/25 transition-all hover:scale-[1.02]"
              >
                <span>Start Reviewing — Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <span>PRReviewPilot © 2026</span>
          </div>
          <span className="mt-2 sm:mt-0">AI-Powered Code Review Engine</span>
        </div>
      </footer>
    </div>
  );
}
