import { Loader2, Database, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReviewJobStatus, RepoIndexStatus } from '@/types/api';

const STATUS_LABEL: Record<ReviewJobStatus, string> = {
  PENDING: 'Queued',
  FETCHING_DIFF: 'Fetching diff',
  ANALYZING_IMPACT: 'Analyzing impact',
  BUILDING_CONTEXT: 'Building context',
  RESOLVING_USAGES: 'Resolving usages',
  GENERATING_REVIEW: 'Generating review',
  POSTING_COMMENTS: 'Posting comment',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  RETRYING: 'Retrying',
};

const IN_FLIGHT: ReviewJobStatus[] = [
  'PENDING',
  'FETCHING_DIFF',
  'ANALYZING_IMPACT',
  'BUILDING_CONTEXT',
  'RESOLVING_USAGES',
  'GENERATING_REVIEW',
  'POSTING_COMMENTS',
  'RETRYING',
];

export function StatusBadge({ status }: { status: ReviewJobStatus }) {
  const inFlight = IN_FLIGHT.includes(status);

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs',
        status === 'COMPLETED' && 'border-diff-add/30 bg-diff-add/10 text-diff-add',
        status === 'FAILED' && 'border-destructive/30 bg-destructive/10 text-destructive',
        inFlight && 'border-primary/30 bg-primary/10 text-primary',
      )}
    >
      {inFlight && <Loader2 className="h-3 w-3 animate-spin" />}
      {STATUS_LABEL[status] || status}
    </span>
  );
}

export function IndexStatusBadge({ status }: { status?: RepoIndexStatus | string }) {
  const norm = (status || '').toUpperCase();
  switch (norm) {
    case 'INDEXED':
    case 'COMPLETED':
      return (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-xs text-emerald-400">
          <CheckCircle2 className="h-3 w-3" />
          Indexed
        </span>
      );
    case 'INDEXING':
      return (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 font-mono text-xs text-white">
          <Loader2 className="h-3 w-3 animate-spin" />
          Indexing...
        </span>
      );
    case 'REINDEXING':
      return (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 font-mono text-xs text-white">
          <Loader2 className="h-3 w-3 animate-spin" />
          Re-indexing...
        </span>
      );
    case 'FAILED':
      return (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 font-mono text-xs text-rose-400">
          <AlertTriangle className="h-3 w-3" />
          Index Failed
        </span>
      );
    case 'NOT_INDEXED':
    case 'PENDING':
    default:
      return (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-xs text-neutral-400">
          <Clock className="h-3 w-3" />
          Not Indexed
        </span>
      );
  }
}
