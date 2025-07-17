import { LeaderboardService } from "../services/LeaderboardService";
import type { CombinedGameState } from "../contexts/GameContext";
import type { User } from "firebase/auth";

// Test data for leaderboard demonstration
export const generateTestLeaderboardData = async (currentUser: User | null) => {
  if (!currentUser) {
    console.log("No user logged in, cannot generate test data");
    return false;
  }

  try {
    console.log("Generating test leaderboard data for user:", currentUser.uid);
    
    // Generate a test game state for the current user
    const testGameState: CombinedGameState = {
      clicker: {
        shawarmas: 1000000,
        shawarmasPerSecond: 5000,
        shawarmasPerClick: 100,
        totalShawarmasEarned: 10000000,
        prestige: 2,
        achievements: ["first_click", "hundred_shawarmas", "first_upgrade", "trader", "baker"],
      },
      upgrades: [],
      clickUpgrades: [],
      stats: {
        totalClicks: 1000,
        gameStartTime: Date.now() - 86400000, // 1 day ago
        bestClickRate: 10,
        totalUpgradesPurchased: 15,
        totalClickUpgradesPurchased: 5,
        totalTrades: 0,
        totalProfit: 0,
        bestTradeProfit: 0,
        tradesInSession: 0,
        longestHoldTime: 0,
        quickestProfitableFlip: Infinity,
        playTime: 3600000, // 1 hour
        totalResets: 0,
      },
      trading: {
        portfolio: {},
        portfolioAverageCosts: {},
        tradeHistory: [],
        currentPrices: {},
        chartData: {},
        selectedFood: "tomato",
        shawarmaBalance: 1000000,
        volatilityPeriods: {},
        lastVolatilityCheck: Date.now(),
      },
      version: "2.0",
      lastSaved: Date.now(),
    };

    // Update the user's leaderboard entry
    await LeaderboardService.updateUserEntry(currentUser, testGameState);
    console.log("Test leaderboard data generated for current user");
    
    return true;
  } catch (error) {
    console.error("Failed to generate test leaderboard data:", error);
    return false;
  }
};

// Helper to check if user should be prompted to generate test data
export const shouldShowTestDataOption = (user: User | null): boolean => {
  return user !== null && process.env.NODE_ENV === "development";
};
