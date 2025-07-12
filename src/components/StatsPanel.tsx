import React from "react";
import { Box, VStack, Text, Grid } from "@chakra-ui/react";

interface GameStats {
  totalClicks: number;
  gameStartTime: number;
  bestClickRate: number;
  totalUpgradesPurchased: number;
}

interface StatsProps {
  stats: GameStats;
  shawarmasPerSecond: number;
  totalEarned: number;
  achievements: string[];
}

const StatsPanel: React.FC<StatsProps> = ({
  stats,
  shawarmasPerSecond,
  totalEarned,
  achievements,
}) => {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return Math.floor(num).toLocaleString();
  };

  const playTime = Date.now() - stats.gameStartTime;
  const averageSPS = playTime > 0 ? totalEarned / (playTime / 1000) : 0;

  return (
    <Box
      p={4}
      bg="rgba(45, 55, 72, 0.6)"
      borderWidth="1px"
      borderColor="gray.600"
      borderRadius="lg"
      backdropFilter="blur(5px)"
    >
      <Text fontSize="xl" fontWeight="bold" mb={4} color="blue.400">
        📊 Game Statistics
      </Text>

      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
        <VStack align="start" gap={2}>
          <Box>
            <Text fontSize="sm" color="gray.400">
              Total Clicks
            </Text>
            <Text fontSize="lg" fontWeight="semibold" color="blue.300">
              {formatNumber(stats.totalClicks)}
            </Text>
          </Box>

          <Box>
            <Text fontSize="sm" color="gray.400">
              Play Time
            </Text>
            <Text fontSize="lg" fontWeight="semibold" color="blue.300">
              {formatTime(playTime)}
            </Text>
          </Box>

          <Box>
            <Text fontSize="sm" color="gray.400">
              Current SPS
            </Text>
            <Text fontSize="lg" fontWeight="semibold" color="blue.300">
              {formatNumber(shawarmasPerSecond)}
            </Text>
          </Box>
        </VStack>

        <VStack align="start" gap={2}>
          <Box>
            <Text fontSize="sm" color="gray.400">
              Average SPS
            </Text>
            <Text fontSize="lg" fontWeight="semibold" color="blue.300">
              {formatNumber(averageSPS)}
            </Text>
          </Box>

          <Box>
            <Text fontSize="sm" color="gray.400">
              Upgrades Bought
            </Text>
            <Text fontSize="lg" fontWeight="semibold" color="blue.300">
              {stats.totalUpgradesPurchased}
            </Text>
          </Box>

          <Box>
            <Text fontSize="sm" color="gray.400">
              Achievements
            </Text>
            <Text fontSize="lg" fontWeight="semibold" color="blue.300">
              {achievements.length}/7
            </Text>
          </Box>
        </VStack>
      </Grid>

      <Box
        mt={4}
        p={3}
        bg="rgba(59, 130, 246, 0.1)"
        borderRadius="md"
        border="1px solid"
        borderColor="blue.500"
      >
        <Text fontSize="sm" color="blue.400" textAlign="center">
          🏆 Achievement Progress: {Math.round((achievements.length / 7) * 100)}
          %
        </Text>
      </Box>
    </Box>
  );
};

export default StatsPanel;
export type { GameStats };
