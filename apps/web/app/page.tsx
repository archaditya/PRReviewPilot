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
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 font-sans antialiased flex flex-col selection:bg-white/20">
      {/* ── Fixed Sticky Navigation ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-7 h-7 rounded-lg border border-white/15 bg-white/5 flex items-center justify-center text-white group-hover:border-white/30 transition-colors">
              <GitPullRequest className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-brand font-semibold text-base tracking-tight text-white block">
              ReviewPilot<span className="text-[#FF7D0C]">.</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-xs text-neutral-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
            <Link href="/docs/github-setup" className="hover:text-white transition-colors">GitHub App</Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="text-xs font-medium text-neutral-400 hover:text-white transition-colors px-3 py-1.5"
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
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-20 sm:pt-28 pb-20 flex flex-col items-center text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] font-mono text-neutral-300 mb-8">
            <Network className="w-3 h-3 text-neutral-400" />
            <span>Hybrid AST graph + LLM code review engine</span>
          </div>

          <h1 className="text-[40px] sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white max-w-4xl leading-[1.08]">
            Automated code reviews that reason over your entire codebase.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-neutral-400 max-w-2xl leading-relaxed">
            ReviewPilot maps your abstract syntax tree in Neo4j to identify callers, callees, and broken contracts across pull requests with <span className="highlight">deep graph blast radius analysis</span>.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
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
          <div className="mt-8 flex items-center space-x-2 text-xs font-mono text-neutral-500">
            <span>Supports zero-config webhooks for</span>
            <span className="text-neutral-300">GitHub Apps</span>
            <span>&</span>
            <span className="text-neutral-300">Bitbucket Cloud</span>
          </div>

          {/* ── Hero Terminal Card ── */}
          <div className="mt-14 w-full max-w-3xl">
            <div className="card-chai p-0 overflow-hidden text-left">
              {/* Terminal Titlebar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <span className="ml-2 font-mono text-[11px] text-neutral-500">
                    reviewpilot: ast-blast-radius-check #142
                  </span>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Graph synced</span>
                </span>
              </div>

              {/* Terminal Code Findings Body */}
              <div className="p-5 space-y-3 font-mono text-xs">
                <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-neutral-300">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-red-400">Critical: Missing parameterization in SQL query</span>
                    <span className="text-[10px] text-neutral-500">src/services/repo.ts:48</span>
                  </div>
                  <p className="mt-1 text-neutral-400 text-[11px] leading-relaxed">
                    User parameter is concatenated directly into query builder without sanitization. Call graph shows this endpoint receives unauthenticated webhook payloads.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-neutral-300">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-yellow-400">Warning: Unhandled promise rejection boundary</span>
                    <span className="text-[10px] text-neutral-500">src/jobs/index.ts:83</span>
                  </div>
                  <p className="mt-1 text-neutral-400 text-[11px] leading-relaxed">
                    Worker retry loop lacks top-level rejection catch. Unhandled exceptions will cause background process restart during heavy ingest.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-white/10 bg-white/[0.02] text-neutral-300">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-neutral-200">Notice: Clean schema validation detected</span>
                    <span className="text-[10px] text-neutral-500">src/schemas/user.ts:12</span>
                  </div>
                  <p className="mt-1 text-neutral-400 text-[11px] leading-relaxed">
                    Zod payload validation matches expected route specification. No structural regression detected in symbol registry.
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                  <span>Pipeline completed in 14.2s</span>
                  <span>AST symbols traversed: 1,842 nodes</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features Section ── */}
        <section id="features" className="max-w-6xl mx-auto px-6 py-20 border-t border-white/10">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-white">
              Why AST graphs outperform naive LLM reviews
            </h2>
            <p className="mt-2 text-sm text-neutral-400 max-w-xl mx-auto">
              Most AI review bots only read the isolated git diff. ReviewPilot queries your repository graph to understand downstream side effects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-chai p-6 space-y-3">
              <div className="w-8 h-8 rounded-lg border border-white/15 bg-white/5 flex items-center justify-center text-white">
                <Network className="w-4 h-4 text-neutral-300" />
              </div>
              <h3 className="font-montserrat text-sm font-medium text-white">
                Cross-file blast radius
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                When a function signature changes in one file, ReviewPilot queries Neo4j to find every caller across all modules, even ones not touched in the PR.
              </p>
            </div>

            <div className="card-chai p-6 space-y-3">
              <div className="w-8 h-8 rounded-lg border border-white/15 bg-white/5 flex items-center justify-center text-white">
                <TreePine className="w-4 h-4 text-neutral-300" />
              </div>
              <h3 className="font-montserrat text-sm font-medium text-white">
                Tree-sitter precision
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Native parsing for TypeScript, JavaScript, Python, and Go parses functions, classes, and exported symbols with zero regex fragility.
              </p>
            </div>

            <div className="card-chai p-6 space-y-3">
              <div className="w-8 h-8 rounded-lg border border-white/15 bg-white/5 flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4 text-neutral-300" />
              </div>
              <h3 className="font-montserrat text-sm font-medium text-white">
                Inline GitHub & Bitbucket comments
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Zero tab switching. Reviews are posted directly on the exact line in GitHub or Bitbucket with explanations and code suggestions.
              </p>
            </div>
          </div>
        </section>

        {/* ── Setup in 3 Steps Section ── */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20 border-t border-white/10">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-white">
              Setup in three simple steps
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              Get automated code reviews running across your workspace in less than five minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-chai p-6 space-y-3">
              <span className="font-mono text-xs text-neutral-500">Step 01</span>
              <h3 className="font-montserrat text-sm font-medium text-white">
                Install GitHub or Bitbucket integration
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Link your GitHub App or Bitbucket Cloud workspace. Your repositories and webhook events synchronize automatically.
              </p>
            </div>

            <div className="card-chai p-6 space-y-3">
              <span className="font-mono text-xs text-neutral-500">Step 02</span>
              <h3 className="font-montserrat text-sm font-medium text-white">
                Automatic AST graph indexing
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                ReviewPilot clones the default branch, runs Tree-sitter parsers, and creates your persistent Neo4j code knowledge graph.
              </p>
            </div>

            <div className="card-chai p-6 space-y-3">
              <span className="font-mono text-xs text-neutral-500">Step 03</span>
              <h3 className="font-montserrat text-sm font-medium text-white">
                Open a pull request
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Push code as usual. Webhook triggers multi-stage AST analysis and posts inline findings directly to the pull request.
              </p>
            </div>
          </div>
        </section>

        {/* ── Final Call to Action ── */}
        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/10">
          <div className="card-chai p-12 text-center space-y-6">
            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-white">
                Ship safer code with continuous AST review
              </h2>
              <p className="text-xs text-neutral-400">
                Join engineering teams using ReviewPilot to prevent logic bugs and security flaws before they hit production.
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
      <footer className="border-t border-white/10 py-8 px-6 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded border border-white/15 bg-white/5 flex items-center justify-center text-white">
              <GitPullRequest className="w-3 h-3 text-white" />
            </div>
            <span className="font-brand font-medium text-white">ReviewPilot<span className="text-[#FF7D0C]">.</span></span>
            <span>&bull;</span>
            <span className="font-mono text-[11px]">Automated Code Review Engine</span>
          </div>

          <div className="flex items-center space-x-6 font-mono text-[11px]">
            <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
            <Link href="/docs/github-setup" className="hover:text-white transition-colors">GitHub Setup</Link>
            <Link href="/docs/bitbucket-setup" className="hover:text-white transition-colors">Bitbucket Setup</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
