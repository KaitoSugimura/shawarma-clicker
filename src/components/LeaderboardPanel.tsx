import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Spinner,
  Center,
  Flex,
  Icon,
  Image,
  Separator,
  SimpleGrid,
  Button,
} from "@chakra-ui/react";
import { NativeSelectField, NativeSelectRoot } from "@chakra-ui/react";
import { FaTrophy, FaMedal, FaAward, FaCrown, FaChevronDown } from "react-icons/fa";
import type { User } from "firebase/auth";
import { LeaderboardService } from "../services/LeaderboardService";
import { LeaderboardStats } from "./shared/LeaderboardStats";
import type {
  LeaderboardData,
  LeaderboardEntry,
  LeaderboardCategory,
  LeaderboardFilters,
} from "../types/leaderboard";
import { formatNumber } from "../utils/gameUtils";
import { generateTestLeaderboardData, shouldShowTestDataOption } from "../utils/leaderboardTestUtils";

interface LeaderboardProps {
  user: User | null;
}

const categoryLabels: Record<LeaderboardCategory, string> = {
  totalShawarmas: "Total Shawarmas",
  shawarmasPerSecond: "Shawarmas Per Second",
  prestige: "Prestige Level",
  achievements: "Achievements",
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return { icon: FaCrown, color: "gold" };
    case 2:
      return { icon: FaTrophy, color: "silver" };
    case 3:
      return { icon: FaMedal, color: "#CD7F32" }; // bronze
    default:
      return { icon: FaAward, color: "gray.500" };
  }
};

const getRankBadgeColor = (rank: number) => {
  if (rank === 1) return "yellow";
  if (rank === 2) return "gray";
  if (rank === 3) return "orange";
  if (rank <= 10) return "purple";
  if (rank <= 50) return "blue";
  return "green";
};

const formatCategoryValue = (
  entry: LeaderboardEntry,
  category: LeaderboardCategory
): string => {
  switch (category) {
    case "totalShawarmas":
      return formatNumber(entry.totalShawarmas);
    case "shawarmasPerSecond":
      return formatNumber(entry.shawarmasPerSecond);
    case "prestige":
      return entry.prestige.toString();
    case "achievements":
      return entry.achievementCount.toString();
    default:
      return formatNumber(entry.score);
  }
};

export const LeaderboardPanel: React.FC<LeaderboardProps> = ({ user }) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<LeaderboardCategory>("totalShawarmas");
  const [userRank, setUserRank] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const filters: LeaderboardFilters = {
        category: selectedCategory,
        limit: 50,
      };

      console.log("Fetching leaderboard with filters:", filters);
      const data = await LeaderboardService.getLeaderboard(filters);
      console.log("Leaderboard data received:", data);
      setLeaderboardData(data);

      // Get user's rank if logged in
      if (user) {
        const rank = await LeaderboardService.getUserRank(user.uid, selectedCategory);
        setUserRank(rank);
        console.log("User rank:", rank);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      setError(error instanceof Error ? error.message : "Failed to load leaderboard");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, user]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value as LeaderboardCategory);
  };

  if (isLoading) {
    return (
      <Center h="400px">
        <VStack gap={4}>
          <Spinner size="xl" colorPalette="orange" />
          <Text>Loading leaderboard...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="400px">
        <VStack gap={4}>
          <Text color="red.500" fontSize="lg">⚠️ Error Loading Leaderboard</Text>
          <Text color="gray.600" textAlign="center">{error}</Text>
          <Button 
            colorPalette="orange" 
            variant="outline" 
            onClick={() => fetchLeaderboard()}
          >
            Try Again
          </Button>
        </VStack>
      </Center>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} p={6}>
      {/* Leaderboard List */}
      <Box
        bg="white"
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="lg"
        p={6}
        maxH="600px"
        overflowY="auto"
        css={{
          _dark: {
            bg: "gray.800",
            borderColor: "gray.600"
          }
        }}
      >
      <VStack gap={4} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <HStack gap={2}>
            <Icon color="orange.500">
              <FaTrophy />
            </Icon>
            <Text fontSize="xl" fontWeight="bold">
              Leaderboard
            </Text>
          </HStack>
          
          <HStack gap={2}>
            {shouldShowTestDataOption(user) && (
              <Button
                size="sm"
                colorPalette="orange"
                variant="outline"
                borderColor="orange.300"
                color="orange.100"
                bg="gray.800"
                px={4}
                py={2}
                fontSize="sm"
                fontWeight="semibold"
                borderRadius="md"
                _hover={{
                  borderColor: "orange.400",
                  bg: "orange.900",
                  color: "orange.100",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)"
                }}
                _active={{
                  transform: "translateY(0)",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)"
                }}
                transition="all 0.2s"
                onClick={async () => {
                  const success = await generateTestLeaderboardData(user);
                  if (success) {
                    fetchLeaderboard();
                  }
                }}
              >
                🧪 Generate Test Data
              </Button>
            )}
            
            <Box position="relative">
              <NativeSelectRoot 
                size="sm" 
                width="200px"
                bg="orange.100"
                borderRadius="md"
                borderWidth="2px"
                borderColor="orange.300"
                boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
                _hover={{ 
                  borderColor: "orange.400", 
                  bg: "orange.200",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                  transform: "translateY(-1px)"
                }}
                _focusWithin={{ 
                  borderColor: "orange.500", 
                  boxShadow: "0 0 0 2px rgba(251, 146, 60, 0.3), 0 4px 8px rgba(0, 0, 0, 0.15)", 
                  bg: "orange.200" 
                }}
                transition="all 0.2s"
                cursor="pointer"
              >
                <NativeSelectField
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  bg="transparent"
                  border="none"
                  fontSize="sm"
                  fontWeight="semibold"
                  color="gray.800"
                  textAlign="center"
                  _focus={{ boxShadow: "none" }}
                  cursor="pointer"
                  pr={8}
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </NativeSelectField>
              </NativeSelectRoot>
              
              {/* Custom dropdown arrow */}
              <Icon
                position="absolute"
                right={3}
                top="50%"
                transform="translateY(-50%)"
                color="orange.600"
                fontSize="xs"
                pointerEvents="none"
                zIndex={1}
              >
                <FaChevronDown />
              </Icon>
            </Box>
          </HStack>
        </Flex>

        {/* User's rank display */}
        {user && userRank && (
          <Box
            p={3}
            bg="gray.50"
            _dark={{ bg: "gray.700" }}
            borderRadius="md"
            borderWidth="1px"
            borderColor="orange.300"
          >
            <Text fontSize="sm" textAlign="center">
              Your rank: <Badge colorPalette={getRankBadgeColor(userRank)}>#{userRank}</Badge>
            </Text>
          </Box>
        )}

        <Separator />

        {/* Leaderboard entries */}
        {leaderboardData?.entries.map((entry) => {
          const rankIcon = getRankIcon(entry.rank);
          const isCurrentUser = user?.uid === entry.userId;
          
          return (
            <Box
              key={entry.id}
              p={4}
              borderRadius="md"
              borderWidth={isCurrentUser ? "2px" : "1px"}
              borderColor={isCurrentUser ? "orange.500" : "gray.200"}
              bg={isCurrentUser ? "orange.50" : "transparent"}
              _hover={{ bg: "gray.50" }}
              transition="all 0.2s"
              css={{
                _dark: {
                  borderColor: isCurrentUser ? "orange.500" : "gray.600",
                  bg: isCurrentUser ? "orange.900" : "transparent",
                  _hover: {
                    bg: "gray.700"
                  }
                }
              }}
            >
              <HStack gap={4} justify="space-between">
                <HStack gap={3} flex={1}>
                  {/* Rank */}
                  <HStack gap={2} minW="60px">
                    <Icon color={rankIcon.color} boxSize={4}>
                      <rankIcon.icon />
                    </Icon>
                    <Badge
                      colorPalette={getRankBadgeColor(entry.rank)}
                      variant="solid"
                    >
                      #{entry.rank}
                    </Badge>
                  </HStack>

                  {/* Player info */}
                  <HStack gap={3} flex={1}>
                    {entry.photoURL ? (
                      <Image
                        src={entry.photoURL}
                        alt={entry.displayName}
                        boxSize="32px"
                        borderRadius="full"
                      />
                    ) : (
                      <Box bg="gray.300" borderRadius="full" boxSize="32px" />
                    )}
                    <VStack gap={0} align="start">
                      <Text fontWeight="medium" fontSize="sm">
                        {entry.displayName}
                        {isCurrentUser && (
                          <Badge ml={2} colorPalette="orange" size="sm">
                            You
                          </Badge>
                        )}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Prestige {entry.prestige} • {entry.achievementCount} achievements
                      </Text>
                    </VStack>
                  </HStack>
                </HStack>

                {/* Category value */}
                <VStack gap={0} align="end">
                  <Text fontWeight="bold" fontSize="lg">
                    {formatCategoryValue(entry, selectedCategory)}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {categoryLabels[selectedCategory]}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          );
        })}

        {(!leaderboardData?.entries || leaderboardData.entries.length === 0) && (
          <Center py={8}>
            <VStack gap={4}>
              <Text color="gray.500" fontSize="lg">🥙 No Chefs on the Leaderboard Yet!</Text>
              <Text color="gray.400" fontSize="sm" textAlign="center">
                Be the first to claim your spot in the Shawarma Kingdom!
              </Text>
              {user && shouldShowTestDataOption(user) && (
                <Button
                  colorPalette="orange"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const success = await generateTestLeaderboardData(user);
                    if (success) {
                      fetchLeaderboard();
                    }
                  }}
                >
                  Generate Test Data
                </Button>
              )}
              {!user && (
                <Text color="gray.400" fontSize="xs">
                  Sign in to join the competition!
                </Text>
              )}
            </VStack>
          </Center>
        )}

        {/* Footer */}
        {leaderboardData && (
          <Text fontSize="xs" color="gray.500" textAlign="center">
            Last updated: {new Date(leaderboardData.lastUpdated).toLocaleTimeString()}
          </Text>
        )}
      </VStack>
    </Box>

    {/* Stats Panel */}
    <LeaderboardStats
      userEntry={leaderboardData?.entries.find(entry => entry.userId === user?.uid)}
      totalPlayers={leaderboardData?.totalPlayers || 0}
      lastUpdated={leaderboardData?.lastUpdated || Date.now()}
    />
  </SimpleGrid>
  );
};
