import { useQuery } from "@tanstack/react-query";
import { fetchRecentUpdates, type GitHubUpdate } from "@/lib/github";

export function useGitHubUpdates(limit = 5) {
  return useQuery<GitHubUpdate[]>({
    queryKey: ["github-updates", limit],
    queryFn: () => fetchRecentUpdates(limit),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false,
  });
}
