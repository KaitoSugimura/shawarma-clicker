import { Box, VStack, Text, HStack } from "@chakra-ui/react";

interface AchievementProgressSectionProps {
  achievementsCount: number;
  totalAchievements: number;
}

export function AchievementProgressSection({
  achievementsCount,
  totalAchievements = 42,
}: AchievementProgressSectionProps) {
  const progressPercentage = (achievementsCount / totalAchievements) * 100;

  return (
    <VStack gap={3} align="stretch">
      <HStack justify="space-between">
        <Text fontSize="lg" color="gray.300" fontWeight="medium">
          🏆 Achievement Progress
        </Text>
        <Text fontSize="sm" color="gray.400">
          {achievementsCount}/{totalAchievements}
        </Text>
      </HStack>

      <Box
        w="100%"
        h="8px"
        bg="gray.700"
        borderRadius="full"
        overflow="hidden"
        position="relative"
      >
        <Box
          h="100%"
          bg="linear-gradient(90deg, blue.400, purple.400)"
          borderRadius="full"
          width={`${progressPercentage}%`}
          transition="width 0.3s ease"
        />
      </Box>

      <Text fontSize="sm" color="gray.400" textAlign="center">
        {progressPercentage.toFixed(1)}% Complete
      </Text>
    </VStack>
  );
}
