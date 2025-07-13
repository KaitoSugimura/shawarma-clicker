import React from "react";
import { Box, VStack, Text, Grid, HStack, Badge } from "@chakra-ui/react";
import type { GameStats, GameState } from "../types/game";
import { formatNumber, formatTime } from "../utils/gameUtils";

interface StatsProps {
  stats: GameStats;
  gameState: GameState;
}

const StatItem: React.FC<{
  label: string;
  value: string;
  tooltip?: string;
  color?: string;
  icon?: string;
}> = ({ label, value, tooltip, color = "blue.300", icon }) => {
  const content = (
    <Box
      p={4}
      bg="rgba(45, 55, 72, 0.4)"
      borderRadius="md"
      border="1px solid"
      borderColor="gray.600"
      transition="all 0.2s"
      _hover={{ borderColor: "blue.400", bg: "rgba(45, 55, 72, 0.6)" }}
    >
      <HStack justify="space-between" align="center">
        <Text fontSize="lg" color="gray.300" fontWeight="medium">
          {icon && (
            <Text as="span" mr={2}>
              {icon}
            </Text>
          )}
          {label}
        </Text>
        {tooltip && (
          <Badge
            variant="outline"
            colorScheme="blue"
            fontSize="xs"
            cursor="help"
            title={tooltip}
          >
            ?
          </Badge>
        )}
      </HStack>
      <Text fontSize="3xl" fontWeight="bold" color={color} mt={2}>
        {value}
      </Text>
    </Box>
  );

  return content;
};

const StatsPanel: React.FC<StatsProps> = ({ stats, gameState }) => {
  const playTime = Date.now() - stats.gameStartTime;
  const averageSPS =
    playTime > 0 ? gameState.totalShawarmasEarned / (playTime / 1000) : 0;
  const clicksPerMinute =
    playTime > 0 ? stats.totalClicks / (playTime / 60000) : 0;
  const efficiency =
    stats.totalClicks > 0
      ? gameState.totalShawarmasEarned / stats.totalClicks
      : 0;

  return (
    <Box>
      <Text fontSize="2xl" fontWeight="bold" mb={6} color="blue.400">
        📊 Game Statistics
      </Text>

      <VStack gap={6}>
        {/* Primary Stats */}
        <Box w="100%">
          <Text fontSize="xl" fontWeight="semibold" mb={4} color="gray.200">
            🎯 Core Performance
          </Text>
          <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
            <StatItem
              icon="🥙"
              label="Total Shawarmas Earned"
              value={formatNumber(gameState.totalShawarmasEarned)}
              tooltip="Total shawarmas earned since the beginning"
              color="orange.300"
            />
            <StatItem
              icon="⚡"
              label="Shawarmas Per Second"
              value={formatNumber(gameState.shawarmasPerSecond)}
              tooltip="Your passive income rate - how many shawarmas you earn automatically every second"
              color="green.300"
            />
            <StatItem
              icon="👆"
              label="Shawarmas Per Click"
              value={formatNumber(gameState.shawarmasPerClick)}
              tooltip="How many shawarmas you get from each click"
              color="blue.300"
            />
            <StatItem
              icon="🏆"
              label="Achievements Unlocked"
              value={`${gameState.achievements.length} / 42`}
              tooltip={`You've unlocked ${gameState.achievements.length} out of 42 total achievements`}
              color="purple.300"
            />
          </Grid>
        </Box>

        {/* Secondary Stats */}
        <Box w="100%">
          <Text fontSize="xl" fontWeight="semibold" mb={4} color="gray.200">
            📈 Progress & Activity
          </Text>
          <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
            <StatItem
              icon="🖱️"
              label="Total Clicks"
              value={formatNumber(stats.totalClicks)}
              tooltip="Total number of times you've clicked the shawarma"
              color="cyan.300"
            />
            <StatItem
              icon="⏱️"
              label="Play Time"
              value={formatTime(playTime)}
              tooltip="Total time spent playing this session"
              color="yellow.300"
            />
            <StatItem
              icon="📊"
              label="Average Per Second"
              value={formatNumber(averageSPS)}
              tooltip="Average Shawarmas Per Second throughout your entire session"
              color="teal.300"
            />
            <StatItem
              icon="🛒"
              label="Upgrades Purchased"
              value={formatNumber(stats.totalUpgradesPurchased)}
              tooltip="Total number of upgrades purchased"
              color="pink.300"
            />
          </Grid>
        </Box>

        {/* Efficiency Stats */}
        <Box w="100%">
          <Text fontSize="xl" fontWeight="semibold" mb={4} color="gray.200">
            🎯 Efficiency Metrics
          </Text>
          <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
            <StatItem
              icon="🎯"
              label="Clicks Per Minute"
              value={formatNumber(clicksPerMinute)}
              tooltip="How fast you're clicking on average"
              color="red.300"
            />
            <StatItem
              icon="💎"
              label="Click Efficiency"
              value={formatNumber(efficiency)}
              tooltip="Average shawarmas earned per click (including passive income effects)"
              color="indigo.300"
            />
          </Grid>
        </Box>

        {/* Achievement Progress Bar */}
        <Box
          w="100%"
          p={5}
          bg="rgba(59, 130, 246, 0.1)"
          borderRadius="md"
          border="1px solid"
          borderColor="blue.500"
        >
          <Text
            fontSize="lg"
            color="blue.400"
            textAlign="center"
            fontWeight="bold"
            mb={3}
          >
            🏆 Achievement Progress:{" "}
            {Math.round((gameState.achievements.length / 42) * 100)}%
          </Text>
          <Box
            w="100%"
            h="12px"
            bg="gray.700"
            borderRadius="full"
            overflow="hidden"
          >
            <Box
              h="100%"
              bg="linear-gradient(90deg, blue.400, purple.400)"
              borderRadius="full"
              width={`${(gameState.achievements.length / 42) * 100}%`}
              transition="width 0.3s ease"
            />
          </Box>
        </Box>

        {/* Tips */}
        <Box
          w="100%"
          p={4}
          bg="rgba(72, 187, 120, 0.1)"
          borderRadius="md"
          border="1px solid"
          borderColor="green.500"
        >
          <Text
            fontSize="md"
            color="green.400"
            textAlign="center"
            fontWeight="medium"
          >
            💡 Number Guide: K = Thousands (1,000) • M = Millions (1,000,000) •
            B = Billions (1,000,000,000)
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default StatsPanel;
