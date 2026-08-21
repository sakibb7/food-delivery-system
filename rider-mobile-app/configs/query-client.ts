import { QueryClient } from "@tanstack/react-query";
import { AppState } from "react-native";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 0,
      onError: (error: Error) => {
        console.error("Mutation error:", error);
      },
    },
  },
});

// Memory management - periodically clear old queries
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function startCleanupInterval() {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    queryClient.removeQueries({
      predicate: (query) => {
        const updatedAt = query.state.dataUpdatedAt;
        return updatedAt > 0 && Date.now() - updatedAt > 60 * 60 * 1000;
      },
    });
  }, 30 * 60 * 1000);
}

startCleanupInterval();

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    startCleanupInterval();
  } else {
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
      cleanupInterval = null;
    }
  }
});

// main query client, that will be use cross the app
export function getQueryClient(): QueryClient {
  return queryClient;
}

// for reset, we need to clear the cache on logout
export function resetQueryClient(): QueryClient {
  queryClient.clear(); // Clear all caches
  return queryClient;
}
