import { Box, Text } from "@chakra-ui/react";

interface AchievementProgressBarProps {
  unlockedCount: number;
  totalCount: number;
}

export function AchievementProgressBar({
  unlockedCount,
  totalCount,
}: AchievementProgressBarProps) {
  const progressPercentage = (unlockedCount / totalCount) * 100;

  return (
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
          w={`${progressPercentage}%`}
          transition="width 0.3s ease"
        />
      </Box>
    </Box>
  );
}
