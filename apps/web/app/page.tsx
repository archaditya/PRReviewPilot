import Link from 'next/link';
import {
  GitPullRequest,
  ArrowUpRight,
  ArrowRight,
  Database,
  Network,
  TreePine,
  ShieldCheck,
  CheckCircle2,
  GitBranch,
  Terminal,
  Cpu,
  Layers,
  BookOpen,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0c0e12] text-neutral-100 font-sans antialiased flex flex-col selection:bg-orange-500/30">
      {/* Ambient Cloudflare Orange Radial Header Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(246,130,31,0.18),transparent)] pointer-events-none z-0" />

      {/* ── Fixed Sticky Navigation ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0c0e12]/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-7 h-7 rounded-lg border border-orange-500/30 bg-orange-500/10 flex items-center justify-center text-white group-hover:border-orange-500/60 transition-colors">
              <GitPullRequest className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <span className="font-brand font-semibold text-base tracking-tight text-white block">
              ReviewPilot<span className="text-[#F6821F]">.</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-xs text-neutral-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#terminal-preview" className="hover:text-white transition-colors">Live Preview</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          </nav>

          <div className="flex items-center space-x-3">
            {/* Standalone Developer Documentation Link */}
            <Link
              href="/docs"
              className="text-xs font-mono px-2.5 py-1 rounded-md border border-orange-500/25 bg-orange-500/5 text-orange-300 hover:bg-orange-500/15 hover:border-orange-500/40 transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3 h-3 text-orange-400" />
              <span>Docs</span>
              <ArrowUpRight className="w-2.5 h-2.5 opacity-70" />
            </Link>

            <Link
              href="/login"
              className="text-xs font-medium text-neutral-400 hover:text-white transition-colors px-2.5 py-1"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="btn-asym text-xs"
            >
              <span>Get started</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <main className="flex-1 relative z-10">
        <section className="max-w-6xl mx-auto px-6 pt-16 sm:pt-20 pb-16 flex flex-col items-center text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-orange-500/25 bg-orange-500/10 text-[11px] font-mono text-orange-300 mb-6">
            <Network className="w-3 h-3 text-orange-400" />
            <span>Hybrid AST graph + LLM code review engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white max-w-3xl leading-[1.12]">
            Automated code reviews that reason over your <span className="highlight">entire codebase</span>.
          </h1>

          <p className="mt-4 text-xs sm:text-sm text-neutral-400 max-w-xl leading-relaxed">
            ReviewPilot maps your abstract syntax tree in Neo4j to identify callers, callees, and broken contracts across pull requests with deep graph blast radius analysis.
          </p>

          {/* Action Buttons */}
          <div className="mt-7 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/login"
              className="btn-asym text-xs w-full sm:w-auto"
            >
              <span>Connect repository</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/docs"
              className="btn-asym-mirror text-xs w-full sm:w-auto"
            >
              <span>Read integration guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Provider compatibility indicator */}
          <div className="mt-6 flex items-center space-x-2 text-[11px] font-mono text-neutral-500">
            <span>Supports zero-config webhooks for</span>
            <span className="text-neutral-300">GitHub Apps</span>
            <span>&</span>
            <span className="text-neutral-300">Bitbucket Cloud</span>
          </div>

          {/* ── Hero Terminal Card ── */}
          <div id="terminal-preview" className="mt-12 w-full max-w-3xl">
            <div className="card-chai p-0 overflow-hidden text-left border border-white/10 shadow-[0_0_25px_-5px_rgba(246,130,31,0.15)]">
              {/* Terminal Titlebar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-[11px] text-neutral-400">
                    reviewpilot: ast-blast-radius-check #142
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-orange-400 px-2 py-0.5 rounded border border-orange-500/20 bg-orange-500/5">
                    Neo4j AST Active
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Graph Synced</span>
                  </span>
                </div>
              </div>

              {/* Terminal Code Findings Body */}
              <div className="p-4 sm:p-5 space-y-2.5 font-mono text-xs">
                <div className="p-3 rounded-lg border border-red-500/25 bg-red-500/10 text-neutral-300">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-red-400 text-xs">Critical: Missing parameterization in SQL query</span>
                    <span className="text-[10px] text-neutral-400">src/services/repo.ts:48</span>
                  </div>
                  <p className="mt-1 text-neutral-300 text-[11px] leading-relaxed">
                    User parameter is concatenated directly into query builder without sanitization. Call graph shows this endpoint receives unauthenticated webhook payloads.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-orange-500/25 bg-orange-500/10 text-neutral-300">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-orange-400 text-xs">Blast Radius: Contract signature changed</span>
                    <span className="text-[10px] text-neutral-400">14 Downstream Callers</span>
                  </div>
                  <p className="mt-1 text-neutral-300 text-[11px] leading-relaxed">
                    Function <code className="text-orange-300">validateWorkspaceSession()</code> parameter order changed. Traversed call-graph identified 2 callers in other services missing optional params.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-white/10 bg-white/[0.02] text-neutral-300">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-neutral-200 text-xs">Notice: Schema validation detected</span>
                    <span className="text-[10px] text-neutral-500">src/schemas/user.ts:12</span>
                  </div>
                  <p className="mt-1 text-neutral-400 text-[11px] leading-relaxed">
                    Zod payload validation matches expected route specification. No structural regression detected in symbol registry.
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                  <span>Review completed in 12.4s</span>
                  <span className="text-orange-400/80">AST nodes traversed: 1,842</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features Section ── */}
        <section id="features" className="max-w-6xl mx-auto px-6 py-16 border-t border-white/10">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              Why AST graphs outperform naive LLM reviews
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto">
              Most AI review bots only read the isolated git diff. ReviewPilot queries your repository graph in Neo4j to catch cross-file side effects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-chai p-5 space-y-2.5">
              <div className="w-8 h-8 rounded-lg border border-orange-500/30 bg-orange-500/10 flex items-center justify-center text-orange-400">
                <Network className="w-4 h-4" />
              </div>
              <h3 className="font-montserrat text-xs font-semibold text-white">
                Cross-file blast radius
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                When a function signature changes in one file, ReviewPilot queries Neo4j to find every caller across all modules, even ones not touched in the PR.
              </p>
            </div>

            <div className="card-chai p-5 space-y-2.5">
              <div className="w-8 h-8 rounded-lg border border-orange-500/30 bg-orange-500/10 flex items-center justify-center text-orange-400">
                <TreePine className="w-4 h-4" />
              </div>
              <h3 className="font-montserrat text-xs font-semibold text-white">
                Tree-sitter precision
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Native parsing for TypeScript, JavaScript, Python, and Go parses functions, classes, and exported symbols with zero regex fragility.
              </p>
            </div>

            <div className="card-chai p-5 space-y-2.5">
              <div className="w-8 h-8 rounded-lg border border-orange-500/30 bg-orange-500/10 flex items-center justify-center text-orange-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-montserrat text-xs font-semibold text-white">
                Inline GitHub & Bitbucket comments
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Zero tab switching. Reviews are posted directly on the exact line in GitHub or Bitbucket with explanations and code suggestions.
              </p>
            </div>
          </div>
        </section>

        {/* ── Setup in 3 Steps Section ── */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-16 border-t border-white/10">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              Setup in three simple steps
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-neutral-400">
              Get automated code reviews running across your workspace in less than five minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-chai p-5 space-y-2">
              <span className="font-mono text-xs text-orange-400 font-medium">01</span>
              <h3 className="font-montserrat text-xs font-semibold text-white">
                Install GitHub or Bitbucket App
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Link your GitHub App or Bitbucket Cloud workspace. Your repositories and webhook events synchronize automatically.
              </p>
            </div>

            <div className="card-chai p-5 space-y-2">
              <span className="font-mono text-xs text-orange-400 font-medium">02</span>
              <h3 className="font-montserrat text-xs font-semibold text-white">
                Automatic AST graph indexing
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                ReviewPilot clones the default branch, runs Tree-sitter parsers, and creates your persistent Neo4j code knowledge graph.
              </p>
            </div>

            <div className="card-chai p-5 space-y-2">
              <span className="font-mono text-xs text-orange-400 font-medium">03</span>
              <h3 className="font-montserrat text-xs font-semibold text-white">
                Open a pull request
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Push code as usual. Webhook triggers multi-stage AST analysis and posts inline findings directly to the pull request.
              </p>
            </div>
          </div>
        </section>

        {/* ── Final Call to Action ── */}
        <section className="max-w-6xl mx-auto px-6 py-16 border-t border-white/10">
          <div className="card-chai p-8 sm:p-10 text-center space-y-4">
            <div className="max-w-md mx-auto space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                Ship safer code with continuous AST review
              </h2>
              <p className="text-xs text-neutral-400">
                Prevent logic bugs and security flaws before they hit production.
              </p>
            </div>
            <div>
              <Link
                href="/login"
                className="btn-asym text-xs inline-flex"
              >
                <span>Connect your first repository</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Enterprise Footer ── */}
      <footer className="border-t border-white/10 py-6 px-6 bg-[#0c0e12]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded border border-orange-500/30 bg-orange-500/10 flex items-center justify-center text-orange-400">
              <GitPullRequest className="w-3 h-3" />
            </div>
            <span className="font-brand font-medium text-white">ReviewPilot<span className="text-[#F6821F]">.</span></span>
            <span>&bull;</span>
            <span className="font-mono text-[11px]">Automated Code Review Engine</span>
          </div>

          <div className="flex items-center space-x-5 font-mono text-[11px]">
            <Link href="/docs" className="text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1">
              <span>Developer Docs</span>
              <ArrowUpRight className="w-3 h-3 opacity-70" />
            </Link>
            <Link href="/docs/github-setup" className="hover:text-white transition-colors">GitHub Setup</Link>
            <Link href="/docs/bitbucket-setup" className="hover:text-white transition-colors">Bitbucket Setup</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
