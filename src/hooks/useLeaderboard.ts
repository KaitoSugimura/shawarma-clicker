import { useState, useCallback } from "react";
import type { User } from "firebase/auth";
import { LeaderboardService } from "../services/LeaderboardService";
import type { CombinedGameState } from "../contexts/GameContext";
import type {
  LeaderboardData,
  LeaderboardCategory,
  LeaderboardFilters,
} from "../types/leaderboard";

interface UseLeaderboardOptions {
  category: LeaderboardCategory;
  limit?: number;
  autoUpdate?: boolean;
}

export const useLeaderboard = (options: UseLeaderboardOptions) => {
  const { category, limit = 50, autoUpdate = true } = options;
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);

  const fetchLeaderboard = useCallback(async (user?: User | null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const filters: LeaderboardFilters = { category, limit };
      const data = await LeaderboardService.getLeaderboard(filters);
      setLeaderboardData(data);

      // Get user's rank if logged in
      if (user) {
        const rank = await LeaderboardService.getUserRank(user.uid, category);
        setUserRank(rank);
      } else {
        setUserRank(null);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch leaderboard");
    } finally {
      setIsLoading(false);
    }
  }, [category, limit]);

  const updateUserEntry = useCallback(async (
    user: User,
    gameState: CombinedGameState
  ): Promise<boolean> => {
    try {
      await LeaderboardService.updateUserEntry(user, gameState);
      
      // Refresh leaderboard if auto-update is enabled
      if (autoUpdate) {
        await fetchLeaderboard(user);
      }
      
      return true;
    } catch (error) {
      console.error("Failed to update leaderboard entry:", error);
      setError("Failed to update leaderboard entry");
      return false;
    }
  }, [autoUpdate, fetchLeaderboard]);

  return {
    leaderboardData,
    isLoading,
    error,
    userRank,
    fetchLeaderboard,
    updateUserEntry,
    refetch: () => fetchLeaderboard(),
  };
};

export default useLeaderboard;
