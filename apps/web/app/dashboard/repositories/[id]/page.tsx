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
  Play,
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
  Bot,
  Save,
  CheckCircle2,
  ArrowUpRight,
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
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function RepositoryDetailPage() {
  const params = useParams<{ id: string }>();
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const { data: repository, isLoading: repoLoading } = useRepository(params.id);
  const { data: jobs, isLoading: jobsLoading } = useReviewJobs(params.id);
  const updateRepository = useUpdateRepository(params.id);
  const reindexRepository = useReindexRepository(params.id);
  const resetIndexRepository = useResetIndexRepository(params.id);

  const cancelJob = useCancelReviewJob();
  const deleteJob = useDeleteReviewJob();
  const retryJob = useRetryReviewJob();

  const [customVoice, setCustomVoice] = useState<string>('');
  const [reviewLevel, setReviewLevel] = useState<'balanced' | 'strict' | 'permissive'>('balanced');
  const [aiReviewEnabled, setAiReviewEnabled] = useState<boolean>(true);
  const [settingsInitialized, setSettingsInitialized] = useState(false);

  useEffect(() => {
    if (repository && !settingsInitialized) {
      setCustomVoice(repository.customVoice || '');
      setReviewLevel(repository.reviewLevel || 'balanced');
      setAiReviewEnabled(repository.aiReviewEnabled !== false);
      setSettingsInitialized(true);
    }
  }, [repository, settingsInitialized]);

  async function handleSaveRepoSettings(e: React.FormEvent) {
    e.preventDefault();
    await updateRepository.mutateAsync({
      aiReviewEnabled,
      reviewLevel,
      customVoice: customVoice.trim() || null,
    });
    alert('Repository review settings updated successfully!');
  }

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

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-xl sm:text-2xl font-semibold tracking-tight text-white">{repository.fullName}</h1>
            <IndexStatusBadge status={repository.indexStatus} />
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            {repository.isActive ? 'Automated PR reviews are enabled for this repository.' : 'Automated reviews are currently paused.'} Grounded with <span className="highlight">deep ast graph traversal</span>.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
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
            <RefreshCw className={`h-3.5 w-3.5 ${isIndexing || reindexRepository.isPending ? 'animate-spin' : ''}`} />
            <span>{isIndexing ? 'Indexing...' : 'Re-index Graph'}</span>
          </button>

          <button
            onClick={() => updateRepository.mutate(!repository.isActive)}
            disabled={updateRepository.isPending}
            className="text-xs px-3 py-1.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors"
          >
            {repository.isActive ? 'Pause reviews' : 'Resume reviews'}
          </button>
        </div>
      </div>

      {/* Index Error Alert */}
      {repository.indexError && (
        <div className="flex items-start justify-between gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-300">Indexing Failed</p>
              <p className="font-mono text-xs opacity-90 mt-0.5">{repository.indexError}</p>
            </div>
          </div>
          <button
            onClick={() => resetIndexRepository.mutate()}
            className="px-2.5 py-1 rounded-md border border-red-500/30 text-xs shrink-0 hover:bg-red-500/10 text-red-300"
          >
            Clear Error
          </button>
        </div>
      )}

      {/* Code Knowledge Graph Card */}
      <div className="card-chai p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-neutral-400" />
            <h2 className="font-montserrat font-medium text-sm text-white">
              Code Knowledge Graph
            </h2>
          </div>
          <span className="font-mono text-[11px] text-neutral-500">Neo4j Persistent Graph</span>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex flex-col gap-1 p-3 rounded-lg border border-white/5 bg-white/[0.01]">
            <span className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
              <FileCode2 className="h-3 w-3" /> Indexed Files
            </span>
            <span className="font-mono text-lg font-medium text-white">{repository.fileCount || 0}</span>
          </div>

          <div className="flex flex-col gap-1 p-3 rounded-lg border border-white/5 bg-white/[0.01]">
            <span className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
              <Database className="h-3 w-3" /> Indexed Symbols
            </span>
            <span className="font-mono text-lg font-medium text-white">{repository.symbolCount || 0}</span>
          </div>

          <div className="flex flex-col gap-1 p-3 rounded-lg border border-white/5 bg-white/[0.01]">
            <span className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
              <GitBranch className="h-3 w-3" /> Default Branch
            </span>
            <span className="font-mono text-lg font-medium text-white">{repository.defaultBranch || 'main'}</span>
          </div>

          <div className="flex flex-col gap-1 p-3 rounded-lg border border-white/5 bg-white/[0.01]">
            <span className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
              <GitCommit className="h-3 w-3" /> Indexed Commit
            </span>
            <span className="font-mono text-xs font-medium text-neutral-300 truncate" title={repository.indexedCommitSha || 'None'}>
              {repository.indexedCommitSha ? repository.indexedCommitSha.substring(0, 8) : 'Not indexed'}
            </span>
          </div>
        </div>

        {/* How Indexing Works — expandable section */}
        <div className="pt-3 border-t border-white/10">
          <button
            onClick={() => setShowHowItWorks((prev) => !prev)}
            className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 hover:text-white transition-colors w-full"
          >
            <Info className="h-3.5 w-3.5" />
            <span>How indexing works</span>
            {showHowItWorks ? (
              <ChevronDown className="h-3.5 w-3.5 ml-auto" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 ml-auto" />
            )}
          </button>

          {showHowItWorks && (
            <div className="mt-4 flex flex-col gap-3 text-xs text-neutral-400">
              {/* Pipeline stages */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                  <div className="flex items-center gap-1.5 font-montserrat font-medium text-white text-xs">
                    <TreePine className="h-3.5 w-3.5 text-neutral-400" />
                    1. Parse (Tree-sitter)
                  </div>
                  <p className="leading-relaxed text-[11px]">
                    Each source file is parsed using Tree-sitter to build an AST (Abstract Syntax Tree), providing syntax-level parsing for functions, classes, imports, and exports.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                  <div className="flex items-center gap-1.5 font-montserrat font-medium text-white text-xs">
                    <Workflow className="h-3.5 w-3.5 text-neutral-400" />
                    2. Extract Symbols
                  </div>
                  <p className="leading-relaxed text-[11px]">
                    From each AST, we extract symbols (functions, classes, variables) and edges (calls, imports, exports) as nodes and relationships.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                  <div className="flex items-center gap-1.5 font-montserrat font-medium text-white text-xs">
                    <Waypoints className="h-3.5 w-3.5 text-neutral-400" />
                    3. Build Graph (Neo4j)
                  </div>
                  <p className="leading-relaxed text-[11px]">
                    Symbols and edges are stored in Neo4j as a persistent code knowledge graph, powering blast-radius analysis during automated PR review.
                  </p>
                </div>
              </div>

              {/* Incremental indexing note */}
              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                <Hash className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-montserrat font-medium text-white text-xs">Incremental indexing with SHA-256</p>
                  <p className="leading-relaxed mt-1 text-[11px] text-neutral-400">
                    File contents are hashed. On subsequent pushes to the default branch, only changed files are re-parsed. Unchanged files are skipped, and deleted files have their subgraph pruned.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {repository.indexedAt && (
          <div className="pt-2 border-t border-white/10 flex items-center gap-1 text-[11px] font-mono text-neutral-500">
            <Clock className="h-3 w-3" />
            <span>Last indexed: {new Date(repository.indexedAt).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* AI Review & Bot Settings Card */}
      <div className="card-chai p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-neutral-400" />
            <h2 className="font-montserrat font-medium text-sm text-white">
              AI Review & Repository Automation Settings
            </h2>
          </div>
          <div>
            {aiReviewEnabled ? (
              <span className="inline-flex items-center gap-1 font-mono text-xs text-emerald-400 bg-emerald-500/5 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="h-3 w-3" />
                Reviews Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-mono text-xs text-neutral-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                <Ban className="h-3 w-3" />
                Reviews Muted
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSaveRepoSettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Review Toggle */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white">Automated pull request reviews</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  When enabled, bot generates findings and summary comments on newly opened PRs.
                </p>
              </div>
              <input
                type="checkbox"
                checked={aiReviewEnabled}
                onChange={(e) => setAiReviewEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-neutral-900 text-white focus:ring-0"
              />
            </div>

            {/* Review Sensitivity */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-medium text-white mb-0.5">Review sensitivity level</label>
                <p className="text-[11px] text-neutral-400 mb-2">
                  Controls the depth and strictness of findings reported on PRs.
                </p>
              </div>
              <select
                value={reviewLevel}
                onChange={(e) => setReviewLevel(e.target.value as any)}
                className="w-full rounded-md border border-white/10 bg-neutral-900 px-3 py-1.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-white/30"
              >
                <option value="balanced">Balanced (Recommended: bugs, security, breaking changes)</option>
                <option value="strict">Strict (Deep checks, edge cases, tests, typing)</option>
                <option value="permissive">Permissive (Critical vulnerabilities and showstoppers only)</option>
              </select>
            </div>
          </div>

          {/* Custom Voice for Social Media */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-1.5">
            <label className="block text-xs font-medium text-white">
              Custom social media voice & tone
            </label>
            <p className="text-[11px] text-neutral-400">
              Define the personality and technical description for social posts generated from this repository.
            </p>
            <textarea
              rows={2}
              value={customVoice}
              onChange={(e) => setCustomVoice(e.target.value)}
              placeholder="e.g. A cloud-native file storage platform, technical, developer-focused, architecture-oriented"
              className="w-full rounded-md border border-white/10 bg-neutral-900 p-2.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-white/30 resize-none font-sans"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={updateRepository.isPending}
              className="btn-asym text-xs"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{updateRepository.isPending ? 'Saving Settings...' : 'Save Repository Settings'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Review Activity */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-montserrat font-medium text-sm text-white">
            Review Activity
          </h2>
        </div>

        {jobsLoading && (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        )}

        {jobs && jobs.length === 0 && (
          <EmptyState
            title="No reviews yet"
            description="Open a pull request on this repository to trigger an automated review."
          />
        )}

        {jobs && jobs.length > 0 && (
          <div className="card-chai p-0 divide-y divide-white/5 overflow-hidden">
            {jobs.map((job) => {
              const inFlight = job.status !== 'COMPLETED' && job.status !== 'FAILED';

              return (
                <div
                  key={job.id}
                  className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-white/[0.02]"
                >
                  <Link
                    href={`/dashboard/reviews/${job.id}`}
                    className="flex flex-1 flex-col gap-0.5 overflow-hidden group"
                  >
                    <span className="text-sm font-medium text-white group-hover:text-neutral-200 truncate">
                      #{job.pullRequest?.githubPrNumber} {job.pullRequest?.title}
                    </span>
                    <span className="font-mono text-xs text-neutral-500">
                      @{job.pullRequest?.authorLogin} &bull; {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    {job.error && (
                      <span className="text-xs text-red-400 truncate max-w-md font-mono mt-0.5">
                        Error: {job.error}
                      </span>
                    )}
                  </Link>

                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={job.status} />

                    {/* Job Actions: Retry, Cancel, Delete */}
                    <div className="flex items-center gap-1 border-l border-white/10 pl-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          retryJob.mutate(job.id);
                        }}
                        disabled={retryJob.isPending}
                        title="Re-run Review"
                        className="p-1.5 rounded-md hover:bg-white/5 text-neutral-400 hover:text-white transition-colors"
                      >
                        <RotateCw className={`h-3.5 w-3.5 ${retryJob.isPending ? 'animate-spin' : ''}`} />
                      </button>

                      {inFlight && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            cancelJob.mutate(job.id);
                          }}
                          disabled={cancelJob.isPending}
                          title="Cancel / Stop Review"
                          className="p-1.5 rounded-md hover:bg-white/5 text-neutral-400 hover:text-red-400 transition-colors"
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          deleteJob.mutate(job.id);
                        }}
                        disabled={deleteJob.isPending}
                        title="Delete Review Record"
                        className="p-1.5 rounded-md hover:bg-white/5 text-neutral-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
