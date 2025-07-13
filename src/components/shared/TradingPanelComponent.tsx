import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Badge,
} from "@chakra-ui/react";
import type { TradingPanelProps } from "./interfaces";
import { formatNumber } from "../../utils/gameUtils";

export function TradingPanel({
  selectedFood,
  currentPrice,
  tradeAmount,
  tradeType,
  portfolio,
  totalValue,
  shawarmas,
  onTradeAmountChange,
  onTradeTypeChange,
  onExecuteTrade,
}: TradingPanelProps) {
  const totalCost = currentPrice * tradeAmount;
  const owned = portfolio[selectedFood] || 0;
  const canBuy = shawarmas >= totalCost;
  const canSell = owned >= tradeAmount;
  const canExecute = tradeType === "buy" ? canBuy : canSell;

  return (
    <VStack gap={4} align="stretch">
      {/* Trading Controls */}
      <Box
        p={4}
        bg="rgba(74, 85, 104, 0.3)"
        borderWidth="1px"
        borderColor="gray.600"
        borderRadius="lg"
      >
        <VStack gap={4} align="stretch">
          <Text
            fontSize="lg"
            fontWeight="bold"
            color="white"
            textAlign="center"
          >
            Trading Panel
          </Text>

          {/* Buy/Sell Toggle */}
          <HStack gap={2}>
            <Button
              flex={1}
              colorScheme={tradeType === "buy" ? "green" : "gray"}
              variant={tradeType === "buy" ? "solid" : "outline"}
              onClick={() => onTradeTypeChange("buy")}
              size="md"
            >
              Buy
            </Button>
            <Button
              flex={1}
              colorScheme={tradeType === "sell" ? "red" : "gray"}
              variant={tradeType === "sell" ? "solid" : "outline"}
              onClick={() => onTradeTypeChange("sell")}
              size="md"
            >
              Sell
            </Button>
          </HStack>

          {/* Amount Input */}
          <VStack gap={2} align="stretch">
            <Text fontSize="sm" color="gray.300">
              Amount:
            </Text>
            <Input
              type="number"
              value={tradeAmount}
              onChange={(e) =>
                onTradeAmountChange(parseInt(e.target.value) || 1)
              }
              min={1}
              max={
                tradeType === "sell"
                  ? owned
                  : Math.floor(shawarmas / currentPrice)
              }
              bg="rgba(74, 85, 104, 0.4)"
              borderColor="gray.500"
              color="white"
              _focus={{
                borderColor: "blue.400",
                boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)",
              }}
            />
          </VStack>

          {/* Quick Amount Buttons */}
          <HStack gap={2}>
            {[1, 5, 10, 25].map((amount) => (
              <Button
                key={amount}
                size="sm"
                variant="outline"
                colorScheme="blue"
                onClick={() => onTradeAmountChange(amount)}
                disabled={
                  tradeType === "sell"
                    ? amount > owned
                    : amount > Math.floor(shawarmas / currentPrice)
                }
              >
                {amount}
              </Button>
            ))}
            <Button
              size="sm"
              variant="outline"
              colorScheme="blue"
              onClick={() =>
                onTradeAmountChange(
                  tradeType === "sell"
                    ? owned
                    : Math.floor(shawarmas / currentPrice)
                )
              }
              disabled={
                tradeType === "sell" ? owned === 0 : shawarmas < currentPrice
              }
            >
              Max
            </Button>
          </HStack>

          {/* Trade Summary */}
          <VStack gap={2} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.400">
                Unit Price:
              </Text>
              <Text fontSize="sm" fontWeight="semibold" color="white">
                {currentPrice.toFixed(3)} SHW
              </Text>
            </HStack>

            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.400">
                Total {tradeType === "buy" ? "Cost" : "Value"}:
              </Text>
              <Text fontSize="sm" fontWeight="semibold" color="white">
                {formatNumber(totalCost)} SHW
              </Text>
            </HStack>

            {tradeType === "sell" && owned > 0 && (
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.400">
                  You Own:
                </Text>
                <Badge colorScheme="green" variant="solid">
                  {owned} units
                </Badge>
              </HStack>
            )}
          </VStack>

          {/* Execute Button */}
          <Button
            colorScheme={tradeType === "buy" ? "green" : "red"}
            size="lg"
            onClick={onExecuteTrade}
            disabled={!canExecute}
            _disabled={{
              opacity: 0.4,
              cursor: "not-allowed",
            }}
          >
            {tradeType === "buy"
              ? `Buy ${tradeAmount} units for ${formatNumber(totalCost)} SHW`
              : `Sell ${tradeAmount} units for ${formatNumber(totalCost)} SHW`}
          </Button>

          {/* Status Messages */}
          {!canExecute && (
            <Text
              fontSize="sm"
              color="red.400"
              textAlign="center"
              fontWeight="medium"
            >
              {tradeType === "buy"
                ? "Insufficient shawarmas"
                : "Not enough units to sell"}
            </Text>
          )}
        </VStack>
      </Box>

      {/* Portfolio Summary */}
      <Box
        p={4}
        bg="rgba(74, 85, 104, 0.3)"
        borderWidth="1px"
        borderColor="gray.600"
        borderRadius="lg"
      >
        <VStack gap={3} align="stretch">
          <Text
            fontSize="md"
            fontWeight="bold"
            color="cyan.400"
            textAlign="center"
          >
            Portfolio Summary
          </Text>

          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.400">
              Total Portfolio Value:
            </Text>
            <Text fontSize="sm" fontWeight="bold" color="cyan.300">
              {formatNumber(totalValue)} SHW
            </Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.400">
              Available Shawarmas:
            </Text>
            <Text fontSize="sm" fontWeight="bold" color="orange.300">
              {formatNumber(shawarmas)} SHW
            </Text>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
}
