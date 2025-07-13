import { Box, VStack, HStack, Text } from "@chakra-ui/react";
import type { EfficiencyStatsProps } from "./interfaces";
import { formatNumber, formatPerSecond } from "../../utils/gameUtils";

export function EfficiencyStats({
  shawarmasPerSecond,
  shawarmasPerClick,
  clickMultiplier,
}: EfficiencyStatsProps) {
  return (
    <Box
      position="absolute"
      top={{ base: "10px", md: "20px" }}
      right={{ base: "10px", md: "20px" }}
      p={{ base: 2, md: 3 }}
      bg="rgba(26, 32, 44, 0.6)"
      borderRadius="md"
      backdropFilter="blur(8px)"
      minW={{ base: "120px", md: "180px" }}
      zIndex="5"
      display={{ base: "block", md: "block" }}
      fontSize={{ base: "xs", md: "sm" }}
      border="none"
      outline="none"
      boxShadow="none"
    >
      <VStack gap={1} align="stretch">
        <Text
          fontSize={{ base: "xs", md: "sm" }}
          fontWeight="bold"
          color="cyan.300"
          textAlign="center"
        >
          ⚡ Stats
        </Text>

        <HStack justify="space-between">
          <Text fontSize={{ base: "xs", md: "xs" }} color="gray.400">
            Per Second
          </Text>
          <Text
            fontSize={{ base: "xs", md: "xs" }}
            fontWeight="bold"
            color="cyan.300"
          >
            {formatPerSecond(shawarmasPerSecond)}
          </Text>
        </HStack>

        <HStack justify="space-between">
          <Text fontSize={{ base: "xs", md: "xs" }} color="gray.400">
            Per Click
          </Text>
          <Text
            fontSize={{ base: "xs", md: "xs" }}
            fontWeight="bold"
            color="cyan.300"
          >
            {formatNumber(shawarmasPerClick * clickMultiplier)}
          </Text>
        </HStack>

        {shawarmasPerSecond > 0 && (
          <HStack justify="space-between">
            <Text fontSize={{ base: "xs", md: "xs" }} color="gray.400">
              1K in
            </Text>
            <Text
              fontSize={{ base: "xs", md: "xs" }}
              fontWeight="bold"
              color="cyan.300"
            >
              {Math.ceil(1000 / shawarmasPerSecond)}s
            </Text>
          </HStack>
        )}

        {clickMultiplier > 1 && (
          <HStack justify="space-between">
            <Text fontSize={{ base: "xs", md: "xs" }} color="gray.400">
              Frenzy
            </Text>
            <Text
              fontSize={{ base: "xs", md: "xs" }}
              fontWeight="bold"
              color="purple.300"
            >
              🔥{clickMultiplier}x
            </Text>
          </HStack>
        )}
      </VStack>
    </Box>
  );
}
