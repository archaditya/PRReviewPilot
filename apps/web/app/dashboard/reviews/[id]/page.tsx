'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  RotateCw,
  Ban,
  Trash2,
  AlertCircle,
  Hash,
  GitCommit,
  GitPullRequest,
  GitMerge,
  CheckCircle2,
  Clock,
  Layers,
  Loader2,
  PenSquare,
} from 'lucide-react';
import { useReviewJob } from '@/hooks/use-review-job';
import {
  useCancelReviewJob,
  useDeleteReviewJob,
  useRetryReviewJob,
} from '@/hooks/use-review-job-actions';
import { useMergePR } from '@/hooks/use-merge-pr';
import { PipelineStepper } from '@/components/pipeline-stepper';
import { FindingsList } from '@/components/findings-list';
import { PipelineActivityLog } from '@/components/pipeline-activity-log';
import { ConversationThread } from '@/components/conversation-thread';
import { SocialPostPanel } from '@/components/social-post-panel';
import { StatusBadge } from '@/components/status-badge';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { ReviewJobDetail } from '@/types/api';

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const mins = Math.floor(ms / 60_000);
  const secs = Math.floor((ms % 60_000) / 1000);
  return `${mins}m ${secs}s`;
}

export default function ReviewJobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: job, isLoading } = useReviewJob(params.id);

  const cancelJob = useCancelReviewJob();
  const deleteJob = useDeleteReviewJob();
  const retryJob = useRetryReviewJob();
  const mergePR = useMergePR();

  const [showSocialPanel, setShowSocialPanel] = useState(false);
  const [mergeConfirm, setMergeConfirm] = useState(false);

  // Handle deep-link query params from GitHub comments
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'post') setShowSocialPanel(true);
    if (action === 'merge') setMergeConfirm(true);
  }, [searchParams]);

  // All runs for this PR (ordered newest first)
  const runs: ReviewJobDetail[] = useMemo(() => {
    if (!job) return [];
    const list =
      job.pullRequest?.reviewJobs && job.pullRequest.reviewJobs.length > 0
        ? job.pullRequest.reviewJobs
        : [job];

    // Ensure currently selected job exists in the list
    const hasCurrent = list.some((r) => r.id === job.id);
    const combined = hasCurrent ? list : [job, ...list];

    return [...combined].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [job]);

  if (isLoading) return <Skeleton className="h-64 w-full rounded-lg" />;

  if (!job) {
    return (
      <EmptyState
        title="Review not found"
        description="It may have been removed, or you no longer have access."
      />
    );
  }

  async function handleDelete(targetJobId: string) {
    if (confirm('Are you sure you want to delete this review job?')) {
      await deleteJob.mutateAsync(targetJobId);
      router.replace('/dashboard/repositories');
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl pb-16">
      {/* Header with Navigation & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-white/10 pb-6">
        <div className="flex flex-col gap-1.5">
          <Link
            href="/dashboard/repositories"
            className="flex items-center gap-1 font-mono text-xs text-neutral-400 hover:text-white transition-colors mb-1"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Back to repositories</span>
          </Link>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-sm font-bold text-white">
              #{job.pullRequest?.githubPrNumber}
            </span>
            <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-white">{job.pullRequest?.title}</h1>
          </div>
          <p className="text-xs text-neutral-400">
            Multi-pass pull request review pipeline with <span className="highlight">deep graph blast radius analysis</span>.
          </p>
          <div className="flex items-center gap-3 flex-wrap text-xs text-neutral-500 font-mono mt-1">
            <span>Author: @{job.pullRequest?.authorLogin}</span>
            <span>&bull;</span>
            <span>Created: {new Date(job.createdAt).toLocaleString()}</span>
            {job.pullRequest?.headSha && (
              <>
                <span>&bull;</span>
                <span className="inline-flex items-center gap-1 text-neutral-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  <GitCommit className="h-3 w-3 text-neutral-400" />
                  {job.pullRequest.headSha.slice(0, 7)}
                </span>
              </>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-neutral-300 text-[11px] font-medium">
              <Layers className="h-3 w-3" />
              {runs.length} {runs.length === 1 ? 'Review Run' : 'Review Runs'}
            </span>
          </div>
        </div>

        {/* Global PR Actions */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => retryJob.mutate(job.id)}
            disabled={retryJob.isPending}
            className="btn-asym text-xs"
          >
            <RotateCw className={`h-3.5 w-3.5 ${retryJob.isPending ? 'animate-spin' : ''}`} />
            <span>{retryJob.isPending ? 'Re-triggering...' : 'Re-run Review'}</span>
          </button>

          {/* Merge PR */}
          {!mergeConfirm ? (
            <button
              onClick={() => setMergeConfirm(true)}
              disabled={mergePR.isPending || mergePR.isSuccess}
              className="btn-asym-mirror text-xs"
            >
              {mergePR.isSuccess ? (
                <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Merged</>
              ) : (
                <><GitMerge className="h-3.5 w-3.5" /> Merge PR</>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  if (job.pullRequest?.id) {
                    mergePR.mutate({ pullRequestId: job.pullRequest.id });
                  }
                  setMergeConfirm(false);
                }}
                disabled={mergePR.isPending || !job.pullRequest?.id}
                className="btn-asym text-xs bg-white text-black"
              >
                {mergePR.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <GitMerge className="h-3.5 w-3.5" />
                )}
                <span>Confirm Merge</span>
              </button>
              <button
                onClick={() => setMergeConfirm(false)}
                className="px-2.5 py-1.5 rounded-md border border-white/10 bg-white/5 text-xs font-mono text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Make Post */}
          <button
            onClick={() => setShowSocialPanel((v) => !v)}
            className={`px-3 py-1.5 rounded-md border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors ${
              showSocialPanel
                ? 'bg-white/15 text-white'
                : 'bg-white/5 hover:bg-white/10 text-neutral-300'
            }`}
          >
            <PenSquare className="h-3.5 w-3.5" />
            <span>{showSocialPanel ? 'Hide Posts' : 'Make Post'}</span>
          </button>
        </div>
      </div>

      {/* Merge feedback */}
      {mergePR.isSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-400 font-mono">
          <CheckCircle2 className="h-4 w-4" />
          PR merged successfully!
        </div>
      )}
      {mergePR.isError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400 font-mono">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            Merge failed:{' '}
            {(mergePR.error as any)?.response?.data?.error?.message ||
              mergePR.error?.message ||
              'Unknown error'}
          </span>
        </div>
      )}

      {/* Social Post Panel */}
      {showSocialPanel && job.pullRequest?.id && (
        <div className="border-t border-white/10 pt-6">
          <SocialPostPanel pullRequestId={job.pullRequest.id} />
        </div>
      )}

      {/* Quick Jump Bar for Multiple Runs */}
      {runs.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
          <span className="text-neutral-500 uppercase tracking-wider text-[11px] font-medium shrink-0">
            Jump to Run:
          </span>
          {runs.map((run, idx) => {
            const runNum = runs.length - idx;
            const isLatest = idx === 0;
            const isCurrentUrl = run.id === params.id;
            const webhookEvt = run.events?.find((e) => e.step === 'webhook_received');
            const sha =
              (webhookEvt?.detail as Record<string, unknown> | null)?.headSha as string | undefined ||
              job.pullRequest?.headSha;

            return (
              <a
                key={run.id}
                href={`#run-${run.id}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border transition-colors shrink-0 ${
                  isCurrentUrl
                    ? 'border-white/20 bg-white/10 text-white font-medium'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                <span>Run #{runNum}</span>
                {isLatest && (
                  <span className="rounded bg-white/10 border border-white/15 px-1 py-0.2 text-[10px] text-neutral-300">
                    Latest
                  </span>
                )}
                {sha && (
                  <span className="text-[10px] opacity-70 font-mono">({sha.slice(0, 7)})</span>
                )}
              </a>
            );
          })}
        </div>
      )}

      {/* Runs Timeline - Scrollable List of All Review Events */}
      <div className="flex flex-col gap-10">
        {runs.map((run, idx) => {
          const runNum = runs.length - idx;
          const isLatest = idx === 0;
          const isCurrentUrl = run.id === params.id;
          const inFlight = run.status !== 'COMPLETED' && run.status !== 'FAILED';

          const webhookEvt = run.events?.find((e) => e.step === 'webhook_received');
          const detail = webhookEvt?.detail as Record<string, unknown> | null;
          const action = (detail?.action as string) || (runNum === 1 ? 'opened' : 'synchronize');
          const sha = (detail?.headSha as string) || job.pullRequest?.headSha;
          const findings = run.summaryComment?.findings || [];

          const totalDuration =
            run.startedAt && run.completedAt
              ? formatDuration(new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime())
              : null;

          return (
            <div
              key={run.id}
              id={`run-${run.id}`}
              className={`card-chai p-6 flex flex-col gap-6 ${
                isCurrentUrl ? 'border-white/25' : ''
              }`}
            >
              {/* Run Card Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-montserrat text-sm font-medium text-white">
                      Run #{runNum}
                    </span>
                    {isLatest && (
                      <span className="rounded-full bg-white/10 border border-white/15 px-2 py-0.5 text-[10px] font-mono text-neutral-300 font-medium">
                        Latest Run
                      </span>
                    )}
                    {sha && (
                      <span className="inline-flex items-center gap-1 font-mono text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded text-neutral-300">
                        <GitCommit className="h-3 w-3 text-neutral-400" />
                        Commit: {sha.slice(0, 7)}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 font-mono text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded text-neutral-400 uppercase tracking-wide text-[10px]">
                      <GitPullRequest className="h-3 w-3" />
                      {action === 'opened' ? 'PR opened' : action === 'synchronize' ? 'New commit pushed' : action}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-neutral-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(run.createdAt).toLocaleString()}
                    </span>
                    {totalDuration && (
                      <>
                        <span>&bull;</span>
                        <span className="text-neutral-300 font-medium">
                          Duration: {totalDuration}
                        </span>
                      </>
                    )}
                    {run.attemptCount > 1 && (
                      <>
                        <span>&bull;</span>
                        <span className="inline-flex items-center gap-0.5">
                          <Hash className="h-3 w-3" />
                          Attempt {run.attemptCount}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status and Single-Run Controls */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <StatusBadge status={run.status} />

                  <button
                    onClick={() => retryJob.mutate(run.id)}
                    disabled={retryJob.isPending}
                    title="Retry this specific run"
                    className="flex items-center gap-1 font-mono text-xs h-8 px-2.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors"
                  >
                    <RotateCw className={`h-3 w-3 ${retryJob.isPending ? 'animate-spin' : ''}`} />
                    <span>Retry</span>
                  </button>

                  {inFlight && (
                    <button
                      onClick={() => cancelJob.mutate(run.id)}
                      disabled={cancelJob.isPending}
                      className="flex items-center gap-1 font-mono text-xs text-neutral-400 hover:text-red-400 h-8 px-2.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <Ban className="h-3 w-3" />
                      <span>Cancel</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(run.id)}
                    disabled={deleteJob.isPending}
                    className="flex items-center gap-1 font-mono text-xs text-neutral-400 hover:text-red-400 h-8 px-2 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                    title="Delete review record"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Visual Stepper */}
              <PipelineStepper status={run.status} />

              {/* Error Callout Banner if failed */}
              {run.error && (
                <div className="flex items-start justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-300">Review Run #{runNum} Failed</p>
                      <p className="font-mono text-xs mt-1 opacity-90">{run.error}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => retryJob.mutate(run.id)}
                    disabled={retryJob.isPending}
                    className="shrink-0 text-xs font-mono px-3 py-1.5 rounded-md border border-red-500/30 text-red-300 hover:bg-red-500/10"
                  >
                    Retry Now
                  </button>
                </div>
              )}

              {/* Pipeline Activity Log for this run */}
              {run.events && run.events.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h2 className="font-montserrat font-medium text-xs text-neutral-400">
                    Pipeline Activity &bull; Run #{runNum}
                  </h2>
                  <PipelineActivityLog
                    events={run.events}
                    startedAt={run.startedAt}
                    completedAt={run.completedAt}
                  />
                </div>
              )}

              {/* Findings for this run */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-montserrat font-medium text-xs text-neutral-400">
                    Findings &bull; Run #{runNum} ({findings.length})
                  </h2>
                </div>

                {findings.length > 0 ? (
                  <FindingsList findings={findings} />
                ) : run.status === 'COMPLETED' ? (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-emerald-400 font-mono">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Clean code! No issues or findings detected in this run.</span>
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs font-mono text-neutral-500">
                    Review is still in progress...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Conversation Thread (Shared for the PR) */}
      {job.conversationMessages && job.conversationMessages.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-white/10 pt-8">
          <h2 className="font-montserrat font-medium text-xs text-neutral-400">
            Conversation Thread
          </h2>
          <ConversationThread messages={job.conversationMessages} />
        </div>
      )}
    </div>
  );
}
