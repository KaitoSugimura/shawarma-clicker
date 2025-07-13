import React, { useState, useRef, useCallback, useEffect } from "react";
import { Box, HStack, Button, IconButton } from "@chakra-ui/react";
import { FaLock, FaUnlock, FaExpand, FaCompress, FaRedo } from "react-icons/fa";
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
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewPosition, setViewPosition] = useState({ x: 0, y: 0 });
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAutoScroll) {
      setViewPosition({ x: 0, y: 0 });
    }
  }, [data.length, isAutoScroll]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isAutoScroll) return;
      setIsDragging(true);
      setDragStart({
        x: e.clientX - viewPosition.x,
        y: e.clientY - viewPosition.y,
      });
    },
    [isAutoScroll, viewPosition]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || isAutoScroll) return;
      setViewPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, isAutoScroll, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (isAutoScroll) return;
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05;
      setZoom((prev) => Math.max(0.8, Math.min(2.5, prev * zoomFactor)));
    },
    [isAutoScroll]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isAutoScroll) return;
      if (e.touches.length === 1) {
        setIsDragging(true);
        const touch = e.touches[0];
        setDragStart({
          x: touch.clientX - viewPosition.x,
          y: touch.clientY - viewPosition.y,
        });
      } else if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        setDragStart({ x: distance, y: zoom });
      }
    },
    [isAutoScroll, viewPosition, zoom]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isAutoScroll) return;
      e.preventDefault();
      if (e.touches.length === 1 && isDragging) {
        const touch = e.touches[0];
        setViewPosition({
          x: touch.clientX - dragStart.x,
          y: touch.clientY - dragStart.y,
        });
      } else if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        const scaleChange = distance / dragStart.x;
        const newZoom = dragStart.y * scaleChange;
        setZoom(Math.max(0.8, Math.min(2.5, newZoom)));
      }
    },
    [isAutoScroll, isDragging, dragStart]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resetView = useCallback(() => {
    setViewPosition({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  if (data.length === 0) return null;

  const CHART_HEIGHT = 300; // Fixed height for calculations

  // Always use a reasonable number of candles for proper spacing
  const maxVisibleCandles = 30;
  const displayData = isAutoScroll
    ? data.slice(-maxVisibleCandles)
    : data.slice(-maxVisibleCandles); // Keep it simple - always show the same amount

  const maxPrice = Math.max(
    ...displayData.map((d) => Math.max(d.high, d.low, d.open, d.close)),
    currentPrice
  );
  const minPrice = Math.min(
    ...displayData.map((d) => Math.min(d.high, d.low, d.open, d.close)),
    currentPrice
  );
  const rawPriceRange = maxPrice - minPrice || 1;
  const priceRange = rawPriceRange * 1.2;
  const paddedMaxPrice = maxPrice + rawPriceRange * 0.1;

  const getY = (price: number) => {
    return ((paddedMaxPrice - price) / priceRange) * CHART_HEIGHT;
  };

  const chartTransform = `translate(${viewPosition.x}px, ${viewPosition.y}px) scale(${zoom})`;

  return (
    <Box
      ref={chartRef}
      position="relative"
      w="full"
      h="full"
      bg="rgba(26, 32, 44, 0.8)"
      borderRadius="md"
      border="1px solid"
      borderColor="gray.600"
      overflow="hidden"
      cursor={isAutoScroll ? "default" : isDragging ? "grabbing" : "grab"}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: isAutoScroll ? "auto" : "none" }}
    >
      {/* ...existing code... */}
      <svg
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          transform: !isAutoScroll ? chartTransform : undefined,
          transformOrigin: "0 0",
        }}
      >
        {[0.25, 0.5, 0.75].map((ratio) => {
          const y = CHART_HEIGHT * ratio;
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
              <text x="5" y={y - 5} fill="rgba(255,255,255,0.6)" fontSize="10">
                {price.toFixed(4)}
              </text>
            </g>
          );
        })}

        {displayData.map((candle, index) => {
          const chartWidth = 95;
          const totalCandles = displayData.length;
          // Simple and consistent spacing
          const candleWidth = Math.max(chartWidth / totalCandles - 1, 2);
          const spacing = chartWidth / totalCandles;
          const x = index * spacing + spacing / 2 + 2.5;

          const bodyTop = getY(Math.max(candle.open, candle.close));
          const bodyBottom = getY(Math.min(candle.open, candle.close));
          const bodyHeight = Math.max(bodyBottom - bodyTop, 2);
          const isGreen = candle.close >= candle.open;

          return (
            <g key={`${index}-${candle.timestamp}`}>
              <line
                x1={`${x}%`}
                y1={getY(candle.high)}
                x2={`${x}%`}
                y2={getY(candle.low)}
                stroke={isGreen ? "#48BB78" : "#F56565"}
                strokeWidth="1.5"
              />
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

      {/* Control Panel - Inside chart container at bottom left */}
      <Box position="absolute" bottom="10px" left="10px" zIndex="10">
        <HStack gap={2}>
          <Button
            size="sm"
            colorScheme={isAutoScroll ? "green" : "gray"}
            onClick={() => setIsAutoScroll(!isAutoScroll)}
            bg={isAutoScroll ? "green.600" : "gray.600"}
            _hover={{
              bg: isAutoScroll ? "green.500" : "gray.500",
            }}
            borderRadius="md"
            fontSize="xs"
            px={2}
            py={1}
          >
            {isAutoScroll ? <FaLock /> : <FaUnlock />}
            <Box ml={1}>{isAutoScroll ? "Auto" : "Manual"}</Box>
          </Button>
          {!isAutoScroll && (
            <>
              <IconButton
                size="sm"
                aria-label="Zoom In"
                onClick={() => setZoom((prev) => Math.min(2.5, prev * 1.1))}
                disabled={zoom >= 2.5}
                bg="gray.600"
                _hover={{ bg: "gray.500" }}
                _disabled={{ bg: "gray.700", opacity: 0.5 }}
                borderRadius="md"
                fontSize="xs"
              >
                <FaExpand />
              </IconButton>
              <IconButton
                size="sm"
                aria-label="Zoom Out"
                onClick={() => setZoom((prev) => Math.max(0.8, prev * 0.9))}
                disabled={zoom <= 0.8}
                bg="gray.600"
                _hover={{ bg: "gray.500" }}
                _disabled={{ bg: "gray.700", opacity: 0.5 }}
                borderRadius="md"
                fontSize="xs"
              >
                <FaCompress />
              </IconButton>
              <IconButton
                size="sm"
                aria-label="Reset View"
                onClick={resetView}
                bg="gray.600"
                _hover={{ bg: "gray.500" }}
                borderRadius="md"
                fontSize="xs"
              >
                <FaRedo />
              </IconButton>
            </>
          )}
        </HStack>
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
  );
};

export default CandlestickChart;
