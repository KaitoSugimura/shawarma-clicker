import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Grid,
  Badge,
  Button,
} from "@chakra-ui/react";
import { useGame } from "../contexts/GameContext";

// Achievement interface
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (state: any, upgrades?: any, trading?: any) => boolean;
  category: "clicker" | "trading" | "general";
  reward?: string;
}

// Comprehensive achievements for both clicker and trading
const allAchievements: Achievement[] = [
  // === CLICKER ACHIEVEMENTS - BASIC ===
  {
    id: "first-click",
    name: "First Bite",
    description: "Click the shawarma for the first time",
    icon: "🥙",
    category: "clicker",
    requirement: (state) => state.clicker.totalShawarmasEarned >= 1,
  },
  {
    id: "ten-clicks",
    name: "Getting Started",
    description: "Click 10 times",
    icon: "👆",
    category: "clicker",
    requirement: (state) => state.stats.totalClicks >= 10,
  },
  {
    id: "hundred-clicks",
    name: "Clicking Enthusiast",
    description: "Click 100 times",
    icon: "�",
    category: "clicker",
    requirement: (state) => state.stats.totalClicks >= 100,
  },
  {
    id: "thousand-clicks",
    name: "Click Master",
    description: "Click 1,000 times",
    icon: "🖱️",
    category: "clicker",
    requirement: (state) => state.stats.totalClicks >= 1000,
  },
  {
    id: "ten-thousand-clicks",
    name: "Click Specialist",
    description: "Click 10,000 times",
    icon: "⚡",
    category: "clicker",
    requirement: (state) => state.stats.totalClicks >= 10000,
  },
  {
    id: "hundred-thousand-clicks",
    name: "Click Legend",
    description: "Click 100,000 times",
    icon: "🌟",
    category: "clicker",
    requirement: (state) => state.stats.totalClicks >= 100000,
  },

  // === CLICKER ACHIEVEMENTS - SHAWARMA MILESTONES ===
  {
    id: "ten-shawarmas",
    name: "First Dozen",
    description: "Earn 10 shawarmas",
    icon: "🔢",
    category: "clicker",
    requirement: (state) => state.clicker.totalShawarmasEarned >= 10,
  },
  {
    id: "hundred-shawarmas",
    name: "Shawarma Starter",
    description: "Earn 100 shawarmas",
    icon: "💯",
    category: "clicker",
    requirement: (state) => state.clicker.totalShawarmasEarned >= 100,
  },
  {
    id: "thousand-shawarmas",
    name: "Shawarma Enthusiast",
    description: "Earn 1,000 shawarmas",
    icon: "🎯",
    category: "clicker",
    requirement: (state) => state.clicker.totalShawarmasEarned >= 1000,
  },
  {
    id: "ten-thousand-shawarmas",
    name: "Shawarma Collector",
    description: "Earn 10,000 shawarmas",
    icon: "📈",
    category: "clicker",
    requirement: (state) => state.clicker.totalShawarmasEarned >= 10000,
  },
  {
    id: "hundred-thousand-shawarmas",
    name: "Shawarma Mogul",
    description: "Earn 100,000 shawarmas",
    icon: "🏰",
    category: "clicker",
    requirement: (state) => state.clicker.totalShawarmasEarned >= 100000,
  },
  {
    id: "million-shawarmas",
    name: "Shawarma Millionaire",
    description: "Earn 1 million shawarmas",
    icon: "💰",
    category: "clicker",
    requirement: (state) => state.clicker.totalShawarmasEarned >= 1000000,
  },
  {
    id: "ten-million-shawarmas",
    name: "Shawarma Empire",
    description: "Earn 10 million shawarmas",
    icon: "🏛️",
    category: "clicker",
    requirement: (state) => state.clicker.totalShawarmasEarned >= 10000000,
  },
  {
    id: "hundred-million-shawarmas",
    name: "Shawarma Titan",
    description: "Earn 100 million shawarmas",
    icon: "🌍",
    category: "clicker",
    requirement: (state) => state.clicker.totalShawarmasEarned >= 100000000,
  },

  // === CLICKER ACHIEVEMENTS - UPGRADES ===
  {
    id: "first-upgrade",
    name: "First Investment",
    description: "Purchase your first upgrade",
    icon: "🛍️",
    category: "clicker",
    requirement: (_, upgrades) => upgrades?.some((u: any) => u.owned > 0),
  },
  {
    id: "five-upgrades",
    name: "Smart Buyer",
    description: "Purchase 5 upgrades",
    icon: "🛒",
    category: "clicker",
    requirement: (state) => state.stats.totalUpgradesPurchased >= 5,
  },
  {
    id: "ten-upgrades",
    name: "Upgrade Collector",
    description: "Purchase 10 upgrades",
    icon: "📦",
    category: "clicker",
    requirement: (state) => state.stats.totalUpgradesPurchased >= 10,
  },
  {
    id: "twenty-five-upgrades",
    name: "Upgrade Enthusiast",
    description: "Purchase 25 upgrades",
    icon: "📋",
    category: "clicker",
    requirement: (state) => state.stats.totalUpgradesPurchased >= 25,
  },
  {
    id: "fifty-upgrades",
    name: "Upgrade Master",
    description: "Purchase 50 upgrades",
    icon: "🎖️",
    category: "clicker",
    requirement: (state) => state.stats.totalUpgradesPurchased >= 50,
  },
  {
    id: "hundred-upgrades",
    name: "Upgrade Legend",
    description: "Purchase 100 upgrades",
    icon: "🏆",
    category: "clicker",
    requirement: (state) => state.stats.totalUpgradesPurchased >= 100,
  },

  // === CLICKER ACHIEVEMENTS - CLICK UPGRADES ===
  {
    id: "first-click-upgrade",
    name: "Better Clicking",
    description: "Purchase your first click upgrade",
    icon: "�",
    category: "clicker",
    requirement: (state) => state.stats.totalClickUpgradesPurchased >= 1,
  },
  {
    id: "five-click-upgrades",
    name: "Click Enhancer",
    description: "Purchase 5 click upgrades",
    icon: "✋",
    category: "clicker",
    requirement: (state) => state.stats.totalClickUpgradesPurchased >= 5,
  },
  {
    id: "all-click-upgrades",
    name: "Maximum Power",
    description: "Purchase all available click upgrades",
    icon: "💪",
    category: "clicker",
    requirement: (state) => state.stats.totalClickUpgradesPurchased >= 8,
  },
  {
    id: "powerful-clicks",
    name: "Power Clicker",
    description: "Reach 50+ shawarmas per click",
    icon: "⚡",
    category: "clicker",
    requirement: (state) => state.clicker.shawarmasPerClick >= 50,
  },
  {
    id: "mega-clicks",
    name: "Mega Clicker",
    description: "Reach 100+ shawarmas per click",
    icon: "🔥",
    category: "clicker",
    requirement: (state) => state.clicker.shawarmasPerClick >= 100,
  },
  {
    id: "ultra-clicks",
    name: "Ultra Clicker",
    description: "Reach 250+ shawarmas per click",
    icon: "💥",
    category: "clicker",
    requirement: (state) => state.clicker.shawarmasPerClick >= 250,
  },

  // === CLICKER ACHIEVEMENTS - PRODUCTION ===
  {
    id: "auto-production",
    name: "Passive Income",
    description: "Reach 1 shawarma per second",
    icon: "⚙️",
    category: "clicker",
    requirement: (state) => state.clicker.shawarmasPerSecond >= 1,
  },
  {
    id: "steady-production",
    name: "Steady Flow",
    description: "Reach 10 shawarmas per second",
    icon: "🌊",
    category: "clicker",
    requirement: (state) => state.clicker.shawarmasPerSecond >= 10,
  },
  {
    id: "production-master",
    name: "Production Master",
    description: "Reach 100 shawarmas per second",
    icon: "🏭",
    category: "clicker",
    requirement: (state) => state.clicker.shawarmasPerSecond >= 100,
  },
  {
    id: "production-titan",
    name: "Production Titan",
    description: "Reach 1,000 shawarmas per second",
    icon: "⚡",
    category: "clicker",
    requirement: (state) => state.clicker.shawarmasPerSecond >= 1000,
  },
  {
    id: "production-god",
    name: "Production God",
    description: "Reach 10,000 shawarmas per second",
    icon: "�",
    category: "clicker",
    requirement: (state) => state.clicker.shawarmasPerSecond >= 10000,
  },

  // === TRADING ACHIEVEMENTS - BASIC ===
  {
    id: "first-trade",
    name: "Market Debut",
    description: "Make your first trade in the food exchange",
    icon: "📈",
    category: "trading",
    requirement: (state) => state.stats.totalTrades >= 1,
  },
  {
    id: "five-trades",
    name: "Getting Trading",
    description: "Complete 5 trades",
    icon: "📊",
    category: "trading",
    requirement: (state) => state.stats.totalTrades >= 5,
  },
  {
    id: "ten-trades",
    name: "Active Trader",
    description: "Complete 10 trades",
    icon: "�",
    category: "trading",
    requirement: (state) => state.stats.totalTrades >= 10,
  },
  {
    id: "twenty-five-trades",
    name: "Frequent Trader",
    description: "Complete 25 trades",
    icon: "📋",
    category: "trading",
    requirement: (state) => state.stats.totalTrades >= 25,
  },
  {
    id: "fifty-trades",
    name: "Trading Regular",
    description: "Complete 50 trades",
    icon: "📌",
    category: "trading",
    requirement: (state) => state.stats.totalTrades >= 50,
  },
  {
    id: "hundred-trades",
    name: "Trading Veteran",
    description: "Complete 100 trades",
    icon: "🎖️",
    category: "trading",
    requirement: (state) => state.stats.totalTrades >= 100,
  },
  {
    id: "thousand-trades",
    name: "Trading Master",
    description: "Complete 1,000 trades",
    icon: "🏆",
    category: "trading",
    requirement: (state) => state.stats.totalTrades >= 1000,
  },

  // === TRADING ACHIEVEMENTS - PROFIT ===
  {
    id: "first-profit",
    name: "Profit Maker",
    description: "Make your first profitable trade",
    icon: "💹",
    category: "trading",
    requirement: (state) => state.stats.totalProfit > 0,
  },
  {
    id: "hundred-profit",
    name: "Growing Wealth",
    description: "Earn 100 shawarma profit from trading",
    icon: "💰",
    category: "trading",
    requirement: (state) => state.stats.totalProfit >= 100,
  },
  {
    id: "thousand-profit",
    name: "Market Genius",
    description: "Earn 1,000 shawarma profit from trading",
    icon: "🧠",
    category: "trading",
    requirement: (state) => state.stats.totalProfit >= 1000,
  },
  {
    id: "ten-thousand-profit",
    name: "Trading Tycoon",
    description: "Earn 10,000 shawarma profit from trading",
    icon: "💎",
    category: "trading",
    requirement: (state) => state.stats.totalProfit >= 10000,
  },
  {
    id: "hundred-thousand-profit",
    name: "Wall Street Wolf",
    description: "Earn 100,000 shawarma profit from trading",
    icon: "🐺",
    category: "trading",
    requirement: (state) => state.stats.totalProfit >= 100000,
  },
  {
    id: "million-profit",
    name: "Trading Legend",
    description: "Earn 1 million shawarma profit from trading",
    icon: "👑",
    category: "trading",
    requirement: (state) => state.stats.totalProfit >= 1000000,
  },

  // === TRADING ACHIEVEMENTS - PORTFOLIO ===
  {
    id: "first-food",
    name: "Food Collector",
    description: "Buy your first food item",
    icon: "🍎",
    category: "trading",
    requirement: (state) => {
      const portfolio = state.trading.portfolio;
      return Object.values(portfolio).some((amount: any) => amount > 0);
    },
  },
  {
    id: "diversified",
    name: "Diversified Portfolio",
    description: "Own at least 10 units of 3 different food items",
    icon: "🗂️",
    category: "trading",
    requirement: (state) => {
      const portfolio = state.trading.portfolio;
      const diversifiedItems = Object.values(portfolio).filter(
        (amount: any) => amount >= 10
      );
      return diversifiedItems.length >= 3;
    },
  },
  {
    id: "well-diversified",
    name: "Well Diversified",
    description: "Own at least 10 units of 5 different food items",
    icon: "📊",
    category: "trading",
    requirement: (state) => {
      const portfolio = state.trading.portfolio;
      const diversifiedItems = Object.values(portfolio).filter(
        (amount: any) => amount >= 10
      );
      return diversifiedItems.length >= 5;
    },
  },
  {
    id: "food-baron",
    name: "Food Baron",
    description: "Own at least 25 units of 5 different food items",
    icon: "🏰",
    category: "trading",
    requirement: (state) => {
      const portfolio = state.trading.portfolio;
      const diversifiedItems = Object.values(portfolio).filter(
        (amount: any) => amount >= 25
      );
      return diversifiedItems.length >= 5;
    },
  },
  {
    id: "food-hoarder",
    name: "Food Hoarder",
    description: "Own 100 units of any single food item",
    icon: "🏪",
    category: "trading",
    requirement: (state) => {
      const portfolio = state.trading.portfolio;
      return Object.values(portfolio).some((amount: any) => amount >= 100);
    },
  },
  {
    id: "food-empire",
    name: "Food Empire",
    description: "Own 500 units of any single food item",
    icon: "🏛️",
    category: "trading",
    requirement: (state) => {
      const portfolio = state.trading.portfolio;
      return Object.values(portfolio).some((amount: any) => amount >= 500);
    },
  },
  {
    id: "food-monopoly",
    name: "Food Monopoly",
    description: "Own 1,000 units of any single food item",
    icon: "🌍",
    category: "trading",
    requirement: (state) => {
      const portfolio = state.trading.portfolio;
      return Object.values(portfolio).some((amount: any) => amount >= 1000);
    },
  },

  // === TRADING ACHIEVEMENTS - STRATEGY ===
  {
    id: "market-timing",
    name: "Perfect Timing",
    description: "Buy low and sell high with 50% profit margin",
    icon: "⏰",
    category: "trading",
    requirement: (state) => state.stats.bestTradeProfit >= 50,
  },
  {
    id: "day-trader",
    name: "Day Trader",
    description: "Complete 10 trades in a single session",
    icon: "📅",
    category: "trading",
    requirement: (state) => state.stats.tradesInSession >= 10,
  },
  {
    id: "patient-investor",
    name: "Patient Investor",
    description: "Hold a food item for over 5 minutes before selling",
    icon: "⌛",
    category: "trading",
    requirement: (state) => state.stats.longestHoldTime >= 300,
  },
  {
    id: "quick-flip",
    name: "Quick Flip",
    description: "Buy and sell within 10 seconds for profit",
    icon: "⚡",
    category: "trading",
    requirement: (state) => state.stats.quickestProfitableFlip <= 10,
  },

  // === GENERAL ACHIEVEMENTS - TIME ===
  {
    id: "early-adopter",
    name: "Early Adopter",
    description: "Play for 5 minutes straight",
    icon: "⏳",
    category: "general",
    requirement: (state) => state.stats.playTime >= 300,
  },
  {
    id: "committed-player",
    name: "Committed Player",
    description: "Play for 30 minutes total",
    icon: "🕰️",
    category: "general",
    requirement: (state) => state.stats.playTime >= 1800,
  },
  {
    id: "dedicated-player",
    name: "Dedicated Player",
    description: "Play for 1 hour total",
    icon: "🎮",
    category: "general",
    requirement: (state) => state.stats.playTime >= 3600,
  },
  {
    id: "hardcore-player",
    name: "Hardcore Player",
    description: "Play for 5 hours total",
    icon: "🔥",
    category: "general",
    requirement: (state) => state.stats.playTime >= 18000,
  },
  {
    id: "marathon-player",
    name: "Marathon Player",
    description: "Play for 24 hours total",
    icon: "🏃",
    category: "general",
    requirement: (state) => state.stats.playTime >= 86400,
  },

  // === GENERAL ACHIEVEMENTS - SPECIAL ===
  {
    id: "reset-courage",
    name: "Fresh Start",
    description: "Reset your progress once",
    icon: "🔄",
    category: "general",
    requirement: (state) => state.stats.totalResets >= 1,
  },
  {
    id: "persistent-player",
    name: "Persistent Player",
    description: "Reset your progress 5 times",
    icon: "🔁",
    category: "general",
    requirement: (state) => state.stats.totalResets >= 5,
  },
  {
    id: "jack-of-all-trades",
    name: "Jack of All Trades",
    description: "Own every type of upgrade and have traded every food item",
    icon: "🎭",
    category: "general",
    requirement: (state) => {
      const hasAllUpgrades = state.stats.totalUpgradesPurchased >= 20; // Adjust based on total upgrades
      const hasAllFoods = Object.keys(state.trading.portfolio).length >= 10; // Adjust based on total foods
      return hasAllUpgrades && hasAllFoods;
    },
  },
  {
    id: "balanced-approach",
    name: "Balanced Approach",
    description: "Earn 10,000 from clicking and 10,000 from trading",
    icon: "⚖️",
    category: "general",
    requirement: (state) => {
      const clickingEarnings = state.clicker.totalShawarmasEarned;
      const tradingProfit = state.stats.totalProfit;
      return clickingEarnings >= 10000 && tradingProfit >= 10000;
    },
  },
  {
    id: "efficiency-expert",
    name: "Efficiency Expert",
    description:
      "Maintain 1000+ shawarmas per second while having 100+ shawarmas per click",
    icon: "⚡",
    category: "general",
    requirement: (state) => {
      return (
        state.clicker.shawarmasPerSecond >= 1000 &&
        state.clicker.shawarmasPerClick >= 100
      );
    },
  },
  {
    id: "number-cruncher",
    name: "Number Cruncher",
    description: "Reach 1 billion total shawarmas earned",
    icon: "🔢",
    category: "general",
    requirement: (state) => state.clicker.totalShawarmasEarned >= 1000000000,
  },
  {
    id: "completionist",
    name: "Completionist",
    description: "Unlock 50 achievements",
    icon: "🏆",
    category: "general",
    requirement: () => {
      // This will be calculated dynamically
      return false; // Placeholder - will be calculated in component
    },
  },
  {
    id: "achievement-hunter",
    name: "Achievement Hunter",
    description: "Unlock 25 achievements",
    icon: "🎯",
    category: "general",
    requirement: () => {
      // This will be calculated dynamically
      return false; // Placeholder - will be calculated in component
    },
  },
  {
    id: "legend",
    name: "Shawarma Legend",
    description: "Unlock 75 achievements",
    icon: "👑",
    category: "general",
    requirement: () => {
      // This will be calculated dynamically
      return false; // Placeholder - will be calculated in component
    },
  },
];

const AchievementsPanel: React.FC = () => {
  const { state } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "clicker" | "trading" | "general"
  >("all");

  // Filter achievements by category
  const filteredAchievements =
    selectedCategory === "all"
      ? allAchievements
      : allAchievements.filter(
          (achievement) => achievement.category === selectedCategory
        );

  // Check if achievement is unlocked
  const isUnlocked = (achievement: Achievement) => {
    try {
      // Handle dynamic achievements that depend on other achievements being unlocked
      if (
        achievement.id === "achievement-hunter" ||
        achievement.id === "completionist" ||
        achievement.id === "legend"
      ) {
        const currentUnlockedCount = allAchievements.filter((a) => {
          if (a.id === achievement.id) return false; // Don't count self
          try {
            return a.requirement(state, state.upgrades, state.trading);
          } catch {
            return false;
          }
        }).length;

        if (achievement.id === "achievement-hunter") {
          return currentUnlockedCount >= 25;
        } else if (achievement.id === "completionist") {
          return currentUnlockedCount >= 50;
        } else if (achievement.id === "legend") {
          return currentUnlockedCount >= 75;
        }
      }

      return achievement.requirement(state, state.upgrades, state.trading);
    } catch {
      return false;
    }
  };

  // Count unlocked achievements
  const unlockedCount = allAchievements.filter(isUnlocked).length;
  const totalCount = allAchievements.length;

  // Get category counts
  const getCategoryCount = (category: string) => {
    const categoryAchievements = allAchievements.filter(
      (a) => a.category === category
    );
    const unlockedInCategory = categoryAchievements.filter(isUnlocked).length;
    return `${unlockedInCategory}/${categoryAchievements.length}`;
  };

  return (
    <Box
      h="full"
      bg="rgba(26, 32, 44, 0.95)"
      color="white"
      overflowY="auto"
      css={{
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background: "rgba(74, 85, 104, 0.3)",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(203, 166, 247, 0.5)",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "rgba(203, 166, 247, 0.7)",
        },
      }}
    >
      <VStack gap={6} align="stretch" p={6}>
        {/* Header */}
        <Box textAlign="center">
          <Text fontSize="3xl" fontWeight="bold" color="yellow.400" mb={2}>
            🏆 Achievements
          </Text>
          <Text fontSize="lg" color="gray.300">
            {unlockedCount} / {totalCount} Unlocked
          </Text>
          <Box
            w="full"
            h="4"
            bg="rgba(74, 85, 104, 0.6)"
            borderRadius="full"
            overflow="hidden"
            mt={3}
          >
            <Box
              h="full"
              bg="linear-gradient(90deg, yellow.400, orange.400)"
              borderRadius="full"
              w={`${(unlockedCount / totalCount) * 100}%`}
              transition="width 0.3s ease"
            />
          </Box>
        </Box>

        {/* Category Filter Buttons */}
        <HStack justify="center" gap={2} wrap="wrap">
          <Button
            size="sm"
            variant={selectedCategory === "all" ? "solid" : "outline"}
            colorScheme="yellow"
            onClick={() => setSelectedCategory("all")}
          >
            All ({unlockedCount}/{totalCount})
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === "clicker" ? "solid" : "outline"}
            colorScheme="orange"
            onClick={() => setSelectedCategory("clicker")}
          >
            🥙 Clicker ({getCategoryCount("clicker")})
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === "trading" ? "solid" : "outline"}
            colorScheme="blue"
            onClick={() => setSelectedCategory("trading")}
          >
            📈 Trading ({getCategoryCount("trading")})
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === "general" ? "solid" : "outline"}
            colorScheme="purple"
            onClick={() => setSelectedCategory("general")}
          >
            👑 General ({getCategoryCount("general")})
          </Button>
        </HStack>

        {/* Achievement Grid */}
        <AchievementGrid
          achievements={filteredAchievements}
          isUnlocked={isUnlocked}
        />
      </VStack>
    </Box>
  );
};

// Achievement Grid Component
interface AchievementGridProps {
  achievements: Achievement[];
  isUnlocked: (achievement: Achievement) => boolean;
}

const AchievementGrid: React.FC<AchievementGridProps> = ({
  achievements,
  isUnlocked,
}) => {
  return (
    <Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={4}>
      {achievements.map((achievement) => {
        const unlocked = isUnlocked(achievement);
        return (
          <Box
            key={achievement.id}
            p={4}
            bg={unlocked ? "rgba(72, 187, 120, 0.1)" : "rgba(74, 85, 104, 0.3)"}
            borderWidth="2px"
            borderColor={unlocked ? "green.400" : "gray.600"}
            borderRadius="lg"
            position="relative"
            overflow="hidden"
            transition="all 0.2s"
            _hover={
              unlocked
                ? {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(72, 187, 120, 0.3)",
                  }
                : {}
            }
          >
            <VStack align="start" gap={3}>
              <HStack justify="space-between" w="full">
                <HStack gap={3}>
                  <Text fontSize="2xl">{achievement.icon}</Text>
                  <VStack align="start" gap={1}>
                    <Text fontSize="lg" fontWeight="bold" color="white">
                      {achievement.name}
                    </Text>
                    <Badge
                      colorScheme={
                        achievement.category === "clicker"
                          ? "orange"
                          : achievement.category === "trading"
                          ? "blue"
                          : "purple"
                      }
                      size="sm"
                    >
                      {achievement.category}
                    </Badge>
                  </VStack>
                </HStack>
                <Text fontSize="2xl">{unlocked ? "🏆" : "🔒"}</Text>
              </HStack>

              <Text fontSize="sm" color="gray.300" lineHeight="1.4">
                {achievement.description}
              </Text>

              {achievement.reward && unlocked && (
                <Box
                  p={2}
                  bg="rgba(72, 187, 120, 0.2)"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="green.400"
                >
                  <Text fontSize="xs" color="green.300" fontWeight="bold">
                    Reward: {achievement.reward}
                  </Text>
                </Box>
              )}
            </VStack>

            {unlocked && (
              <Box
                position="absolute"
                top="0"
                right="0"
                bg="green.400"
                color="white"
                fontSize="xs"
                px={2}
                py={1}
                transform="rotate(45deg) translate(30%, -30%)"
                w="60px"
                textAlign="center"
                fontWeight="bold"
              >
                ✓
              </Box>
            )}
          </Box>
        );
      })}
    </Grid>
  );
};

export default AchievementsPanel;
