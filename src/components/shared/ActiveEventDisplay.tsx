import { Box, Text, VStack, HStack } from "@chakra-ui/react";
import type { SpecialEvent } from "../../types/game";

interface ActiveEventDisplayProps {
  activeEvents: SpecialEvent[];
}

export function ActiveEventDisplay({ activeEvents }: ActiveEventDisplayProps) {
  if (activeEvents.length === 0) {
    return null;
  }

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "golden_shawarma":
        return "yellow.300";
      case "frenzy":
        return "red.300";
      case "lucky_bonus":
        return "green.300";
      default:
        return "blue.300";
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "golden_shawarma":
        return "🥙✨";
      case "frenzy":
        return "🔥";
      case "lucky_bonus":
        return "🍀";
      default:
        return "⭐";
    }
  };

  return (
    <VStack
      position="fixed"
      bottom="20px"
      left="20px"
      gap={2}
      align="stretch"
      zIndex={999}
    >
      {activeEvents.map((event) => {
        const timeLeft = event.duration - (Date.now() - event.startTime);
        if (timeLeft <= 0) return null;

        return (
          <Box
            key={event.id}
            p={3}
            bg="rgba(0, 0, 0, 0.8)"
            borderRadius="md"
            border="2px solid"
            borderColor={getEventColor(event.type)}
            minW="200px"
          >
            <HStack justify="space-between" align="center">
              <HStack>
                <Text fontSize="lg">{getEventIcon(event.type)}</Text>
                <VStack align="start" gap={0}>
                  <Text color="white" fontSize="sm" fontWeight="bold">
                    {event.name}
                  </Text>
                  <Text color="gray.300" fontSize="xs">
                    {event.multiplier}x Multiplier
                  </Text>
                </VStack>
              </HStack>
              <Text
                color={getEventColor(event.type)}
                fontSize="sm"
                fontWeight="bold"
              >
                {formatTime(timeLeft)}
              </Text>
            </HStack>
          </Box>
        );
      })}
    </VStack>
  );
}
