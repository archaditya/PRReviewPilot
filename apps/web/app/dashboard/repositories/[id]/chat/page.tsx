'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, MessageSquareCode, Sparkles } from 'lucide-react';
import { useRepository } from '@/hooks/use-repository';
import { ChatPanel } from '@/components/chat/chat-panel';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';

export default function RepositoryChatPage() {
  const params = useParams<{ id: string }>();
  const { data: repository, isLoading } = useRepository(params.id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-[600px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!repository) {
    return (
      <EmptyState
        title="Repository not found"
        description="Could not load repository information for chat."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Top Navigation & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/repositories/${repository.id}`}
            className="p-1.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            title="Back to Repository"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <MessageSquareCode className="h-4 w-4 text-neutral-400" />
              <h1 className="font-mono text-lg font-medium tracking-tight text-white">
                {repository.fullName}
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/10 bg-white/5 text-neutral-300">
                AST Graph Chat
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Natural language questions grounded in the <span className="highlight">ast code knowledge graph</span>.
            </p>
          </div>
        </div>

        <Link
          href={`/dashboard/repositories/${repository.id}`}
          className="text-xs text-neutral-400 hover:text-white underline underline-offset-4 transition-colors font-mono"
        >
          View repository dashboard
        </Link>
      </div>

      {/* Main Chat Interface */}
      <ChatPanel repositoryId={repository.id} repositoryName={repository.fullName} />
    </div>
  );
}
