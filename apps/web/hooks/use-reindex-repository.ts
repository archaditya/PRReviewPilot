import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Repository } from '@/types/api';

export function useReindexRepository(repositoryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<any>(
        `/repositories/${repositoryId}/reindex`,
      );
      const raw = response.data.repository || response.data.data || response.data;
      return {
        ...raw,
        fullName: raw.fullName || raw.providerFullName || raw.name || 'Unnamed Repository',
        isActive: raw.isActive !== undefined ? raw.isActive : raw.status === 'active',
        indexStatus: raw.indexStatus || 'INDEXING',
      } as Repository;
    },
    onSuccess: (updated) => {
      if (updated) {
        queryClient.setQueryData(['repositories', repositoryId], updated);
      }
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
    },
  });
}
