import { QueryClient } from "@tanstack/react-query";

// Query client with enhanced performance settings for JWT auth
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute before data is considered stale
      gcTime: 5 * 60 * 1000, // 5 minutes before unused data is garbage collected
      retry: (failureCount: number, error: any) => {
        // Don't retry auth errors — the axios interceptor handles token refresh
        if (error?.response?.status === 401 || error?.status === 401) return false;
        return failureCount < 1;
      },
      retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff with 30s max
      refetchOnWindowFocus: false, // Disable automatic refetching when window regains focus
      refetchOnReconnect: true, // Refetch when reconnecting after losing connection
      refetchOnMount: true, // Refetch when component mounts if data is stale
    },
    mutations: {
      retry: 0, // Do not retry failed mutations
      onError: (error: Error) => {
        console.error("Mutation error:", error);
      },
    },
  },
});

// Main query client used across the app
export function getQueryClient(): QueryClient {
  return queryClient;
}

// Clear the cache on logout to remove all authenticated data
export function resetQueryClient(): QueryClient {
  queryClient.clear();
  return queryClient;
}
