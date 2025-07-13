import { useMemo } from "react";
import type { GameStats, GameState } from "../types/game";
import { formatNumber, formatTime } from "../utils/gameUtils";

interface UseStatsCalculationsResult {
  playTime: number;
  averageSPS: number;
  clicksPerMinute: number;
  efficiency: number;
  formattedStats: {
    playTime: string;
    averageSPS: string;
    clicksPerMinute: string;
    efficiency: string;
    totalClicks: string;
    totalShawarmas: string;
    currentSPS: string;
    bestClickRate: string;
    prestigeLevel: string;
  };
}

export function useStatsCalculations(
  stats: GameStats,
  gameState: GameState
): UseStatsCalculationsResult {
  return useMemo(() => {
    const playTime = Date.now() - stats.gameStartTime;
    const averageSPS =
      playTime > 0 ? gameState.totalShawarmasEarned / (playTime / 1000) : 0;
    const clicksPerMinute =
      playTime > 0 ? (stats.totalClicks / (playTime / 1000)) * 60 : 0;
    const efficiency =
      stats.totalClicks > 0
        ? gameState.totalShawarmasEarned / stats.totalClicks
        : 0;

    return {
      playTime,
      averageSPS,
      clicksPerMinute,
      efficiency,
      formattedStats: {
        playTime: formatTime(playTime),
        averageSPS: formatNumber(averageSPS),
        clicksPerMinute: formatNumber(clicksPerMinute),
        efficiency: formatNumber(efficiency),
        totalClicks: formatNumber(stats.totalClicks),
        totalShawarmas: formatNumber(gameState.totalShawarmasEarned),
        currentSPS: formatNumber(gameState.shawarmasPerSecond),
        bestClickRate: formatNumber(stats.bestClickRate),
        prestigeLevel: formatNumber(gameState.prestige),
      },
    };
  }, [stats, gameState]);
}
