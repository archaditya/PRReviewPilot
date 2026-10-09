'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Repository } from '@/types/api';

export function useRepositories() {
  return useQuery({
    queryKey: ['repositories'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/repositories');
      const list = res.data.repositories || res.data.data || (Array.isArray(res.data) ? res.data : []);
      return list.map((raw: any) => ({
        ...raw,
        fullName: raw.fullName || raw.providerFullName || raw.name || 'Unnamed Repository',
        isActive: raw.isActive !== undefined ? raw.isActive : raw.status === 'active',
        indexStatus: raw.indexStatus || 'NOT_INDEXED',
      })) as Repository[];
    },
    retry: false,
  });
}
