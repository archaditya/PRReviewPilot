'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { ReviewJob } from '@/types/api';

export function useReviewJobs(repositoryId: string) {
  return useQuery({
    queryKey: ['review-jobs', repositoryId],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<any>('/review-jobs', {
          params: { repositoryId },
        });
        return data.data || data.jobs || [];
      } catch (err) {
        return [];
      }
    },
    enabled: Boolean(repositoryId),
    retry: false,
  });
}
