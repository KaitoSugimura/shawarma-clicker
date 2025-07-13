import { useState, useEffect, useCallback } from "react";
import { Box, VStack, Text, Grid, Button, HStack } from "@chakra-ui/react";

import NotificationSystem from "./NotificationSystem";
import SpecialEvents from "./SpecialEvents";
import AnimatedBackground from "./AnimatedBackground";
import { ShawarmaDisplay } from "./shared/ShawarmaDisplay";
import { EfficiencyStats } from "./shared/EfficiencyStats";
import { UpgradeItem } from "./shared/UpgradeItem";
import { GameStats } from "./shared/GameStats";

import { useGame } from "../contexts/GameContext";
import { useClickerAnimations } from "../hooks/useClickerAnimations";
import { useClickerLogic } from "../hooks/useClickerLogic";
import { formatPerSecond } from "../utils/gameUtils";
import { clickerAnimations } from "./shared/animations";
import type { SpecialEvent } from "../types/game";

function ShawarmaClicker() {
  const { state } = useGame();
  const {
    clicker: gameState,
    upgrades,
    clickUpgrades,
    stats: gameStats,
  } = state;

  const [activeEvents, setActiveEvents] = useState<SpecialEvent[]>([]);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [isProductionExpanded, setIsProductionExpanded] = useState(true);
  const [isClickExpanded, setIsClickExpanded] = useState(true);

  const {
    clickAnimations,
    productionAnimations,
    notifications,
    clickMultiplier,
    addClickAnimation,
    addProductionAnimation,
    addNotification,
    removeNotification,
    setClickMultiplier,
  } = useClickerAnimations();

  const { handleShawarmaClick, handleBuyUpgrade, handleBuyClickUpgrade } =
    useClickerLogic({
      addNotification,
      addClickAnimation,
      lastClickTime,
      setLastClickTime,
      clickMultiplier,
    });

  useEffect(() => {
    if (gameState.shawarmasPerSecond <= 0) return;

    const interval = setInterval(() => {
      const production = gameState.shawarmasPerSecond;
      if (production > 0) {
        addProductionAnimation(production);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.shawarmasPerSecond, addProductionAnimation]);

  const triggerEvent = useCallback(
    (event: SpecialEvent) => {
      setActiveEvents((prev) => [...prev, event]);
      setClickMultiplier(event.multiplier || 1);

      addNotification({
        id: `event-${event.id}-${Date.now()}`,
        message: event.message,
        type: "special",
        duration: event.duration,
      });

      setTimeout(() => {
        setActiveEvents((prev) => prev.filter((e) => e.id !== event.id));
        setClickMultiplier(1);
      }, event.duration);
    },
    [addNotification, setClickMultiplier]
  );

  return (
    <Grid
      templateColumns={{
        base: "1fr",
        md: "1fr 350px",
        lg: "1fr 400px",
      }}
      templateRows={{
        base: "1fr auto",
        md: "1fr",
      }}
      h="full"
      gap={0}
      minH="0"
    >
      {/* Main Shawarma Area */}
      <Box
        h="full"
        bg="rgba(45, 55, 72, 0.4)"
        position="relative"
        display="flex"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
      >
        {/* Animated Background Pattern */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          opacity="0.05"
          backgroundImage="radial-gradient(circle at 25% 25%, orange 2px, transparent 2px)"
          backgroundSize="50px 50px"
          animation="backgroundMove 20s linear infinite"
        />

        <AnimatedBackground />

        <ShawarmaDisplay
          onClick={handleShawarmaClick}
          shawarmasPerClick={gameState.shawarmasPerClick}
          clickMultiplier={clickMultiplier}
          shawarmasPerSecond={gameState.shawarmasPerSecond}
          clickAnimations={clickAnimations}
          productionAnimations={productionAnimations}
        />

        <EfficiencyStats
          shawarmasPerSecond={gameState.shawarmasPerSecond}
          shawarmasPerClick={gameState.shawarmasPerClick}
          clickMultiplier={clickMultiplier}
        />

        {/* Production animation text for mobile */}
        <Box
          position="absolute"
          bottom="20px"
          left="50%"
          transform="translateX(-50%)"
          display={{ base: "block", md: "none" }}
        >
          {gameState.shawarmasPerSecond > 0 && (
            <Box
              px={3}
              py={1}
              bg="rgba(26, 32, 44, 0.8)"
              borderRadius="full"
              borderWidth="1px"
              borderColor="cyan.600"
            >
              <Text fontSize="xs" color="cyan.300" textAlign="center">
                Auto: +{formatPerSecond(gameState.shawarmasPerSecond)}/sec
              </Text>
            </Box>
          )}
        </Box>
      </Box>

      {/* Upgrades Panel */}
      <Box
        bg="rgba(26, 32, 44, 0.95)"
        borderLeftWidth={{ base: "0", md: "1px" }}
        borderTopWidth={{ base: "1px", md: "0" }}
        borderLeftColor="gray.700"
        borderTopColor="gray.700"
        h={{ base: "50vh", md: "full" }}
        overflowY="auto"
        backdropFilter="blur(10px)"
        css={{
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(74, 85, 104, 0.3)",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(203, 166, 247, 0.5)",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(203, 166, 247, 0.7)",
          },
        }}
      >
        <VStack gap={4} align="stretch" p={4} pb={8}>
          {/* Production Upgrades */}
          <Box>
            <HStack
              justify="space-between"
              align="center"
              mb={isProductionExpanded ? 4 : 2}
              cursor="pointer"
              onClick={() => setIsProductionExpanded(!isProductionExpanded)}
              p={2}
              borderRadius="md"
              _hover={{ bg: "rgba(255, 165, 0, 0.1)" }}
              transition="all 0.2s"
            >
              <Text fontSize="xl" fontWeight="bold" color="orange.400">
                Production Upgrades
              </Text>
              <Button
                size="sm"
                variant="ghost"
                color="orange.400"
                _hover={{ bg: "rgba(255, 165, 0, 0.2)" }}
              >
                {isProductionExpanded ? "▼" : "▶"}
              </Button>
            </HStack>
            <Box
              overflow="hidden"
              transition="all 0.3s ease-in-out"
              maxH={isProductionExpanded ? "1000px" : "0"}
              opacity={isProductionExpanded ? 1 : 0}
            >
              <VStack gap={3}>
                {upgrades.map((upgrade) => (
                  <UpgradeItem
                    key={upgrade.id}
                    upgrade={upgrade}
                    canAfford={gameState.shawarmas >= upgrade.cost}
                    onBuy={handleBuyUpgrade}
                    isProduction={true}
                  />
                ))}
              </VStack>
            </Box>
          </Box>

          {/* Click Upgrades */}
          <Box>
            <HStack
              justify="space-between"
              align="center"
              mb={isClickExpanded ? 4 : 2}
              cursor="pointer"
              onClick={() => setIsClickExpanded(!isClickExpanded)}
              p={2}
              borderRadius="md"
              _hover={{ bg: "rgba(128, 90, 213, 0.1)" }}
              transition="all 0.2s"
            >
              <Text fontSize="xl" fontWeight="bold" color="purple.400">
                Click Upgrades
              </Text>
              <Button
                size="sm"
                variant="ghost"
                color="purple.400"
                _hover={{ bg: "rgba(128, 90, 213, 0.2)" }}
              >
                {isClickExpanded ? "▼" : "▶"}
              </Button>
            </HStack>
            <Box
              overflow="hidden"
              transition="all 0.3s ease-in-out"
              maxH={isClickExpanded ? "1000px" : "0"}
              opacity={isClickExpanded ? 1 : 0}
            >
              <VStack gap={3}>
                {clickUpgrades.map((upgrade) => (
                  <UpgradeItem
                    key={upgrade.id}
                    upgrade={upgrade}
                    canAfford={gameState.shawarmas >= upgrade.cost}
                    onBuy={handleBuyClickUpgrade}
                    isProduction={false}
                  />
                ))}
              </VStack>
            </Box>
          </Box>

          {/* Game Statistics */}
          <GameStats stats={gameStats} gameState={gameState} />
        </VStack>
      </Box>

      {/* CSS Animations */}
      <style>{clickerAnimations}</style>

      {/* Notification System */}
      <NotificationSystem
        notifications={notifications}
        onRemoveNotification={removeNotification}
      />

      {/* Special Events */}
      <SpecialEvents
        gameState={gameState}
        onEventTrigger={triggerEvent}
        activeEvents={activeEvents}
      />
    </Grid>
  );
}

export default ShawarmaClicker;
