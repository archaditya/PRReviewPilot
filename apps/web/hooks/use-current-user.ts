'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { User } from '@/types/api';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async (): Promise<User | null> => {
      try {
        const { data } = await apiClient.get<any>('/auth/me');
        const user = data?.user || data?.data || null;
        return user;
      } catch (err: any) {
        // Unauthenticated or network error
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });
}
