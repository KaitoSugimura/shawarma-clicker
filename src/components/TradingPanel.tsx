import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Grid,
  Badge,
  Input,
} from "@chakra-ui/react";
import { toaster } from "../components/ui/toaster";
import CandlestickChart from "./CandlestickChart";
import type { TradingData } from "../types/trading";
import { FOOD_ITEMS, TRADING_CONFIG } from "../data/tradingData";
import { formatNumber } from "../utils/gameUtils";
import { useGame } from "../contexts/GameContext";

const TradingPanel: React.FC = () => {
  const {
    state,
    executeTrade: contextExecuteTrade,
    updateTradingState,
  } = useGame();
  const { clicker, trading } = state;

  const [tradeAmount, setTradeAmount] = useState<number>(1);
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [priceFlash, setPriceFlash] = useState<{
    [key: string]: "up" | "down" | null;
  }>({});
  const [lastFlashTime, setLastFlashTime] = useState<{ [key: string]: number }>(
    {}
  );

  const selectedFoodItem = FOOD_ITEMS.find(
    (f) => f.id === trading.selectedFood
  )!;
  const currentPrice = trading.currentPrices[trading.selectedFood];

  useEffect(() => {}, []);

  useEffect(() => {
    const priceUpdateInterval = setInterval(() => {
      const newPrices = { ...trading.currentPrices };
      const newFlash: { [key: string]: "up" | "down" | null } = {};
      const currentTime = Date.now();
      let newVolatilityPeriods = { ...trading.volatilityPeriods };

      if (
        currentTime - trading.lastVolatilityCheck >
        TRADING_CONFIG.VOLATILITY_PERIOD_MIN
      ) {
        const randomChance = Math.random();
        if (randomChance < 0.1) {
          const availableFoods = FOOD_ITEMS.filter(
            (food) => !trading.volatilityPeriods[food.id]?.active
          );
          if (availableFoods.length > 0) {
            const selectedFood =
              availableFoods[Math.floor(Math.random() * availableFoods.length)];
            newVolatilityPeriods[selectedFood.id] = {
              active: true,
              endTime: currentTime + TRADING_CONFIG.VOLATILITY_PERIOD_DURATION,
              multiplier: TRADING_CONFIG.VOLATILITY_PERIOD_MULTIPLIER,
              startPrice: newPrices[selectedFood.id],
            };

            toaster.create({
              title: "🚀 BULL RUN ALERT!",
              description: `${selectedFood.name} (${selectedFood.symbol}) is entering a bull run! Prices are surging upward!`,
              type: "success",
              duration: 5000,
            });
          }
        }

        updateTradingState({ lastVolatilityCheck: currentTime });
      }

      Object.keys(newVolatilityPeriods).forEach((foodId) => {
        if (
          newVolatilityPeriods[foodId].active &&
          currentTime > newVolatilityPeriods[foodId].endTime
        ) {
          newVolatilityPeriods[foodId] = {
            active: false,
            endTime: 0,
            multiplier: 1,
            startPrice: undefined,
          };
        }
      });

      FOOD_ITEMS.forEach((food) => {
        const currentPrice = newPrices[food.id];

        const volatilityPeriod = newVolatilityPeriods[food.id];
        const baseVolatility =
          food.volatility * TRADING_CONFIG.VOLATILITY_MULTIPLIER;
        const volatility = volatilityPeriod?.active
          ? baseVolatility * volatilityPeriod.multiplier
          : baseVolatility;

        const change = volatilityPeriod?.active
          ? Math.random() * volatility * currentPrice
          : (Math.random() - 0.5) * 2 * volatility * currentPrice;

        let newPrice = Math.max(0.001, currentPrice + change);

        // Limit bull run to 400% max increase
        if (volatilityPeriod?.active && volatilityPeriod.startPrice) {
          const maxPrice = volatilityPeriod.startPrice * 5; // 400% increase = 5x original
          newPrice = Math.min(newPrice, maxPrice);
        }

        const priceChangePercent =
          Math.abs((newPrice - currentPrice) / currentPrice) * 100;
        const lastFlash = lastFlashTime[food.id] || 0;
        const timeSinceLastFlash = currentTime - lastFlash;

        if (priceChangePercent > 1 && timeSinceLastFlash > 1000) {
          newFlash[food.id] =
            newPrice > currentPrice
              ? "up"
              : newPrice < currentPrice
              ? "down"
              : null;
          setLastFlashTime((prev) => ({ ...prev, [food.id]: currentTime }));
        }

        newPrices[food.id] = newPrice;
      });

      setPriceFlash(newFlash);
      setTimeout(() => setPriceFlash({}), 600); // Flash for longer (600ms) but less frequent

      updateTradingState({
        currentPrices: newPrices,
        volatilityPeriods: newVolatilityPeriods,
      });
    }, TRADING_CONFIG.PRICE_UPDATE_INTERVAL);

    return () => clearInterval(priceUpdateInterval);
  }, [
    lastFlashTime,
    trading.currentPrices,
    trading.volatilityPeriods,
    trading.lastVolatilityCheck,
    updateTradingState,
  ]);

  useEffect(() => {
    const candleInterval = setInterval(() => {
      const newChartData = { ...trading.chartData };

      FOOD_ITEMS.forEach((food) => {
        const currentData = newChartData[food.id] || [];
        const currentPrice = trading.currentPrices[food.id];

        if (currentData.length === 0) {
          newChartData[food.id] = [
            {
              timestamp: Date.now(),
              open: currentPrice,
              high: currentPrice,
              low: currentPrice,
              close: currentPrice,
              volume: 0,
            },
          ];
        } else {
          const lastCandle = currentData[currentData.length - 1];
          const timeDiff = Date.now() - lastCandle.timestamp;

          if (timeDiff >= TRADING_CONFIG.CANDLE_DURATION) {
            const newCandle: TradingData = {
              timestamp: Date.now(),
              open: currentPrice,
              high: currentPrice,
              low: currentPrice,
              close: currentPrice,
              volume: 0,
            };

            newChartData[food.id] = [
              ...currentData.slice(-TRADING_CONFIG.MAX_CANDLES),
              newCandle,
            ];
          } else {
            const updatedCandle = {
              ...lastCandle,
              high: Math.max(lastCandle.high, currentPrice),
              low: Math.min(lastCandle.low, currentPrice),
              close: currentPrice,
            };

            newChartData[food.id] = [
              ...currentData.slice(0, -1),
              updatedCandle,
            ];
          }
        }
      });

      updateTradingState({
        chartData: newChartData,
      });
    }, TRADING_CONFIG.PRICE_UPDATE_INTERVAL);

    return () => clearInterval(candleInterval);
  }, [trading.chartData, trading.currentPrices, updateTradingState]);

  const handleTrade = () => {
    if (tradeType === "buy") {
      const shawarmaToSpend = tradeAmount;
      const foodUnitsToReceive = shawarmaToSpend / currentPrice;

      if (clicker.shawarmas < shawarmaToSpend) {
        return;
      }

      contextExecuteTrade(
        "buy",
        trading.selectedFood,
        foodUnitsToReceive,
        currentPrice,
        shawarmaToSpend
      );
    } else {
      const foodUnitsToSell = tradeAmount;
      const shawarmaToReceive = foodUnitsToSell * currentPrice;
      const owned = trading.portfolio[trading.selectedFood] || 0;

      if (owned < foodUnitsToSell) {
        return;
      }

      contextExecuteTrade(
        "sell",
        trading.selectedFood,
        foodUnitsToSell,
        currentPrice,
        shawarmaToReceive
      );
    }

    setTradeAmount(1);
  };

  const getMarketSentiment = () => {
    let bullish = 0;
    let bearish = 0;

    FOOD_ITEMS.forEach((food) => {
      const chartData = trading.chartData[food.id];
      if (chartData && chartData.length >= 2) {
        const current = chartData[chartData.length - 1];
        const previous = chartData[chartData.length - 2];
        if (current.close > previous.close) bullish++;
        else bearish++;
      }
    });

    const total = bullish + bearish;
    const bullishPercent = total > 0 ? (bullish / total) * 100 : 50;

    return {
      sentiment:
        bullishPercent > 60
          ? "🚀 BULLISH"
          : bullishPercent < 40
          ? "🐻 BEARISH"
          : "⚖️ NEUTRAL",
      percentage: bullishPercent.toFixed(0),
    };
  };

  const getPortfolioValue = () => {
    return Object.entries(trading.portfolio).reduce(
      (total, [foodId, amount]) => {
        return total + amount * trading.currentPrices[foodId];
      },
      0
    );
  };

  return (
    <Box w="full" bg="rgba(26, 32, 44, 0.95)" p={3} h="full" overflowY="auto">
      <VStack gap={0} align="stretch" h="full">
        <HStack justify="space-between" align="center">
          <VStack align="start" gap={0}>
            <Text fontSize="xl" fontWeight="bold" color="white">
              🍽️ Food Exchange
            </Text>
            <HStack gap={4}>
              <Text fontSize="xs" color="gray.400">
                Real-time food trading • Ultra-fast market
              </Text>
              <Badge
                colorScheme={
                  getMarketSentiment().sentiment.includes("BULLISH")
                    ? "green"
                    : getMarketSentiment().sentiment.includes("BEARISH")
                    ? "red"
                    : "yellow"
                }
              >
                {getMarketSentiment().sentiment}{" "}
                {getMarketSentiment().percentage}%
              </Badge>
            </HStack>
          </VStack>
          <VStack align="end" gap={0}>
            <Text fontSize="md" color="orange.300" fontWeight="semibold">
              💰 {formatNumber(clicker.shawarmas)} SHW
            </Text>
            <Text fontSize="xs" color="gray.400">
              Portfolio: 📈 {formatNumber(getPortfolioValue())} SHW
            </Text>
          </VStack>
        </HStack>

        {/* Volatility Alert Panel */}
        {Object.values(trading.volatilityPeriods).some(
          (period) => period.active
        ) && (
          <Box
            bg="rgba(128, 0, 128, 0.1)"
            borderWidth="1px"
            borderColor="purple.400"
            borderRadius="lg"
            p={3}
            mb={2}
          >
            <HStack justify="space-between" align="center">
              <HStack gap={2}>
                <Text fontSize="sm" color="purple.300" fontWeight="bold">
                  ⚡ ACTIVE VOLATILITY PERIODS
                </Text>
                <Badge colorScheme="purple" variant="solid">
                  {
                    Object.values(trading.volatilityPeriods).filter(
                      (period) => period.active
                    ).length
                  }{" "}
                  Active
                </Badge>
              </HStack>
              <HStack gap={3}>
                {FOOD_ITEMS.filter(
                  (food) => trading.volatilityPeriods[food.id]?.active
                ).map((food) => {
                  const period = trading.volatilityPeriods[food.id];
                  const timeLeft = Math.max(0, period.endTime - Date.now());
                  const secondsLeft = Math.ceil(timeLeft / 1000);
                  return (
                    <HStack key={food.id} gap={1}>
                      <Text fontSize="sm">{food.icon}</Text>
                      <Text
                        fontSize="xs"
                        color="purple.300"
                        fontWeight="medium"
                      >
                        {food.symbol}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {secondsLeft}s
                      </Text>
                    </HStack>
                  );
                })}
              </HStack>
            </HStack>
          </Box>
        )}

        <Grid
          templateColumns={{ base: "1fr", xl: "2fr 340px" }}
          templateRows={{ base: "auto auto", xl: "1fr" }}
          gap={2.5}
          flex={1}
          minH={0}
          h="full"
        >
          <VStack
            gap={3}
            align="stretch"
            minH={0}
            order={{ base: 1, xl: 1 }}
            h="full"
            flex={1}
          >
            <HStack gap={2} flexWrap="wrap">
              {FOOD_ITEMS.map((food) => {
                const price = trading.currentPrices[food.id];
                const owned = trading.portfolio[food.id] || 0;
                const isSelected = food.id === trading.selectedFood;
                const flash = priceFlash[food.id];
                const volatilityPeriod = trading.volatilityPeriods[food.id];
                const isVolatile = volatilityPeriod?.active || false;

                return (
                  <Button
                    key={food.id}
                    size="sm"
                    variant={isSelected ? "solid" : "outline"}
                    colorScheme={isSelected ? "orange" : "gray"}
                    onClick={() =>
                      updateTradingState({ selectedFood: food.id })
                    }
                    w="90px" // Fixed width to prevent shifting
                    h="60px" // Fixed height for consistency
                    bg={
                      isSelected
                        ? "orange.500"
                        : isVolatile
                        ? "rgba(255, 0, 255, 0.3)" // Purple glow for volatility
                        : flash === "up"
                        ? "rgba(72, 187, 120, 0.3)"
                        : flash === "down"
                        ? "rgba(245, 101, 101, 0.3)"
                        : undefined
                    }
                    transition="all 0.3s ease-in-out"
                    _hover={{
                      transform: "scale(1.05) rotate(1deg)",
                      bg: isSelected
                        ? "orange.400"
                        : isVolatile
                        ? "rgba(255, 0, 255, 0.4)"
                        : flash === "up"
                        ? "rgba(72, 187, 120, 0.4)"
                        : flash === "down"
                        ? "rgba(245, 101, 101, 0.4)"
                        : "gray.600",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                    _active={{ transform: "scale(0.95)" }}
                    borderWidth={isSelected ? "3px" : "2px"}
                    borderColor={
                      isSelected
                        ? "orange.300"
                        : isVolatile
                        ? "purple.400"
                        : undefined
                    }
                    position="relative"
                    boxShadow={
                      isSelected
                        ? "0 0 15px rgba(255, 165, 0, 0.3)"
                        : isVolatile
                        ? "0 0 15px rgba(255, 0, 255, 0.5)"
                        : undefined
                    }
                    animation={
                      isVolatile ? "pulse 1.5s ease-in-out infinite" : undefined
                    }
                  >
                    <VStack gap={0} align="center" justify="center" h="full">
                      <HStack gap={1} align="center">
                        <Text
                          fontSize="md"
                          className={flash ? "coin-flip" : ""}
                        >
                          {food.icon}
                        </Text>
                        <Text fontSize="xs" fontWeight="bold">
                          {food.symbol}
                        </Text>
                        {isVolatile && (
                          <Text fontSize="xs" color="purple.300">
                            ⚡
                          </Text>
                        )}
                      </HStack>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color={
                          isVolatile
                            ? "purple.300"
                            : flash === "up"
                            ? "green.300"
                            : flash === "down"
                            ? "red.300"
                            : "white"
                        }
                      >
                        {price.toFixed(4)}
                        {isVolatile && (
                          <Text
                            as="span"
                            color="purple.400"
                            ml={1}
                            fontSize="xs"
                          >
                            ⚡
                          </Text>
                        )}
                        {flash === "up" && !isVolatile && (
                          <Text
                            as="span"
                            color="green.400"
                            ml={1}
                            fontSize="xs"
                          >
                            ↗
                          </Text>
                        )}
                        {flash === "down" && !isVolatile && (
                          <Text as="span" color="red.400" ml={1} fontSize="xs">
                            ↘
                          </Text>
                        )}
                      </Text>
                      {owned > 0 && (
                        <Badge
                          size="xs"
                          colorScheme="green"
                          borderRadius="full"
                          maxW="full"
                        >
                          {owned > 99 ? "99+" : owned.toFixed(1)}
                        </Badge>
                      )}
                    </VStack>
                  </Button>
                );
              })}
            </HStack>

            {/* Selected Food Indicator */}
            <Box
              p={2}
              bg="rgba(255, 165, 0, 0.1)"
              borderRadius="lg"
              border="2px solid"
              borderColor="orange.400"
              boxShadow="0 4px 20px rgba(255, 165, 0, 0.2)"
            >
              <HStack justify="space-between" align="center">
                <HStack gap={2} align="center">
                  <Text fontSize="2xl">{selectedFoodItem.icon}</Text>
                  <VStack align="start" gap={0}>
                    <Text fontSize="lg" fontWeight="bold" color="white">
                      {selectedFoodItem.name} ({selectedFoodItem.symbol})
                    </Text>
                    <Text fontSize="xs" color="gray.300">
                      {selectedFoodItem.description}
                    </Text>
                  </VStack>
                </HStack>
                <VStack align="end" gap={0}>
                  <Text fontSize="xl" fontWeight="bold" color="orange.300">
                    {currentPrice.toFixed(4)} SHW
                  </Text>
                  <HStack gap={2}>
                    <Text
                      fontSize="sm"
                      color={
                        trading.chartData[trading.selectedFood]?.length >= 2 &&
                        trading.chartData[trading.selectedFood][
                          trading.chartData[trading.selectedFood].length - 1
                        ]?.close >
                          trading.chartData[trading.selectedFood][
                            trading.chartData[trading.selectedFood].length - 2
                          ]?.close
                          ? "green.400"
                          : "red.400"
                      }
                      fontWeight="semibold"
                    >
                      {trading.chartData[trading.selectedFood]?.length >= 2 &&
                      trading.chartData[trading.selectedFood][
                        trading.chartData[trading.selectedFood].length - 1
                      ]?.close >
                        trading.chartData[trading.selectedFood][
                          trading.chartData[trading.selectedFood].length - 2
                        ]?.close
                        ? "📈"
                        : "📉"}
                    </Text>
                    {trading.portfolio[trading.selectedFood] && (
                      <Badge colorScheme="green" fontSize="xs">
                        Owned:{" "}
                        {trading.portfolio[trading.selectedFood].toFixed(2)}
                        {trading.portfolioAverageCosts[
                          trading.selectedFood
                        ] && (
                          <Text as="span" color="blue.200" ml={1}>
                            • Avg:{" "}
                            {trading.portfolioAverageCosts[
                              trading.selectedFood
                            ].toFixed(4)}
                          </Text>
                        )}
                      </Badge>
                    )}
                  </HStack>
                </VStack>
              </HStack>
            </Box>

            <Box flex={1} minH="300px" overflow="hidden">
              <CandlestickChart
                data={trading.chartData[trading.selectedFood] || []}
                currentPrice={currentPrice}
                foodName={selectedFoodItem.name}
              />
            </Box>

            <Box flex={1} minH="120px">
              <Text fontSize="md" fontWeight="bold" color="white" mb={1}>
                📊 Recent Trades
              </Text>

              {trading.tradeHistory.length === 0 ? (
                <Box
                  p={4}
                  bg="rgba(45, 55, 72, 0.6)"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.600"
                  textAlign="center"
                  h="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="xs" color="gray.400">
                    No trades yet. Start trading to see your history!
                  </Text>
                </Box>
              ) : (
                <Box
                  bg="rgba(45, 55, 72, 0.6)"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.600"
                  overflow="hidden"
                  h="full"
                  display="flex"
                  flexDirection="column"
                >
                  {/* Header */}
                  <Box
                    p={2}
                    bg="rgba(0, 0, 0, 0.2)"
                    borderBottom="1px solid"
                    borderColor="gray.600"
                  >
                    <Grid
                      templateColumns="60px 50px 80px 60px 60px 60px"
                      gap={2}
                    >
                      <Text fontSize="xs" color="gray.300" fontWeight="bold">
                        Time
                      </Text>
                      <Text fontSize="xs" color="gray.300" fontWeight="bold">
                        Type
                      </Text>
                      <Text fontSize="xs" color="gray.300" fontWeight="bold">
                        Food
                      </Text>
                      <Text fontSize="xs" color="gray.300" fontWeight="bold">
                        Amount
                      </Text>
                      <Text fontSize="xs" color="gray.300" fontWeight="bold">
                        Price
                      </Text>
                      <Text fontSize="xs" color="gray.300" fontWeight="bold">
                        Total
                      </Text>
                    </Grid>
                  </Box>

                  {/* Scrollable Content */}
                  <Box flex={1} overflowY="auto">
                    {trading.tradeHistory.slice(0, 15).map((trade, index) => {
                      const food = FOOD_ITEMS.find(
                        (f) => f.id === trade.foodId
                      )!;
                      const time = new Date(trade.timestamp).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      );

                      return (
                        <Box
                          key={trade.id}
                          p={2}
                          bg={
                            trade.type === "buy"
                              ? index % 2 === 0
                                ? "rgba(72, 187, 120, 0.08)"
                                : "rgba(72, 187, 120, 0.04)"
                              : index % 2 === 0
                              ? "rgba(245, 101, 101, 0.08)"
                              : "rgba(245, 101, 101, 0.04)"
                          }
                          _hover={{
                            bg:
                              trade.type === "buy"
                                ? "rgba(72, 187, 120, 0.15)"
                                : "rgba(245, 101, 101, 0.15)",
                          }}
                          transition="background 0.2s"
                          borderLeft="3px solid"
                          borderLeftColor={
                            trade.type === "buy" ? "green.400" : "red.400"
                          }
                        >
                          <Grid
                            templateColumns="60px 50px 80px 60px 60px 60px"
                            gap={2}
                            alignItems="center"
                          >
                            <Text
                              color="gray.300"
                              fontSize="xs"
                              fontFamily="mono"
                            >
                              {time}
                            </Text>
                            <Badge
                              colorScheme={
                                trade.type === "buy" ? "green" : "red"
                              }
                              size="xs"
                              variant="solid"
                              fontSize="xs"
                              textTransform="uppercase"
                              fontWeight="bold"
                              bg={
                                trade.type === "buy" ? "green.500" : "red.500"
                              }
                              color="white"
                              px={2}
                              py={1}
                              borderRadius="md"
                            >
                              {trade.type}
                            </Badge>
                            <HStack gap={1} align="center">
                              <Text fontSize="xs">{food.icon}</Text>
                              <Text
                                fontSize="xs"
                                color="white"
                                fontWeight="semibold"
                              >
                                {food.symbol}
                              </Text>
                            </HStack>
                            <Text
                              color="white"
                              fontSize="xs"
                              fontWeight="medium"
                              fontFamily="mono"
                            >
                              {trade.amount >= 1000000
                                ? `${(trade.amount / 1000000).toFixed(1)}M`
                                : trade.amount >= 1000
                                ? `${(trade.amount / 1000).toFixed(1)}K`
                                : trade.amount.toFixed(1)}
                            </Text>
                            <Text
                              color="orange.300"
                              fontSize="xs"
                              fontWeight="medium"
                              fontFamily="mono"
                            >
                              {trade.price.toFixed(3)}
                            </Text>
                            <Text
                              color={
                                trade.type === "buy" ? "red.200" : "green.200"
                              }
                              fontSize="xs"
                              fontWeight="bold"
                              fontFamily="mono"
                            >
                              {trade.type === "buy" ? "- " : "+ "}
                              {trade.total >= 1000000
                                ? `${(trade.total / 1000000).toFixed(1)}M`
                                : trade.total >= 1000
                                ? `${(trade.total / 1000).toFixed(1)}K`
                                : trade.total.toFixed(1)}
                            </Text>
                          </Grid>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Box>
          </VStack>

          <VStack
            gap={1.5}
            align="stretch"
            minH={0}
            order={{ base: 2, xl: 2 }}
            h="full"
          >
            <Box
              className="trade-area"
              p={3}
              bg="rgba(45, 55, 72, 0.6)"
              borderRadius="md"
              border="1px solid"
              borderColor="gray.600"
              transition="all 0.3s"
              _hover={{ bg: "rgba(45, 55, 72, 0.8)" }}
              h="full"
            >
              <VStack gap={0} align="stretch" h="full" justify="space-between">
                {/* Top Section - Controls */}
                <VStack gap={2} align="stretch">
                  {/* Header */}
                  <Text fontSize="md" fontWeight="bold" color="white" mb={1}>
                    Trade {selectedFoodItem.name} ({selectedFoodItem.symbol})
                  </Text>

                  {/* Buy/Sell Toggle */}
                  <HStack gap={2}>
                    <Button
                      size="md"
                      variant={tradeType === "buy" ? "solid" : "outline"}
                      colorScheme="green"
                      onClick={() => setTradeType("buy")}
                      flex={1}
                      h="45px"
                      fontSize="md"
                      fontWeight="bold"
                      bg={tradeType === "buy" ? "green.500" : "transparent"}
                      color={tradeType === "buy" ? "white" : "green.300"}
                      borderWidth="2px"
                      borderColor="green.400"
                      _hover={{
                        transform: "scale(1.03)",
                        bg:
                          tradeType === "buy"
                            ? "green.400"
                            : "rgba(72, 187, 120, 0.2)",
                        boxShadow: "0 4px 15px rgba(72, 187, 120, 0.4)",
                      }}
                      _active={{ transform: "scale(0.97)" }}
                      transition="all 0.2s"
                      textShadow={
                        tradeType === "buy"
                          ? "0 1px 2px rgba(0,0,0,0.3)"
                          : "none"
                      }
                    >
                      💚 BUY
                    </Button>
                    <Button
                      size="md"
                      variant={tradeType === "sell" ? "solid" : "outline"}
                      colorScheme="red"
                      onClick={() => setTradeType("sell")}
                      flex={1}
                      h="45px"
                      fontSize="md"
                      fontWeight="bold"
                      bg={tradeType === "sell" ? "red.500" : "transparent"}
                      color={tradeType === "sell" ? "white" : "red.300"}
                      borderWidth="2px"
                      borderColor="red.400"
                      _hover={{
                        transform: "scale(1.03)",
                        bg:
                          tradeType === "sell"
                            ? "red.400"
                            : "rgba(245, 101, 101, 0.2)",
                        boxShadow: "0 4px 15px rgba(245, 101, 101, 0.4)",
                      }}
                      _active={{ transform: "scale(0.97)" }}
                      transition="all 0.2s"
                      textShadow={
                        tradeType === "sell"
                          ? "0 1px 2px rgba(0,0,0,0.3)"
                          : "none"
                      }
                    >
                      ❤️ SELL
                    </Button>
                  </HStack>

                  {/* Amount Input Section */}
                  <VStack gap={1.5} align="stretch">
                    <HStack justify="space-between" align="center">
                      <Text
                        fontSize="sm"
                        color="gray.300"
                        fontWeight="semibold"
                      >
                        {tradeType === "buy"
                          ? "SHW to Spend"
                          : `${selectedFoodItem.symbol} to Sell`}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {tradeType === "buy"
                          ? `≈ ${(tradeAmount / currentPrice).toFixed(4)} ${
                              selectedFoodItem.symbol
                            }`
                          : `≈ ${(tradeAmount * currentPrice).toFixed(4)} SHW`}
                      </Text>
                    </HStack>
                    <Input
                      value={tradeAmount}
                      onChange={(e) =>
                        setTradeAmount(parseFloat(e.target.value) || 0)
                      }
                      type="number"
                      min={0.0001}
                      step={0.1}
                      placeholder={
                        tradeType === "buy"
                          ? "0.0000 SHW"
                          : `0.0000 ${selectedFoodItem.symbol}`
                      }
                      bg="gray.700"
                      border="1px solid"
                      borderColor="gray.600"
                      color="white"
                      fontSize="md"
                      fontWeight="semibold"
                      px={3}
                      py={2}
                      h="45px"
                      _focus={{
                        borderColor: "orange.400",
                        boxShadow: "0 0 0 1px orange.400",
                      }}
                      _placeholder={{
                        color: "gray.500",
                        fontSize: "sm",
                      }}
                    />

                    <HStack gap={1} justify="center" flexWrap="wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="gray"
                        onClick={() =>
                          setTradeAmount(
                            (prev) => prev + (tradeType === "buy" ? 10 : 10)
                          )
                        }
                        fontSize="xs"
                        fontWeight="semibold"
                        borderWidth="1px"
                        borderColor="gray.500"
                        color="gray.300"
                        bg="transparent"
                        px={2}
                        minW="40px"
                        h="28px"
                        _hover={{
                          bg: "gray.600",
                          borderColor: "gray.400",
                          color: "white",
                          transform: "scale(1.05)",
                        }}
                        _active={{ transform: "scale(0.95)" }}
                        transition="all 0.2s"
                      >
                        +10
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="gray"
                        onClick={() =>
                          setTradeAmount(
                            (prev) => prev + (tradeType === "buy" ? 1000 : 1000)
                          )
                        }
                        fontSize="xs"
                        fontWeight="semibold"
                        borderWidth="1px"
                        borderColor="gray.500"
                        color="gray.300"
                        bg="transparent"
                        px={2}
                        minW="40px"
                        h="28px"
                        _hover={{
                          bg: "gray.600",
                          borderColor: "gray.400",
                          color: "white",
                          transform: "scale(1.05)",
                        }}
                        _active={{ transform: "scale(0.95)" }}
                        transition="all 0.2s"
                      >
                        +1k
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="gray"
                        onClick={() =>
                          setTradeAmount(
                            (prev) =>
                              prev + (tradeType === "buy" ? 1000000 : 1000000)
                          )
                        }
                        fontSize="xs"
                        fontWeight="semibold"
                        borderWidth="1px"
                        borderColor="gray.500"
                        color="gray.300"
                        bg="transparent"
                        px={2}
                        minW="40px"
                        h="28px"
                        _hover={{
                          bg: "gray.600",
                          borderColor: "gray.400",
                          color: "white",
                          transform: "scale(1.05)",
                        }}
                        _active={{ transform: "scale(0.95)" }}
                        transition="all 0.2s"
                      >
                        +1m
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="gray"
                        onClick={() =>
                          setTradeAmount(
                            (prev) =>
                              prev +
                              (tradeType === "buy" ? 1000000000 : 1000000000)
                          )
                        }
                        fontSize="xs"
                        fontWeight="semibold"
                        borderWidth="1px"
                        borderColor="gray.500"
                        color="gray.300"
                        bg="transparent"
                        px={2}
                        minW="40px"
                        h="28px"
                        _hover={{
                          bg: "gray.600",
                          borderColor: "gray.400",
                          color: "white",
                          transform: "scale(1.05)",
                        }}
                        _active={{ transform: "scale(0.95)" }}
                        transition="all 0.2s"
                      >
                        +1b
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="orange"
                        onClick={() => {
                          if (tradeType === "buy") {
                            setTradeAmount(clicker.shawarmas); // Use all available SHW
                          } else {
                            setTradeAmount(
                              trading.portfolio[trading.selectedFood] || 0
                            ); // Use all owned food
                          }
                        }}
                        fontSize="xs"
                        fontWeight="bold"
                        borderWidth="1px"
                        borderColor="orange.400"
                        color="orange.300"
                        bg="transparent"
                        px={2}
                        minW="45px"
                        h="28px"
                        _hover={{
                          bg: "orange.500",
                          borderColor: "orange.300",
                          color: "white",
                          transform: "scale(1.05)",
                        }}
                        _active={{ transform: "scale(0.95)" }}
                        transition="all 0.2s"
                      >
                        MAX
                      </Button>
                    </HStack>
                  </VStack>
                </VStack>

                {/* Bottom Section - Price Info and Confirm Button */}
                <VStack gap={2} align="stretch">
                  {/* Price/Total Section */}
                  <VStack gap={1.5} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.400" fontWeight="medium">
                        Price per {selectedFoodItem.symbol}
                      </Text>
                      <Text
                        fontSize="sm"
                        color="orange.300"
                        fontWeight="semibold"
                      >
                        {currentPrice.toFixed(4)} SHW
                      </Text>
                    </HStack>
                    {tradeType === "buy" ? (
                      <>
                        <HStack justify="space-between">
                          <Text
                            fontSize="sm"
                            color="gray.400"
                            fontWeight="medium"
                          >
                            SHW to Spend
                          </Text>
                          <Text
                            fontSize="sm"
                            color="orange.300"
                            fontWeight="semibold"
                          >
                            {tradeAmount.toFixed(4)} SHW
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text
                            fontSize="lg"
                            color="gray.300"
                            fontWeight="bold"
                          >
                            You'll Receive
                          </Text>
                          <Text
                            fontSize="lg"
                            color="green.300"
                            fontWeight="bold"
                          >
                            {(tradeAmount / currentPrice).toFixed(4)}{" "}
                            {selectedFoodItem.symbol}
                          </Text>
                        </HStack>
                      </>
                    ) : (
                      <>
                        <HStack justify="space-between">
                          <Text
                            fontSize="sm"
                            color="gray.400"
                            fontWeight="medium"
                          >
                            {selectedFoodItem.symbol} to Sell
                          </Text>
                          <Text
                            fontSize="sm"
                            color="red.300"
                            fontWeight="semibold"
                          >
                            {tradeAmount.toFixed(4)} {selectedFoodItem.symbol}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text
                            fontSize="lg"
                            color="gray.300"
                            fontWeight="bold"
                          >
                            You'll Receive
                          </Text>
                          <Text
                            fontSize="lg"
                            color="green.300"
                            fontWeight="bold"
                          >
                            {(tradeAmount * currentPrice).toFixed(4)} SHW
                          </Text>
                        </HStack>
                      </>
                    )}
                    {tradeType === "sell" && (
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.400">
                          Owned
                        </Text>
                        <Text
                          fontSize="sm"
                          color="green.400"
                          fontWeight="semibold"
                        >
                          {(
                            trading.portfolio[trading.selectedFood] || 0
                          ).toFixed(4)}{" "}
                          {selectedFoodItem.symbol}
                        </Text>
                      </HStack>
                    )}
                    {trading.portfolio[trading.selectedFood] &&
                      trading.portfolioAverageCosts[trading.selectedFood] && (
                        <>
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.400">
                              Avg Cost
                            </Text>
                            <Text
                              fontSize="sm"
                              color="blue.300"
                              fontWeight="semibold"
                            >
                              {trading.portfolioAverageCosts[
                                trading.selectedFood
                              ].toFixed(4)}{" "}
                              SHW
                            </Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.400">
                              P&L
                            </Text>
                            <Text
                              fontSize="sm"
                              color={
                                currentPrice >
                                trading.portfolioAverageCosts[
                                  trading.selectedFood
                                ]
                                  ? "green.400"
                                  : "red.400"
                              }
                              fontWeight="semibold"
                            >
                              {(
                                (currentPrice -
                                  trading.portfolioAverageCosts[
                                    trading.selectedFood
                                  ]) *
                                trading.portfolio[trading.selectedFood]
                              ).toFixed(4)}{" "}
                              SHW
                              {currentPrice >
                              trading.portfolioAverageCosts[
                                trading.selectedFood
                              ]
                                ? " 📈"
                                : " 📉"}
                            </Text>
                          </HStack>
                        </>
                      )}
                  </VStack>

                  {/* Confirm Button */}
                  <Button
                    colorScheme={tradeType === "buy" ? "green" : "red"}
                    onClick={handleTrade}
                    disabled={tradeAmount <= 0}
                    size="lg"
                    w="full"
                    h="55px"
                    fontSize="lg"
                    fontWeight="black"
                    bg={tradeType === "buy" ? "green.500" : "red.500"}
                    color="white"
                    borderWidth="3px"
                    borderColor={tradeType === "buy" ? "green.300" : "red.300"}
                    textShadow="0 2px 4px rgba(0,0,0,0.4)"
                    boxShadow={
                      tradeType === "buy"
                        ? "0 4px 20px rgba(72, 187, 120, 0.5)"
                        : "0 4px 20px rgba(245, 101, 101, 0.5)"
                    }
                    _hover={{
                      transform: "scale(1.03)",
                      bg: tradeType === "buy" ? "green.400" : "red.400",
                      boxShadow:
                        tradeType === "buy"
                          ? "0 6px 25px rgba(72, 187, 120, 0.7)"
                          : "0 6px 25px rgba(245, 101, 101, 0.7)",
                    }}
                    _active={{ transform: "scale(0.97)" }}
                    transition="all 0.2s"
                    position="relative"
                    overflow="hidden"
                  >
                    <VStack gap={0} align="center">
                      <Text fontSize="lg" fontWeight="black">
                        {tradeType === "buy" ? "🚀 BUY" : "💰 SELL"}{" "}
                        {selectedFoodItem.symbol}
                      </Text>
                      <Text fontSize="xs" opacity={0.9} fontWeight="semibold">
                        {tradeType === "buy"
                          ? `Spend ${tradeAmount.toFixed(4)} SHW`
                          : `Get ${(tradeAmount * currentPrice).toFixed(
                              4
                            )} SHW`}
                      </Text>
                    </VStack>
                  </Button>
                </VStack>
              </VStack>
            </Box>
          </VStack>
        </Grid>
      </VStack>
    </Box>
  );
};

export default TradingPanel;
