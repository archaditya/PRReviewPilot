import Link from 'next/link';
import { ArrowRight, CheckCircle2, Shield, Zap, GitPullRequest, GitBranch, ArrowUpRight } from 'lucide-react';

export default function DocsOverviewPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-white">
          Documentation & integration guide
        </h1>
        <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
          Welcome to the official developer guide for ReviewPilot. Connect your GitHub and Bitbucket Cloud repositories to run automated PR reviews powered by our <span className="highlight">ast blast radius query engine</span>.
        </p>
      </div>

      {/* Quickstart steps */}
      <div className="space-y-4">
        <h2 className="font-montserrat text-sm font-medium text-white uppercase tracking-wider text-xs">
          Quickstart in 3 minutes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-chai p-5 space-y-2">
            <span className="font-mono text-xs text-neutral-500">01</span>
            <h3 className="font-montserrat font-medium text-white text-xs">Connect git provider</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Install the GitHub App or link your Bitbucket Cloud OAuth consumer keys.
            </p>
          </div>

          <div className="card-chai p-5 space-y-2">
            <span className="font-mono text-xs text-neutral-500">02</span>
            <h3 className="font-montserrat font-medium text-white text-xs">Select repositories</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Enable monitoring. Tree-sitter parses the default branch and writes the graph to Neo4j.
            </p>
          </div>

          <div className="card-chai p-5 space-y-2">
            <span className="font-mono text-xs text-neutral-500">03</span>
            <h3 className="font-montserrat font-medium text-white text-xs">Open a pull request</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Webhooks fire automatically. In-depth comments appear directly on changed lines.
            </p>
          </div>
        </div>
      </div>

      {/* Integration Guides Links */}
      <div className="space-y-4">
        <h2 className="font-montserrat text-sm font-medium text-white uppercase tracking-wider text-xs">
          Integration manuals
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/docs/github-setup"
            className="card-chai p-5 flex items-center justify-between group hover:border-white/30 transition-colors"
          >
            <div>
              <h4 className="font-montserrat font-medium text-white text-sm group-hover:text-neutral-200 transition-colors">
                GitHub App integration guide
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Configure permissions, webhooks, and private keys for enterprise or personal orgs.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors shrink-0 ml-3" />
          </Link>

          <Link
            href="/docs/bitbucket-setup"
            className="card-chai p-5 flex items-center justify-between group hover:border-white/30 transition-colors"
          >
            <div>
              <h4 className="font-montserrat font-medium text-white text-sm group-hover:text-neutral-200 transition-colors">
                Bitbucket Cloud setup guide
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Create OAuth 2.0 consumer keys, configure workspace webhooks, and link repos.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors shrink-0 ml-3" />
          </Link>
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="card-chai p-6 space-y-3">
        <h3 className="font-montserrat font-medium text-sm text-white">How the review pipeline executes</h3>
        <p className="text-xs text-neutral-400 leading-relaxed">
          1. <strong>Webhook ingest:</strong> Pull request opened or synchronized event received via HMAC-SHA256 signature verification.
          <br />
          2. <strong>AST Diff resolution:</strong> Changed files and symbols extracted from Tree-sitter syntax trees.
          <br />
          3. <strong>Neo4j Graph traversal:</strong> Query caller hierarchy and blast radius across the indexed repository.
          <br />
          4. <strong>Gemini review generation:</strong> LLM prompt enriched with structural call graphs, typing definitions, and rules.
          <br />
          5. <strong>Inline commenting:</strong> Findings posted directly to GitHub PR review threads or Bitbucket comments.
        </p>
      </div>
    </div>
  );
}
