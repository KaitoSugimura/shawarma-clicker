import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "../firebase/config";
import type { CombinedGameState } from "../contexts/GameContext";
import type {
  LeaderboardEntry,
  LeaderboardData,
  LeaderboardCategory,
  LeaderboardFilters,
} from "../types/leaderboard";

export class LeaderboardService {
  private static readonly LEADERBOARD_COLLECTION = "leaderboard_entries";
  private static readonly UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

  // Update user's leaderboard entry
  static async updateUserEntry(
    user: User,
    gameState: CombinedGameState
  ): Promise<void> {
    try {
      const entry: Omit<LeaderboardEntry, "id" | "rank"> = {
        userId: user.uid,
        displayName: user.displayName || "Anonymous Player",
        photoURL: user.photoURL || undefined,
        score: this.calculateScore(gameState),
        totalShawarmas: gameState.clicker.totalShawarmasEarned,
        shawarmasPerSecond: gameState.clicker.shawarmasPerSecond,
        prestige: gameState.clicker.prestige,
        achievementCount: gameState.clicker.achievements.length,
        lastUpdated: Date.now(),
      };

      await setDoc(doc(db, this.LEADERBOARD_COLLECTION, user.uid), {
        ...entry,
        serverTimestamp: serverTimestamp(),
      });

      console.log("Leaderboard entry updated successfully");
    } catch (error) {
      console.error("Error updating leaderboard entry:", error);
      throw error;
    }
  }

  // Calculate overall score for leaderboard ranking
  private static calculateScore(gameState: CombinedGameState): number {
    const { clicker } = gameState;
    
    // Weighted scoring system
    const totalShawarmasWeight = 1;
    const spsWeight = 100;
    const prestigeWeight = 1000000;
    const achievementWeight = 10000;

    return (
      clicker.totalShawarmasEarned * totalShawarmasWeight +
      clicker.shawarmasPerSecond * spsWeight +
      clicker.prestige * prestigeWeight +
      clicker.achievements.length * achievementWeight
    );
  }

  // Get leaderboard data with filtering
  static async getLeaderboard(
    filters: LeaderboardFilters
  ): Promise<LeaderboardData> {
    try {
      const { category, limit: limitCount } = filters;
      
      let orderByField: string;
      switch (category) {
        case 'totalShawarmas':
          orderByField = 'totalShawarmas';
          break;
        case 'shawarmasPerSecond':
          orderByField = 'shawarmasPerSecond';
          break;
        case 'prestige':
          orderByField = 'prestige';
          break;
        case 'achievements':
          orderByField = 'achievementCount';
          break;
        default:
          orderByField = 'score';
      }

      const leaderboardQuery = query(
        collection(db, this.LEADERBOARD_COLLECTION),
        orderBy(orderByField, "desc"),
        limit(limitCount)
      );

      const snapshot = await getDocs(leaderboardQuery);
      const entries: LeaderboardEntry[] = [];

      console.log(`Found ${snapshot.docs.length} documents in leaderboard collection`);

      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`Document ${doc.id}:`, data);
        
        entries.push({
          id: doc.id,
          userId: data.userId || 'unknown',
          displayName: data.displayName || 'Anonymous Player',
          photoURL: data.photoURL,
          score: data.score || 0,
          rank: index + 1,
          totalShawarmas: data.totalShawarmas || 0,
          shawarmasPerSecond: data.shawarmasPerSecond || 0,
          prestige: data.prestige || 0,
          achievementCount: data.achievementCount || 0,
          lastUpdated: data.lastUpdated || Date.now(),
        });
      });

      console.log(`Processed ${entries.length} leaderboard entries`);

      return {
        entries,
        totalPlayers: entries.length,
        lastUpdated: Date.now(),
      };
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      throw error;
    }
  }

  // Get user's rank in a specific category
  static async getUserRank(
    userId: string,
    category: LeaderboardCategory
  ): Promise<number | null> {
    try {
      let orderByField: string;
      switch (category) {
        case 'totalShawarmas':
          orderByField = 'totalShawarmas';
          break;
        case 'shawarmasPerSecond':
          orderByField = 'shawarmasPerSecond';
          break;
        case 'prestige':
          orderByField = 'prestige';
          break;
        case 'achievements':
          orderByField = 'achievementCount';
          break;
        default:
          orderByField = 'score';
      }

      // Get user's entry
      const userDoc = await getDoc(doc(db, this.LEADERBOARD_COLLECTION, userId));
      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      const userValue = userData[orderByField];

      // Count how many users have a higher value
      const higherQuery = query(
        collection(db, this.LEADERBOARD_COLLECTION),
        where(orderByField, ">", userValue)
      );

      const higherSnapshot = await getDocs(higherQuery);
      return higherSnapshot.size + 1; // +1 because rank is 1-indexed
    } catch (error) {
      console.error("Error getting user rank:", error);
      return null;
    }
  }

  // Check if user entry needs updating
  static shouldUpdateEntry(lastUpdate: number): boolean {
    return Date.now() - lastUpdate > this.UPDATE_INTERVAL;
  }
}
