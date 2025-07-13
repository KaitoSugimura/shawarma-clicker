import React from "react";
import { Box, VStack } from "@chakra-ui/react";
import type { TradingData } from "../types/trading";

interface CandlestickChartProps {
  data: TradingData[];
  currentPrice: number;
  foodName: string;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  currentPrice,
  foodName,
}) => {
  if (data.length === 0) return null;

  const maxPrice = Math.max(
    ...data.map((d) => Math.max(d.high, d.low, d.open, d.close)),
    currentPrice
  );
  const minPrice = Math.min(
    ...data.map((d) => Math.min(d.high, d.low, d.open, d.close)),
    currentPrice
  );
  const rawPriceRange = maxPrice - minPrice || 1;
  const priceRange = rawPriceRange * 1.2; // 20% padding (10% top + 10% bottom)
  const paddedMaxPrice = maxPrice + rawPriceRange * 0.1;

  const getY = (price: number) => {
    return ((paddedMaxPrice - price) / priceRange) * 400;
  };

  return (
    <VStack gap={4} align="stretch">
      <Box
        position="relative"
        w="full"
        h="400px"
        bg="rgba(26, 32, 44, 0.8)"
        borderRadius="md"
        border="1px solid"
        borderColor="gray.600"
        overflow="hidden"
      >
        <svg width="100%" height="400" style={{ position: "absolute" }}>
          {/* Price level grid lines */}
          {[0.25, 0.5, 0.75].map((ratio) => {
            const y = 400 * ratio;
            const price = paddedMaxPrice - priceRange * ratio;
            return (
              <g key={ratio}>
                <line
                  x1="0"
                  y1={y}
                  x2="100%"
                  y2={y}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x="5"
                  y={y - 5}
                  fill="rgba(255,255,255,0.6)"
                  fontSize="10"
                >
                  {price.toFixed(4)}
                </text>
              </g>
            );
          })}

          {/* Candlestick data */}
          {data.slice(-30).map((candle, index) => {
            const chartWidth = 95; // Leave 5% margin
            const totalCandles = Math.min(data.length, 30);
            const candleWidth = Math.max(chartWidth / totalCandles - 1, 1.5); // At least 1.5% width with 1% gap
            const spacing = chartWidth / totalCandles;
            const x = index * spacing + spacing / 2 + 2.5; // Start 2.5% from left

            const bodyTop = getY(Math.max(candle.open, candle.close));
            const bodyBottom = getY(Math.min(candle.open, candle.close));
            const bodyHeight = Math.max(bodyBottom - bodyTop, 2);
            const isGreen = candle.close >= candle.open;

            return (
              <g key={`${index}-${candle.timestamp}`}>
                {/* Wick (high-low line) */}
                <line
                  x1={`${x}%`}
                  y1={getY(candle.high)}
                  x2={`${x}%`}
                  y2={getY(candle.low)}
                  stroke={isGreen ? "#48BB78" : "#F56565"}
                  strokeWidth="1.5"
                />
                {/* Candle body */}
                <rect
                  x={`${x - candleWidth / 2}%`}
                  y={bodyTop}
                  width={`${candleWidth}%`}
                  height={bodyHeight}
                  fill={isGreen ? "#48BB78" : "#F56565"}
                  stroke={isGreen ? "#38A169" : "#E53E3E"}
                  strokeWidth="0.5"
                  rx="0.5"
                />
              </g>
            );
          })}

          {/* Current price line */}
          <line
            x1="0"
            y1={getY(currentPrice)}
            x2="100%"
            y2={getY(currentPrice)}
            stroke="#FBB040"
            strokeWidth="2"
            strokeDasharray="4,4"
          />
          <text
            x="95%"
            y={getY(currentPrice) - 5}
            fill="#FBB040"
            fontSize="12"
            fontWeight="bold"
            textAnchor="end"
          >
            {currentPrice.toFixed(4)}
          </text>
        </svg>

        <Box
          position="absolute"
          top="10px"
          left="10px"
          fontSize="sm"
          color="gray.400"
        >
          {foodName}
        </Box>

        <Box
          position="absolute"
          bottom="10px"
          right="10px"
          fontSize="xs"
          color="gray.500"
        >
          2s candles
        </Box>
      </Box>
    </VStack>
  );
};

export default CandlestickChart;
