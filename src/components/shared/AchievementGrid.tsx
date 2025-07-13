import { Box, VStack, HStack, Text, Grid, Badge } from "@chakra-ui/react";
import type { AchievementGridProps } from "./interfaces";

export function AchievementGrid({
  achievements,
  isUnlocked,
}: AchievementGridProps) {
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
}
