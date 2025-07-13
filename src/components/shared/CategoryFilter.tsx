import { HStack, Button } from "@chakra-ui/react";
import type { CategoryFilterProps } from "./interfaces";

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  unlockedCount,
  totalCount,
  getCategoryCount,
}: CategoryFilterProps) {
  return (
    <HStack justify="center" gap={2} wrap="wrap">
      <Button
        size="sm"
        variant={selectedCategory === "all" ? "solid" : "outline"}
        colorScheme="yellow"
        onClick={() => onCategoryChange("all")}
      >
        All ({unlockedCount}/{totalCount})
      </Button>
      <Button
        size="sm"
        variant={selectedCategory === "clicker" ? "solid" : "outline"}
        colorScheme="orange"
        onClick={() => onCategoryChange("clicker")}
      >
        🥙 Clicker ({getCategoryCount("clicker")})
      </Button>
      <Button
        size="sm"
        variant={selectedCategory === "trading" ? "solid" : "outline"}
        colorScheme="blue"
        onClick={() => onCategoryChange("trading")}
      >
        📈 Trading ({getCategoryCount("trading")})
      </Button>
      <Button
        size="sm"
        variant={selectedCategory === "general" ? "solid" : "outline"}
        colorScheme="purple"
        onClick={() => onCategoryChange("general")}
      >
        👑 General ({getCategoryCount("general")})
      </Button>
    </HStack>
  );
}
