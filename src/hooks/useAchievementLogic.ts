import { achievements } from "../data/achievementsData";
import type { Achievement } from "../components/shared/interfaces";

export function useAchievementLogic(state: any) {
  const isUnlocked = (achievement: Achievement): boolean => {
    try {
      if (
        achievement.id === "achievement-hunter" ||
        achievement.id === "completionist" ||
        achievement.id === "legend"
      ) {
        const currentUnlockedCount = achievements.filter((a) => {
          if (a.id === achievement.id) return false; // Don't count self
          try {
            return a.requirement(state, state.upgrades, state.trading);
          } catch {
            return false;
          }
        }).length;

        if (achievement.id === "achievement-hunter") {
          return currentUnlockedCount >= 25;
        }
        if (achievement.id === "completionist") {
          return currentUnlockedCount >= 50;
        }
        if (achievement.id === "legend") {
          return currentUnlockedCount >= 75;
        }
      }

      return achievement.requirement(state, state.upgrades, state.trading);
    } catch {
      return false;
    }
  };

  const unlockedCount = achievements.filter(isUnlocked).length;
  const totalCount = achievements.length;

  const getCategoryCount = (category: string): string => {
    const categoryAchievements = achievements.filter(
      (a) => a.category === category
    );
    const unlockedInCategory = categoryAchievements.filter(isUnlocked).length;
    return `${unlockedInCategory}/${categoryAchievements.length}`;
  };

  const filterAchievementsByCategory = (
    category: "all" | "clicker" | "trading" | "general"
  ): Achievement[] => {
    return category === "all"
      ? achievements
      : achievements.filter((achievement) => achievement.category === category);
  };

  return {
    isUnlocked,
    unlockedCount,
    totalCount,
    getCategoryCount,
    filterAchievementsByCategory,
  };
}
