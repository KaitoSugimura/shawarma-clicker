import { Box, VStack, Text, Grid } from "@chakra-ui/react";
import type { GameStats, GameState } from "../types/game";
import { StatItem } from "./shared/StatItem";
import { AchievementProgressSection } from "./shared/AchievementProgressSection";
import { NumberGuideTooltip } from "./shared/NumberGuideTooltip";
import { useStatsCalculations } from "../hooks/useStatsCalculations";

interface StatsProps {
  stats: GameStats;
  gameState: GameState;
}

export function StatsPanel({ stats, gameState }: StatsProps) {
  const { formattedStats } = useStatsCalculations(stats, gameState);

  return (
    <Box w="100%" h="100%" overflow="auto">
      <VStack gap={6} p={4} align="stretch">
        {/* Header */}
        <Text
          fontSize="2xl"
          fontWeight="bold"
          color="white"
          textAlign="center"
          mb={2}
        >
          📊 Game Statistics
        </Text>

        {/* Main Stats Grid */}
        <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={4}>
          <StatItem
            label="Total Shawarmas"
            value={formattedStats.totalShawarmas}
            color="orange.300"
            icon="🥙"
          />
          <StatItem
            label="Shawarmas per Second"
            value={formattedStats.currentSPS}
            color="green.300"
            icon="⚡"
          />
          <StatItem
            label="Total Clicks"
            value={formattedStats.totalClicks}
            color="blue.300"
            icon="👆"
          />
          <StatItem
            label="Best Click"
            value={formattedStats.bestClickRate}
            color="purple.300"
            icon="🎯"
            tooltip="Highest shawarmas gained in a single click"
          />
        </Grid>

        {/* Performance Stats */}
        <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={4}>
          <StatItem
            label="Play Time"
            value={formattedStats.playTime}
            color="cyan.300"
            icon="⏰"
          />
          <StatItem
            label="Average SPS"
            value={formattedStats.averageSPS}
            color="teal.300"
            icon="📈"
            tooltip="Average shawarmas per second over entire session"
          />
          <StatItem
            label="Clicks per Minute"
            value={formattedStats.clicksPerMinute}
            color="pink.300"
            icon="🔥"
          />
          <StatItem
            label="Efficiency"
            value={formattedStats.efficiency}
            color="yellow.300"
            icon="⚙️"
            tooltip="Average shawarmas per click (total shawarmas ÷ total clicks)"
          />
        </Grid>

        {/* Prestige Section */}
        <Box
          w="100%"
          p={4}
          bg="rgba(138, 43, 226, 0.2)"
          borderRadius="md"
          border="1px solid"
          borderColor="purple.500"
        >
          <StatItem
            label="Prestige Level"
            value={formattedStats.prestigeLevel}
            color="purple.300"
            icon="⭐"
          />
        </Box>

        {/* Achievement Progress */}
        <Box
          w="100%"
          p={4}
          bg="rgba(45, 55, 72, 0.4)"
          borderRadius="md"
          border="1px solid"
          borderColor="gray.600"
        >
          <AchievementProgressSection
            achievementsCount={gameState.achievements.length}
            totalAchievements={42}
          />
        </Box>

        {/* Tips */}
        <NumberGuideTooltip />
      </VStack>
    </Box>
  );
}

export default StatsPanel;
