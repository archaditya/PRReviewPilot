'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Repository } from '@/types/api';

export function useRepository(id: string) {
  return useQuery({
    queryKey: ['repositories', id],
    queryFn: async () => {
      const res = await apiClient.get<any>(`/repositories/${id}`);
      const raw = res.data.repository || res.data.data || res.data;
      if (!raw) return null;
      return {
        ...raw,
        fullName: raw.fullName || raw.providerFullName || raw.name || 'Unnamed Repository',
        isActive: raw.isActive !== undefined ? raw.isActive : raw.status === 'active',
        indexStatus: raw.indexStatus || 'NOT_INDEXED',
      } as Repository;
    },
    enabled: Boolean(id),
  });
}
