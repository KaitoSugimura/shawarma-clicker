import { useState } from "react";
import { Box, VStack } from "@chakra-ui/react";
import { useGame } from "../contexts/GameContext";
import { useAchievementLogic } from "../hooks/useAchievementLogic";
import { AchievementProgressBar } from "./shared/AchievementProgressBar";
import { CategoryFilter } from "./shared/CategoryFilter";
import { AchievementGrid } from "./shared/AchievementGrid";

export default function AchievementsPanel() {
  const { state } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "clicker" | "trading" | "general"
  >("all");

  const {
    isUnlocked,
    unlockedCount,
    totalCount,
    getCategoryCount,
    filterAchievementsByCategory,
  } = useAchievementLogic(state);

  const filteredAchievements = filterAchievementsByCategory(selectedCategory);

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
        <AchievementProgressBar
          unlockedCount={unlockedCount}
          totalCount={totalCount}
        />

        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          unlockedCount={unlockedCount}
          totalCount={totalCount}
          getCategoryCount={getCategoryCount}
        />

        <AchievementGrid
          achievements={filteredAchievements}
          isUnlocked={isUnlocked}
        />
      </VStack>
    </Box>
  );
}
