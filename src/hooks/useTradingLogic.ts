import { useState, useEffect, useCallback } from "react";
import { useGame } from "../contexts/GameContext";
import { FOOD_ITEMS, TRADING_CONFIG } from "../data/tradingData";

interface UseTradingLogicResult {
  tradeAmount: number;
  tradeType: "buy" | "sell";
  priceFlash: { [key: string]: "up" | "down" | null };
  selectedFoodItem: any;
  currentPrice: number;
  setTradeAmount: (amount: number) => void;
  setTradeType: (type: "buy" | "sell") => void;
  handleSelectFood: (foodId: string) => void;
  handleExecuteTrade: () => void;
  canExecuteTrade: boolean;
  totalCost: number;
}

export function useTradingLogic(): UseTradingLogicResult {
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
  const totalCost = currentPrice * tradeAmount;

  const canExecuteTrade =
    tradeType === "buy"
      ? clicker.shawarmas >= totalCost
      : (trading.portfolio[trading.selectedFood] || 0) >= tradeAmount;

  // Price update effect
  useEffect(() => {
    const priceUpdateInterval = setInterval(() => {
      const newPrices = { ...trading.currentPrices };
      const newFlash: { [key: string]: "up" | "down" | null } = {};
      const currentTime = Date.now();

      FOOD_ITEMS.forEach((food) => {
        const currentPrice = newPrices[food.id];
        const volatility =
          food.volatility * TRADING_CONFIG.VOLATILITY_MULTIPLIER;
        const change = (Math.random() - 0.5) * 2 * volatility * currentPrice;
        const newPrice = Math.max(0.001, currentPrice + change);

        // Only flash if price change is significant and enough time has passed
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
      setTimeout(() => setPriceFlash({}), 600);

      updateTradingState({
        currentPrices: newPrices,
      });
    }, TRADING_CONFIG.PRICE_UPDATE_INTERVAL);

    return () => clearInterval(priceUpdateInterval);
  }, [lastFlashTime, trading.currentPrices, updateTradingState]);

  // Chart data update effect
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
            // Create new candle
            newChartData[food.id] = [
              ...currentData.slice(-TRADING_CONFIG.MAX_CANDLES + 1),
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
            // Update current candle
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
  }, [trading.currentPrices, trading.chartData, updateTradingState]);

  const handleSelectFood = useCallback(
    (foodId: string) => {
      updateTradingState({ selectedFood: foodId });
    },
    [updateTradingState]
  );

  const handleExecuteTrade = useCallback(() => {
    if (!canExecuteTrade) return;

    contextExecuteTrade(
      tradeType,
      trading.selectedFood,
      tradeAmount,
      currentPrice,
      Date.now()
    );

    // Reset trade amount to 1 after trade
    setTradeAmount(1);
  }, [
    canExecuteTrade,
    contextExecuteTrade,
    trading.selectedFood,
    tradeAmount,
    tradeType,
    currentPrice,
  ]);

  return {
    tradeAmount,
    tradeType,
    priceFlash,
    selectedFoodItem,
    currentPrice,
    setTradeAmount,
    setTradeType,
    handleSelectFood,
    handleExecuteTrade,
    canExecuteTrade,
    totalCost,
  };
}
