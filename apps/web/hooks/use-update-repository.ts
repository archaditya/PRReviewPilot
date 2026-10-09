'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Repository } from '@/types/api';

export function useUpdateRepository(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload:
        | {
            isActive?: boolean;
            aiReviewEnabled?: boolean;
            reviewLevel?: 'balanced' | 'strict' | 'permissive';
            customVoice?: string | null;
          }
        | boolean
    ) => {
      let body: any = {};
      if (typeof payload === 'boolean') {
        body = { status: payload ? 'active' : 'paused' };
      } else {
        if (payload.isActive !== undefined) {
          body.status = payload.isActive ? 'active' : 'paused';
        }
        body.reviewConfig = {
          aiReviewEnabled: payload.aiReviewEnabled,
          strictness: payload.reviewLevel,
          customVoice: payload.customVoice,
        };
      }
      const { data } = await apiClient.patch<any>(`/repositories/${id}/config`, body);
      const raw = data.repository || data.data || data;
      return {
        ...raw,
        fullName: raw.fullName || raw.providerFullName || raw.name || 'Unnamed Repository',
        isActive: raw.isActive !== undefined ? raw.isActive : raw.status === 'active',
        indexStatus: raw.indexStatus || 'NOT_INDEXED',
      } as Repository;
    },
    onSuccess: (repository) => {
      if (repository) {
        queryClient.setQueryData(['repositories', id], repository);
      }
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
    },
  });
}
