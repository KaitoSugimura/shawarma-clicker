import React from "react";
import { Box, VStack, Text, Grid } from "@chakra-ui/react";
import type { GameStats } from "../types/game";
import { formatNumber, formatTime } from "../utils/gameUtils";

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
  const playTime = Date.now() - stats.gameStartTime;
  const averageSPS = playTime > 0 ? totalEarned / (playTime / 1000) : 0;

  return (
    <Box>
      <Text fontSize="xl" fontWeight="bold" mb={4} color="blue.400">
        📊 Game Statistics
      </Text>

      <Box
        p={4}
        bg="rgba(45, 55, 72, 0.6)"
        borderWidth="1px"
        borderColor="gray.600"
        borderRadius="lg"
        backdropFilter="blur(5px)"
      >
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
            🏆 Achievement Progress:{" "}
            {Math.round((achievements.length / 7) * 100)}%
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default StatsPanel;
