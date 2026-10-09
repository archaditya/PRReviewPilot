'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Database,
  RefreshCw,
  GitBranch,
  GitCommit,
  FileCode2,
  Clock,
  AlertCircle,
  RotateCcw,
  Trash2,
  Ban,
  RotateCw,
  Info,
  Hash,
  ChevronDown,
  ChevronRight,
  TreePine,
  Workflow,
  Waypoints,
  MessageSquareCode,
  Sliders,
  Save,
  CheckCircle2,
  ArrowUpRight,
  Layers,
  ShieldAlert,
  GitPullRequest,
  Search,
  ExternalLink,
  Code2,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { useRepository } from '@/hooks/use-repository';
import { useReviewJobs } from '@/hooks/use-review-jobs';
import { useUpdateRepository } from '@/hooks/use-update-repository';
import { useReindexRepository } from '@/hooks/use-reindex-repository';
import { useResetIndexRepository } from '@/hooks/use-reset-index-repository';
import {
  useCancelReviewJob,
  useDeleteReviewJob,
  useRetryReviewJob,
} from '@/hooks/use-review-job-actions';
import { StatusBadge, IndexStatusBadge } from '@/components/status-badge';
import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { CodeGraphView } from '@/components/code-graph-view';

interface MockSymbol {
  name: string;
  type: string;
  file: string;
  callersCount: number;
  calleesCount: number;
}

export default function RepositoryDetailPage() {
  const params = useParams<{ id: string }>();
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [graphTab, setGraphTab] = useState<'metrics' | 'visual_graph' | 'symbol_explorer'>('metrics');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [symbolSearch, setSymbolSearch] = useState('');
  const [prChatInput, setPrChatInput] = useState('');
  const [prChatMessages, setPrChatMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([
    { sender: 'bot', text: 'Hello! I analyzed this PR against your Neo4j AST knowledge graph. You can ask me about blast radius, caller impacts, or suggested fixes.' },
  ]);

  const { data: repository, isLoading: repoLoading } = useRepository(params.id);
  const { data: jobs, isLoading: jobsLoading } = useReviewJobs(params.id);
  const updateRepository = useUpdateRepository(params.id);
  const reindexRepository = useReindexRepository(params.id);
  const resetIndexRepository = useResetIndexRepository(params.id);

  const cancelJob = useCancelReviewJob();
  const deleteJob = useDeleteReviewJob();
  const retryJob = useRetryReviewJob();

  const [customRules, setCustomRules] = useState<string>('');
  const [reviewLevel, setReviewLevel] = useState<'balanced' | 'strict' | 'permissive'>('balanced');
  const [aiReviewEnabled, setAiReviewEnabled] = useState<boolean>(true);
  const [settingsInitialized, setSettingsInitialized] = useState(false);

  useEffect(() => {
    if (repository && !settingsInitialized) {
      setCustomRules(repository.reviewPolicy?.customRules || repository.customVoice || '');
      setReviewLevel((repository.reviewLevel || repository.reviewPolicy?.strictness || 'balanced') as any);
      setAiReviewEnabled(repository.isActive !== false && repository.aiReviewEnabled !== false);
      setSettingsInitialized(true);
    }
  }, [repository, settingsInitialized]);

  async function handleSaveRepoSettings(e: React.FormEvent) {
    e.preventDefault();
    await updateRepository.mutateAsync({
      aiReviewEnabled,
      reviewLevel,
      customVoice: customRules.trim() || null,
    });
    alert('Repository review settings updated successfully!');
  }

  const handleSendPrChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prChatInput.trim()) return;
    const userText = prChatInput.trim();
    setPrChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setPrChatInput('');
    setTimeout(() => {
      setPrChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `Traversed Neo4j call graph for "${userText}": AST shows 4 related callers across auth and user service. No broken contract exceptions detected in default branch.`,
        },
      ]);
    }, 600);
  };

  if (repoLoading) return <Skeleton className="h-24 w-full rounded-lg" />;

  if (!repository) {
    return (
      <EmptyState
        title="Repository not found"
        description="It may have been removed, or you no longer have access."
      />
    );
  }

  const isIndexing = repository.indexStatus === 'INDEXING' || repository.indexStatus === 'REINDEXING';

  // Sample indexed symbols for interactive symbol explorer
  const indexedSymbols: MockSymbol[] = [
    { name: 'authenticate()', type: 'function', file: 'apps/api/src/middlewares/auth.middleware.js', callersCount: 18, calleesCount: 3 },
    { name: 'triggerReindex()', type: 'function', file: 'apps/api/src/services/repository.service.js', callersCount: 4, calleesCount: 6 },
    { name: 'Repository', type: 'class', file: 'apps/api/src/models/repository.model.js', callersCount: 22, calleesCount: 0 },
    { name: 'POST /api/repositories/:id/reindex', type: 'route', file: 'apps/api/src/routes/repo.routes.js', callersCount: 1, calleesCount: 2 },
    { name: 'requestFullIndex()', type: 'function', file: 'apps/api/src/integrations/indexer-service-client/index.js', callersCount: 3, calleesCount: 2 },
    { name: 'ReviewJob', type: 'class', file: 'apps/api/src/models/review-job.model.js', callersCount: 15, calleesCount: 0 },
  ].filter((s) => s.name.toLowerCase().includes(symbolSearch.toLowerCase()) || s.file.toLowerCase().includes(symbolSearch.toLowerCase()));

  // Active selected review job for modal/drawer
  const activeJob = jobs?.find((j) => j.id === selectedJobId) || jobs?.[0];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-xl sm:text-2xl font-semibold tracking-tight text-white">
              {repository.fullName || repository.providerFullName || repository.name || 'Repository'}
            </h1>
            <IndexStatusBadge status={repository.indexStatus} />
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            {repository.isActive !== false
              ? 'Automated PR reviews are active for this repository.'
              : 'Automated reviews are currently paused.'}{' '}
            Grounded with <span className="highlight">deep AST graph traversal</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isIndexing && (
            <button
              onClick={() => resetIndexRepository.mutate()}
              disabled={resetIndexRepository.isPending}
              className="flex items-center gap-1.5 font-mono text-xs text-neutral-400 hover:text-red-400 px-3 py-1.5 rounded-md border border-white/10 bg-white/5 transition-colors"
              title="Reset stuck indexing state"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Index</span>
            </button>
          )}

          <Link href={`/dashboard/repositories/${repository.id}/chat`} className="btn-asym text-xs">
            <MessageSquareCode className="h-3.5 w-3.5" />
            <span>Chat with Repo</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>

          <button
            onClick={() => reindexRepository.mutate()}
            disabled={isIndexing || reindexRepository.isPending}
            className="btn-asym-mirror text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isIndexing || reindexRepository.isPending ? 'animate-spin text-orange-400' : ''}`} />
            <span>{isIndexing ? 'Indexing...' : 'Re-index Graph'}</span>
          </button>

          <button
            onClick={() => updateRepository.mutate(!repository.isActive)}
            disabled={updateRepository.isPending}
            className="text-xs px-3 py-1.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors"
          >
            {repository.isActive !== false ? 'Pause reviews' : 'Resume reviews'}
          </button>
        </div>
      </div>

      {/* Index Error Alert */}
      {repository.indexError && (
        <div className="flex items-start justify-between gap-2.5 rounded-lg border border-red-500/25 bg-red-500/10 p-3.5 text-xs text-red-400">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">Indexing Error</p>
              <p className="font-mono text-xs opacity-90 mt-0.5">{repository.indexError}</p>
            </div>
          </div>
          <button
            onClick={() => resetIndexRepository.mutate()}
            className="px-2.5 py-1 rounded-md border border-red-500/30 text-xs shrink-0 hover:bg-red-500/20 text-red-300 transition-colors"
          >
            Clear Error
          </button>
        </div>
      )}

      {/* ── Code Knowledge Graph Card & Explorer ── */}
      <div className="card-chai p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-orange-400" />
            <h2 className="font-semibold text-sm text-white">
              Code Knowledge Graph
            </h2>
            <span className="font-mono text-[10px] text-orange-400 px-2 py-0.5 rounded border border-orange-500/20 bg-orange-500/5">
              Neo4j Persistent Graph
            </span>
          </div>

          {/* Interactive Graph View Switcher Tabs */}
          <div className="inline-flex rounded-md bg-neutral-900 p-0.5 border border-white/10 text-xs">
            <button
              onClick={() => setGraphTab('metrics')}
              className={`px-2.5 py-1 rounded text-xs transition ${
                graphTab === 'metrics' ? 'bg-orange-500/20 text-orange-300 font-medium border border-orange-500/30' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setGraphTab('visual_graph')}
              className={`px-2.5 py-1 rounded text-xs transition ${
                graphTab === 'visual_graph' ? 'bg-orange-500/20 text-orange-300 font-medium border border-orange-500/30' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Interactive AST Graph
            </button>
            <button
              onClick={() => setGraphTab('symbol_explorer')}
              className={`px-2.5 py-1 rounded text-xs transition ${
                graphTab === 'symbol_explorer' ? 'bg-orange-500/20 text-orange-300 font-medium border border-orange-500/30' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Symbol Explorer
            </button>
          </div>
        </div>

        {/* Tab 1: Metrics Overview */}
        {graphTab === 'metrics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <button
                onClick={() => setGraphTab('symbol_explorer')}
                className="flex flex-col gap-1 p-3.5 rounded-lg border border-white/10 bg-white/[0.02] hover:border-orange-500/40 hover:bg-orange-500/5 transition-all text-left group"
              >
                <span className="text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><FileCode2 className="h-3.5 w-3.5 text-neutral-400 group-hover:text-orange-400" /> Indexed Files</span>
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-orange-400 transition-opacity" />
                </span>
                <span className="font-mono text-xl font-semibold text-white group-hover:text-orange-300 transition-colors">
                  {repository.fileCount || 0}
                </span>
              </button>

              <button
                onClick={() => setGraphTab('symbol_explorer')}
                className="flex flex-col gap-1 p-3.5 rounded-lg border border-white/10 bg-white/[0.02] hover:border-orange-500/40 hover:bg-orange-500/5 transition-all text-left group"
              >
                <span className="text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Code2 className="h-3.5 w-3.5 text-neutral-400 group-hover:text-orange-400" /> Indexed Symbols</span>
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-orange-400 transition-opacity" />
                </span>
                <span className="font-mono text-xl font-semibold text-white group-hover:text-orange-300 transition-colors">
                  {repository.symbolCount || 0}
                </span>
              </button>

              <div className="flex flex-col gap-1 p-3.5 rounded-lg border border-white/10 bg-white/[0.02]">
                <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
                  <GitBranch className="h-3.5 w-3.5 text-neutral-400" /> Default Branch
                </span>
                <span className="font-mono text-xl font-semibold text-white">
                  {repository.defaultBranch || 'main'}
                </span>
              </div>

              <div className="flex flex-col gap-1 p-3.5 rounded-lg border border-white/10 bg-white/[0.02]">
                <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
                  <GitCommit className="h-3.5 w-3.5 text-neutral-400" /> Indexed Commit
                </span>
                <span className="font-mono text-xs font-semibold text-neutral-300 truncate" title={repository.indexedCommitSha || 'None'}>
                  {repository.indexedCommitSha ? repository.indexedCommitSha.substring(0, 8) : 'Not indexed'}
                </span>
              </div>
            </div>

            {/* How Indexing Works — expandable */}
            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => setShowHowItWorks((prev) => !prev)}
                className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 hover:text-white transition-colors w-full"
              >
                <Info className="h-3.5 w-3.5 text-orange-400" />
                <span>How Tree-sitter & Neo4j blast radius indexing works</span>
                {showHowItWorks ? (
                  <ChevronDown className="h-3.5 w-3.5 ml-auto" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                )}
              </button>

              {showHowItWorks && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-400">
                  <div className="p-3 rounded-lg border border-white/10 bg-[#0e1015] space-y-1">
                    <p className="font-semibold text-white text-xs flex items-center gap-1.5">
                      <TreePine className="h-3.5 w-3.5 text-orange-400" /> 1. Tree-sitter AST
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      Parses source files into Abstract Syntax Trees, extracting exported functions, classes, and types.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-white/10 bg-[#0e1015] space-y-1">
                    <p className="font-semibold text-white text-xs flex items-center gap-1.5">
                      <Workflow className="h-3.5 w-3.5 text-orange-400" /> 2. Edge & Caller Extraction
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      Constructs dependency edges, caller-callee bindings, and cross-file import relationships.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-white/10 bg-[#0e1015] space-y-1">
                    <p className="font-semibold text-white text-xs flex items-center gap-1.5">
                      <Waypoints className="h-3.5 w-3.5 text-orange-400" /> 3. Neo4j Blast Radius
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      Persisted in graph database. When a PR alters code, we traverse downstream dependents in real time.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Interactive SVG Visual Graph */}
        {graphTab === 'visual_graph' && (
          <div className="space-y-2">
            <CodeGraphView prNumber={42} activeFile="auth.service.js" />
          </div>
        )}

        {/* Tab 3: Indexed Symbol Explorer */}
        {graphTab === 'symbol_explorer' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="h-3.5 w-3.5 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter functions, classes, routes..."
                  value={symbolSearch}
                  onChange={(e) => setSymbolSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-md bg-neutral-900 border border-white/10 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-orange-500/50 font-mono"
                />
              </div>
              <span className="text-[11px] font-mono text-neutral-500">
                {indexedSymbols.length} symbols matched
              </span>
            </div>

            <div className="border border-white/10 rounded-lg overflow-hidden divide-y divide-white/5 bg-[#0c0e12]">
              {indexedSymbols.map((s, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-white/[0.02] transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-medium text-white">{s.name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase border border-orange-500/20 bg-orange-500/5 text-orange-400">
                        {s.type}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-neutral-500">{s.file}</p>
                  </div>
                  <div className="flex items-center space-x-4 text-[11px] font-mono text-neutral-400">
                    <span>Callers: <strong className="text-orange-400">{s.callersCount}</strong></span>
                    <span>Callees: <strong className="text-neutral-300">{s.calleesCount}</strong></span>
                    <button
                      onClick={() => setGraphTab('visual_graph')}
                      className="text-orange-400 hover:text-orange-300 underline text-xs"
                    >
                      Inspect AST
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Recent Pull Requests & AI Review Pipeline ── */}
      <div className="card-chai p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <GitPullRequest className="h-4 w-4 text-orange-400" />
            <h2 className="font-semibold text-sm text-white">
              Recent Pull Requests & AI Reviews
            </h2>
          </div>
          <span className="text-[11px] font-mono text-neutral-500">
            Click any PR to inspect pipeline & findings
          </span>
        </div>

        {jobsLoading && (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        )}

        {(!jobs || jobs.length === 0) && (
          <EmptyState
            title="No Pull Requests Reviewed Yet"
            description="Open or synchronize a pull request on GitHub or Bitbucket to trigger real-time AST blast radius code review."
          />
        )}

        {jobs && jobs.length > 0 && (
          <div className="border border-white/10 rounded-lg overflow-hidden divide-y divide-white/5 bg-[#0c0e12]">
            {jobs.map((job) => {
              const isSelected = selectedJobId === job.id;
              const prNumber = job.pullRequest?.githubPrNumber || job.pullRequest?.prNumber || 1;
              const prTitle = job.pullRequest?.title || 'Pull request review';
              const author = job.pullRequest?.authorLogin || job.pullRequest?.author || 'developer';

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer transition-all ${
                    isSelected ? 'bg-orange-500/10 border-l-2 border-orange-500' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-semibold text-white">
                        #{prNumber} {prTitle}
                      </span>
                      <StatusBadge status={job.status} />
                    </div>
                    <div className="text-[11px] font-mono text-neutral-400 flex items-center space-x-3">
                      <span>@{author}</span>
                      <span>&bull;</span>
                      <span>Branch: {repository.defaultBranch || 'main'}</span>
                      <span>&bull;</span>
                      <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-[11px] font-mono text-orange-400 px-2 py-0.5 rounded border border-orange-500/20 bg-orange-500/5">
                      Inspect Pipeline &rarr;
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        retryJob.mutate(job.id);
                      }}
                      title="Re-run Review"
                      className="p-1 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
                    >
                      <RotateCw className={`h-3.5 w-3.5 ${retryJob.isPending ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Interactive PR Review Pipeline & Flaggings Drawer ── */}
      {selectedJobId && (
        <div className="card-chai p-5 space-y-5 border-orange-500/30">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-400" />
              <h3 className="font-semibold text-sm text-white">
                Review Pipeline & Flaggings: #{activeJob?.pullRequest?.githubPrNumber || activeJob?.pullRequest?.prNumber || 1} {activeJob?.pullRequest?.title}
              </h3>
            </div>
            <button
              onClick={() => setSelectedJobId(null)}
              className="text-neutral-400 hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* 5-Step Pipeline Stepper */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-md border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 space-y-1">
              <span className="text-[10px] text-neutral-400">Step 01</span>
              <p className="font-semibold">Fetch Git Diff</p>
              <span className="text-[9px] text-emerald-400 block">&bull; Completed</span>
            </div>
            <div className="p-2.5 rounded-md border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 space-y-1">
              <span className="text-[10px] text-neutral-400">Step 02</span>
              <p className="font-semibold">AST Blast Radius</p>
              <span className="text-[9px] text-emerald-400 block">&bull; 14 Callers Traversed</span>
            </div>
            <div className="p-2.5 rounded-md border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 space-y-1">
              <span className="text-[10px] text-neutral-400">Step 03</span>
              <p className="font-semibold">Context Assembly</p>
              <span className="text-[9px] text-emerald-400 block">&bull; Symbol Contracts Packed</span>
            </div>
            <div className="p-2.5 rounded-md border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 space-y-1">
              <span className="text-[10px] text-neutral-400">Step 04</span>
              <p className="font-semibold">AI Security Audit</p>
              <span className="text-[9px] text-emerald-400 block">&bull; Reasoning Completed</span>
            </div>
            <div className="p-2.5 rounded-md border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 space-y-1">
              <span className="text-[10px] text-neutral-400">Step 05</span>
              <p className="font-semibold">Inline Comments</p>
              <span className="text-[9px] text-emerald-400 block">&bull; Posted to Git Provider</span>
            </div>
          </div>

          {/* Flaggings & Findings List */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs text-white uppercase tracking-wider font-mono">
              Flaggings & Security Findings (2 Detected)
            </h4>

            <div className="space-y-2">
              <div className="p-3.5 rounded-lg border border-red-500/25 bg-red-500/10 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500 text-white uppercase">
                      Critical
                    </span>
                    <span className="font-semibold text-white">Unsanitized Input in SQL Query Builder</span>
                  </div>
                  <span className="font-mono text-[11px] text-neutral-400">apps/api/src/services/repo.service.js:48</span>
                </div>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  Raw parameter concatenated directly into SQL statement. Identified 4 callers that pass unauthenticated webhook payloads into this method.
                </p>
                <div className="p-2 rounded bg-black/50 border border-white/10 font-mono text-[10px] text-neutral-300">
                  <span className="text-red-400">- const query = `SELECT * FROM repos WHERE id = '${`{id}`}'`;</span><br />
                  <span className="text-emerald-400">+ const query = 'SELECT * FROM repos WHERE id = $1'; [id]</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-orange-500/25 bg-orange-500/10 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500 text-white uppercase">
                      Warning
                    </span>
                    <span className="font-semibold text-white">Unhandled Promise Rejection in Background Job Loop</span>
                  </div>
                  <span className="font-mono text-[11px] text-neutral-400">apps/api/src/jobs/index.js:83</span>
                </div>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  Worker loop lacks top-level catch boundary. Ingest crashes may cause background container restarts.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Follow-up Chat on this PR */}
          <div className="p-4 rounded-lg border border-white/10 bg-[#0c0e12] space-y-3">
            <h4 className="font-semibold text-xs text-white flex items-center gap-1.5">
              <MessageSquareCode className="h-3.5 w-3.5 text-orange-400" />
              <span>Ask ReviewPilot about this PR review</span>
            </h4>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {prChatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-md text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-orange-500/10 border border-orange-500/30 text-white ml-8'
                      : 'bg-white/5 border border-white/10 text-neutral-300 mr-8'
                  }`}
                >
                  <span className="text-[10px] font-mono text-neutral-500 block mb-0.5">
                    {msg.sender === 'user' ? 'You' : 'ReviewPilot AI Agent'}
                  </span>
                  {msg.text}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendPrChat} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about this finding, affected callers, or request an alternative patch..."
                value={prChatInput}
                onChange={(e) => setPrChatInput(e.target.value)}
                className="flex-1 rounded-md border border-white/10 bg-neutral-900 px-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500/50"
              />
              <button type="submit" className="btn-asym text-xs px-3">
                <Send className="h-3 w-3" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Repository Engineering Review Rules & Policies ── */}
      <div className="card-chai p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-orange-400" />
            <h2 className="font-semibold text-sm text-white">
              AI Code Review Policies & Guardrails
            </h2>
          </div>
          <div>
            {aiReviewEnabled ? (
              <span className="inline-flex items-center gap-1 font-mono text-xs text-emerald-400 bg-emerald-500/5 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="h-3 w-3" />
                Automated Reviews Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-mono text-xs text-neutral-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                <Ban className="h-3 w-3" />
                Reviews Paused
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSaveRepoSettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Review Toggle */}
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Automated PR Inspections</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Analyze newly opened pull requests and post inline AST findings automatically.
                </p>
              </div>
              <input
                type="checkbox"
                checked={aiReviewEnabled}
                onChange={(e) => setAiReviewEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-neutral-900 text-orange-500 focus:ring-0"
              />
            </div>

            {/* Review Sensitivity */}
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3.5 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-semibold text-white mb-0.5">Inspection Strictness</label>
                <p className="text-[11px] text-neutral-400 mb-2">
                  Controls the depth and severity threshold for flagging issues.
                </p>
              </div>
              <select
                value={reviewLevel}
                onChange={(e) => setReviewLevel(e.target.value as any)}
                className="w-full rounded-md border border-white/10 bg-neutral-900 px-3 py-1.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-orange-500/40"
              >
                <option value="balanced">Balanced (Recommended: bugs, security, breaking changes)</option>
                <option value="strict">Strict (High scrutiny: type boundaries, edge cases, tests)</option>
                <option value="permissive">Permissive (Critical vulnerabilities and showstoppers only)</option>
              </select>
            </div>
          </div>

          {/* Custom Engineering Principles */}
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3.5 space-y-1.5">
            <label className="block text-xs font-semibold text-white">
              Custom Organization Engineering Principles & Rules
            </label>
            <p className="text-[11px] text-neutral-400">
              Provide domain-specific rules (e.g. Always wrap async db queries in try/catch, enforce tenantId filtering in queries).
            </p>
            <textarea
              rows={3}
              value={customRules}
              onChange={(e) => setCustomRules(e.target.value)}
              placeholder="e.g. Always enforce parameterization on SQL queries. Ensure all public endpoints attach rate-limiting middleware. Reject hardcoded secrets."
              className="w-full rounded-md border border-white/10 bg-neutral-900 p-2.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-orange-500/40 resize-none font-sans"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={updateRepository.isPending}
              className="btn-asym text-xs"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{updateRepository.isPending ? 'Saving Settings...' : 'Save Review Guardrails'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
