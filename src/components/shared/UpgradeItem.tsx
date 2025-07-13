import { Box, HStack, VStack, Text, Badge } from "@chakra-ui/react";
import type { UpgradeItemProps } from "./interfaces";
import { formatNumber } from "../../utils/gameUtils";

export function UpgradeItem({
  upgrade,
  canAfford,
  onBuy,
  isProduction = true,
}: UpgradeItemProps) {
  const isOwned = isProduction ? upgrade.owned > 0 : upgrade.owned;
  const isClickUpgrade = !isProduction;

  return (
    <Box
      p={3}
      w="full"
      bg={
        isClickUpgrade && isOwned
          ? "rgba(72, 187, 120, 0.1)"
          : canAfford
          ? isProduction
            ? "rgba(251, 211, 141, 0.1)"
            : "rgba(196, 181, 253, 0.1)"
          : "rgba(74, 85, 104, 0.3)"
      }
      borderWidth="1px"
      borderColor={
        isClickUpgrade && isOwned
          ? "green.400"
          : canAfford
          ? isProduction
            ? "orange.400"
            : "purple.400"
          : "gray.600"
      }
      borderRadius="lg"
      cursor={
        (isClickUpgrade && isOwned) || (!isClickUpgrade && !canAfford)
          ? "not-allowed"
          : "pointer"
      }
      opacity={isClickUpgrade && isOwned ? 0.8 : canAfford ? 1 : 0.6}
      onClick={() => {
        if (canAfford && !(isClickUpgrade && isOwned)) {
          onBuy(upgrade);
        }
      }}
      _hover={
        canAfford && !(isClickUpgrade && isOwned)
          ? {
              bg: isProduction
                ? "rgba(251, 211, 141, 0.2)"
                : "rgba(196, 181, 253, 0.2)",
              borderColor: isProduction ? "orange.300" : "purple.300",
              transform: "translateY(-2px)",
              boxShadow: isProduction
                ? "0 4px 12px rgba(251, 211, 141, 0.3)"
                : "0 4px 12px rgba(196, 181, 253, 0.3)",
            }
          : {}
      }
      _focus={{ boxShadow: "none" }}
      transition="all 0.2s"
    >
      <HStack justify="space-between">
        <VStack align="start" gap={1} flex={1}>
          <HStack>
            {isProduction && <Text fontSize="2xl">{upgrade.icon}</Text>}
            <Text fontWeight="semibold" fontSize="sm" color="white">
              {upgrade.name}
            </Text>
            {isProduction && upgrade.owned > 0 && (
              <Badge
                colorScheme="orange"
                variant="solid"
                userSelect="none"
                _selection={{ bg: "transparent" }}
                px={2}
                py={0.5}
                borderRadius="md"
              >
                {upgrade.owned}
              </Badge>
            )}
            {isClickUpgrade && upgrade.owned && (
              <Badge
                colorScheme="green"
                variant="solid"
                userSelect="none"
                _selection={{ bg: "transparent" }}
                px={2}
                py={0.5}
                borderRadius="md"
              >
                OWNED
              </Badge>
            )}
          </HStack>
          <Text fontSize="xs" color="gray.400">
            {upgrade.description}
          </Text>
          {isProduction && (
            <Text fontSize="xs" color="orange.300">
              +{(upgrade.baseProduction * upgrade.owned).toFixed(1)}/sec
            </Text>
          )}
        </VStack>

        {isProduction ? (
          <VStack align="end" gap={1}>
            <Text fontSize="sm" fontWeight="bold" color="green.400">
              {formatNumber(upgrade.cost)}
            </Text>
          </VStack>
        ) : (
          <Text
            fontSize="sm"
            fontWeight="bold"
            color={upgrade.owned ? "green.400" : "green.400"}
          >
            {upgrade.owned ? "OWNED" : formatNumber(upgrade.cost)}
          </Text>
        )}
      </HStack>
    </Box>
  );
}
