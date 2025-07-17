import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { FaTrophy, FaUtensils, FaRocket, FaClock } from "react-icons/fa";
import type { LeaderboardEntry } from "../../types/leaderboard";
import { formatNumber } from "../../utils/gameUtils";

interface LeaderboardStatsProps {
  userEntry?: LeaderboardEntry | null;
  totalPlayers: number;
  lastUpdated: number;
}

export const LeaderboardStats: React.FC<LeaderboardStatsProps> = ({
  userEntry,
  totalPlayers,
  lastUpdated,
}) => {
  const getRankPercentile = (rank: number, total: number): number => {
    return Math.round(((total - rank) / total) * 100);
  };

  const getRankDescription = (rank: number): string => {
    if (rank === 1) return "🏆 Shawarma Sultan";
    if (rank <= 3) return "👑 Royal Chef";
    if (rank <= 10) return "🥙 Master Baker";
    if (rank <= 50) return "🔥 Expert Griller";
    if (rank <= 100) return "⭐ Skilled Cook";
    return "🍴 Apprentice Chef";
  };

  return (
    <VStack gap={4} align="stretch">
      {/* Global Stats */}
      <Box
        p={4}
        bg="gray.800"
        borderRadius="md"
        borderWidth="1px"
        borderColor="gray.600"
        bgGradient="linear(to-br, gray.800, gray.900)"
      >
        <HStack justify="space-between" mb={2}>
          <Text fontSize="lg" fontWeight="bold" color="white">
            🥙 Shawarma Kingdom
          </Text>
          <Icon color="orange.400">
            <FaUtensils />
          </Icon>
        </HStack>
        
        <VStack gap={2} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.300">
              Royal Shawarma Chefs
            </Text>
            <Text fontSize="sm" color="white" fontWeight="bold">
              {formatNumber(totalPlayers)}
            </Text>
          </HStack>
          
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.300">
              Kingdom Last Updated
            </Text>
            <HStack gap={1}>
              <Icon color="gray.400" boxSize={3}>
                <FaClock />
              </Icon>
              <Text fontSize="xs" color="gray.400">
                {new Date(lastUpdated).toLocaleTimeString()}
              </Text>
            </HStack>
          </HStack>
        </VStack>
      </Box>

      {/* User Stats */}
      {userEntry && (
        <Box
          p={4}
          bg="gray.800"
          borderRadius="md"
          borderWidth="1px"
          borderColor="gray.600"
          bgGradient="linear(to-br, gray.800, gray.900)"
        >
          <HStack justify="space-between" mb={3}>
            <Text fontSize="lg" fontWeight="bold" color="white">
              👑 Your Royal Status
            </Text>
            <Icon color="orange.400">
              <FaTrophy />
            </Icon>
          </HStack>
          
          <VStack gap={3} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.300">
                Current Rank
              </Text>
              <HStack gap={2}>
                <Text fontSize="sm" color="white" fontWeight="bold">
                  #{userEntry.rank}
                </Text>
                <Badge colorPalette="orange" variant="outline">
                  {getRankDescription(userEntry.rank)}
                </Badge>
              </HStack>
            </HStack>

            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.300">
                Outgrilled
              </Text>
              <Text fontSize="sm" fontWeight="medium" color="white">
                {getRankPercentile(userEntry.rank, totalPlayers)}% of chefs
              </Text>
            </HStack>

            <Box>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="xs" color="gray.400">
                  Path to Elite Kitchen
                </Text>
                <Text fontSize="xs" color="gray.400">
                  Rank {Math.ceil(totalPlayers * 0.1)}
                </Text>
              </HStack>
              <Box
                w="full"
                h="8px"
                bg="gray.700"
                borderRadius="full"
                overflow="hidden"
              >
                <Box
                  h="full"
                  bg="orange.400"
                  borderRadius="full"
                  width={`${Math.max(0, Math.min(100, getRankPercentile(userEntry.rank, totalPlayers)))}%`}
                  transition="width 0.3s"
                />
              </Box>
            </Box>

            <VStack gap={2} align="stretch" pt={2}>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.300">
                  🏆 Chef Reputation
                </Text>
                <Text fontSize="sm" fontWeight="medium" color="white">
                  {formatNumber(userEntry.score)}
                </Text>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.300">
                  🚀 Enlightenment Level
                </Text>
                <HStack gap={1}>
                  <Icon color="purple.400" boxSize={3}>
                    <FaRocket />
                  </Icon>
                  <Text fontSize="sm" fontWeight="medium" color="white">
                    {userEntry.prestige}
                  </Text>
                </HStack>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.300">
                  🎖️ Culinary Milestones
                </Text>
                <Text fontSize="sm" fontWeight="medium" color="white">
                  {userEntry.achievementCount}
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </Box>
      )}

      {/* Tips for improvement */}
      {userEntry && userEntry.rank > 10 && (
        <Box
          p={4}
          bg="yellow.50"
          borderRadius="md"
          borderWidth="1px"
          borderColor="yellow.200"
        >
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            🍳 Master Chef's Wisdom:
          </Text>
          <VStack gap={1} align="stretch">
            <Text fontSize="xs" color="gray.600">
              • 🔥 Upgrade your grills to cook more shawarmas per second
            </Text>
            <Text fontSize="xs" color="gray.600">
              • 🎖️ Complete culinary achievements for bonus reputation
            </Text>
            <Text fontSize="xs" color="gray.600">
              • ✨ Ascend to higher enlightenment levels for massive score boosts
            </Text>
            <Text fontSize="xs" color="gray.600">
              • 📈 Master the food exchange to multiply your shawarma wealth
            </Text>
          </VStack>
        </Box>
      )}
    </VStack>
  );
};
