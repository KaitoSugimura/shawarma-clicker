import { Box, VStack, Grid, Text } from "@chakra-ui/react";
import type { GameStatsProps } from "./interfaces";
import { formatNumber, formatPerSecond } from "../../utils/gameUtils";

export function GameStats({ stats, gameState }: GameStatsProps) {
  return (
    <Box>
      <Text fontSize="xl" fontWeight="bold" mb={4} color="cyan.400">
        📊 Game Statistics
      </Text>
      <VStack gap={3} align="stretch">
        <Box
          p={3}
          bg="rgba(74, 85, 104, 0.3)"
          borderWidth="1px"
          borderColor="gray.600"
          borderRadius="lg"
        >
          <Grid templateColumns="repeat(2, 1fr)" gap={3}>
            <VStack align="start" gap={1}>
              <Text fontSize="xs" color="gray.400">
                Total Clicks
              </Text>
              <Text fontSize="sm" fontWeight="bold" color="cyan.300">
                {formatNumber(stats.totalClicks)}
              </Text>
            </VStack>

            <VStack align="start" gap={1}>
              <Text fontSize="xs" color="gray.400">
                Best Click Rate
              </Text>
              <Text fontSize="sm" fontWeight="bold" color="cyan.300">
                {formatNumber(stats.bestClickRate)}/click
              </Text>
            </VStack>

            <VStack align="start" gap={1}>
              <Text fontSize="xs" color="gray.400">
                Total Earned
              </Text>
              <Text fontSize="sm" fontWeight="bold" color="cyan.300">
                {formatNumber(gameState.totalShawarmasEarned)}
              </Text>
            </VStack>

            <VStack align="start" gap={1}>
              <Text fontSize="xs" color="gray.400">
                Upgrades Bought
              </Text>
              <Text fontSize="sm" fontWeight="bold" color="cyan.300">
                {formatNumber(stats.totalUpgradesPurchased)}
              </Text>
            </VStack>

            <VStack align="start" gap={1}>
              <Text fontSize="xs" color="gray.400">
                Shawarmas Per Second
              </Text>
              <Text fontSize="sm" fontWeight="bold" color="cyan.300">
                {formatPerSecond(gameState.shawarmasPerSecond)}/sec
              </Text>
            </VStack>

            <VStack align="start" gap={1}>
              <Text fontSize="xs" color="gray.400">
                Shawarmas Per Click
              </Text>
              <Text fontSize="sm" fontWeight="bold" color="cyan.300">
                {formatNumber(gameState.shawarmasPerClick)}/click
              </Text>
            </VStack>
          </Grid>
        </Box>
      </VStack>
    </Box>
  );
}
