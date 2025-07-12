import React, { useState, useEffect, useCallback } from "react";
import { Box, VStack, HStack, Text, Grid, Badge } from "@chakra-ui/react";

import NotificationSystem from "./NotificationSystem";
import SpecialEvents from "./SpecialEvents";
import StatsPanel from "./StatsPanel";
import AnimatedBackground from "./AnimatedBackground";
import type { Notification, SpecialEvent } from "../types/game";
import { achievements } from "../data/gameData";
import {
  formatNumber,
  formatShawarmaCount,
  formatPerSecond,
} from "../utils/gameUtils";
import {
  MILESTONES,
  ANIMATION_CLEANUP_DELAY,
  MAX_CLICK_ANIMATIONS,
  MAX_PRODUCTION_ANIMATIONS,
} from "../constants/gameConstants";
import { useGame } from "../contexts/GameContext";

const ShawarmaClicker: React.FC = () => {
  const {
    state,
    addClick,
    buyUpgrade,
    buyClickUpgrade,
    updateShawarmas,
    dispatch,
  } = useGame();
  const {
    clicker: gameState,
    upgrades,
    clickUpgrades,
    stats: gameStats,
  } = state;

  const [clickAnimations, setClickAnimations] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const [productionAnimations, setProductionAnimations] = useState<
    Array<{ id: number; x: number; y: number; amount: number }>
  >([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [clickMultiplier, setClickMultiplier] = useState(1);
  const [showAchievements, setShowAchievements] = useState(true);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, notification.duration || 3000);
  }, []);

  // Show notification when game loads with saved data
  useEffect(() => {
    const hasSavedData = localStorage.getItem("shawarma-game-state");
    if (hasSavedData && gameState.totalShawarmasEarned > 0) {
      addNotification({
        id: `game-loaded-${Date.now()}`,
        message: `Welcome back! You have ${formatNumber(
          gameState.shawarmas
        )} shawarmas!`,
        type: "achievement",
        duration: 5000,
      });
    }
  }, [gameState.totalShawarmasEarned, addNotification]);

  // Calculate shawarmas per second based on upgrades
  useEffect(() => {
    const sps = upgrades.reduce((total, upgrade) => {
      return total + upgrade.shawarmasPerSecond * upgrade.owned;
    }, 0);

    dispatch({ type: "UPDATE_SPS", payload: sps });
  }, [upgrades, dispatch]);

  // Production loop for passive income
  useEffect(() => {
    if (gameState.shawarmasPerSecond > 0) {
      const interval = setInterval(() => {
        const earnings = gameState.shawarmasPerSecond / 10; // Update 10 times per second
        updateShawarmas(gameState.shawarmas + earnings);

        // Add production animation occasionally
        if (
          Math.random() < 0.1 &&
          productionAnimations.length < MAX_PRODUCTION_ANIMATIONS
        ) {
          const id = Date.now() + Math.random();
          setProductionAnimations((prev) => [
            ...prev,
            {
              id,
              x: Math.random() * 300 + 100,
              y: Math.random() * 200 + 100,
              amount: earnings,
            },
          ]);

          setTimeout(() => {
            setProductionAnimations((prev) =>
              prev.filter((anim) => anim.id !== id)
            );
          }, ANIMATION_CLEANUP_DELAY);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [
    gameState.shawarmasPerSecond,
    gameState.shawarmas,
    updateShawarmas,
    productionAnimations.length,
  ]);

  // Calculate shawarmas per click based on click upgrades
  useEffect(() => {
    const spc = clickUpgrades.reduce((total, upgrade) => {
      return total + (upgrade.owned ? upgrade.shawarmasPerClick : 0);
    }, 1);

    dispatch({ type: "UPDATE_SPC", payload: spc });
  }, [clickUpgrades, dispatch]);

  const handleShawarmaClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const shawarmasGained = gameState.shawarmasPerClick * clickMultiplier;
      addClick(shawarmasGained);

      // Add click animation
      if (clickAnimations.length < MAX_CLICK_ANIMATIONS) {
        const rect = event.currentTarget.getBoundingClientRect();
        const id = Date.now() + Math.random();
        setClickAnimations((prev) => [
          ...prev,
          {
            id,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          },
        ]);

        setTimeout(() => {
          setClickAnimations((prev) => prev.filter((anim) => anim.id !== id));
        }, ANIMATION_CLEANUP_DELAY);
      }

      // Update click rate stats
      dispatch({
        type: "UPDATE_STATS",
        payload: {
          bestClickRate: Math.max(
            gameStats.bestClickRate || 0,
            shawarmasGained
          ),
        },
      });

      // Check for click milestones
      const totalClicks = gameStats.totalClicks + 1;
      MILESTONES.clicks.forEach((milestone) => {
        if (totalClicks === milestone.threshold) {
          addNotification({
            id: `click-milestone-${milestone.threshold}`,
            message: milestone.message,
            type: "milestone",
            duration: 4000,
          });
        }
      });

      // Check for shawarma milestones
      const newTotal = gameState.shawarmas + shawarmasGained;
      MILESTONES.shawarmas.forEach((milestone) => {
        if (
          gameState.shawarmas < milestone.threshold &&
          newTotal >= milestone.threshold
        ) {
          addNotification({
            id: `shawarma-milestone-${milestone.threshold}`,
            message: milestone.message,
            type: "milestone",
            duration: 4000,
          });
        }
      });
    },
    [
      gameState.shawarmasPerClick,
      clickMultiplier,
      gameState.shawarmas,
      gameStats.totalClicks,
      gameStats.bestClickRate,
      addClick,
      dispatch,
      clickAnimations.length,
      addNotification,
    ]
  );

  const handleBuyUpgrade = useCallback(
    (upgrade: any) => {
      if (gameState.shawarmas >= upgrade.cost) {
        buyUpgrade(upgrade.id, upgrade.cost);

        addNotification({
          id: `upgrade-${upgrade.id}-${Date.now()}`,
          message: `Purchased ${upgrade.name}! +${upgrade.shawarmasPerSecond}/sec`,
          type: "upgrade",
          duration: 3000,
        });

        // Achievement check for first upgrade
        if (upgrades.every((u) => u.owned === 0)) {
          const achievement = achievements.find(
            (a) => a.id === "first-upgrade"
          );
          if (achievement) {
            addNotification({
              id: `achievement-${achievement.id}`,
              message: `Achievement Unlocked: ${achievement.name}`,
              type: "achievement",
              duration: 5000,
            });
          }
        }
      }
    },
    [gameState.shawarmas, buyUpgrade, upgrades, addNotification]
  );

  const handleBuyClickUpgrade = useCallback(
    (upgrade: any) => {
      if (gameState.shawarmas >= upgrade.cost && !upgrade.owned) {
        buyClickUpgrade(upgrade.id, upgrade.cost);

        addNotification({
          id: `click-upgrade-${upgrade.id}-${Date.now()}`,
          message: `Purchased ${upgrade.name}! +${upgrade.shawarmasPerClick} per click`,
          type: "upgrade",
          duration: 3000,
        });
      }
    },
    [gameState.shawarmas, buyClickUpgrade, addNotification]
  );

  const [activeEvents, setActiveEvents] = useState<SpecialEvent[]>([]);

  const triggerEvent = useCallback(
    (event: SpecialEvent) => {
      setActiveEvents((prev) => [...prev, event]);
      setClickMultiplier((prev) => prev * event.multiplier);

      addNotification({
        id: `event-${event.id}`,
        message: `${event.name} activated! ${event.multiplier}x clicks for ${
          event.duration / 1000
        }s!`,
        type: "special",
        duration: 3000,
      });

      setTimeout(() => {
        setActiveEvents((prev) => prev.filter((e) => e.id !== event.id));
        setClickMultiplier((prev) => prev / event.multiplier);
      }, event.duration);
    },
    [addNotification]
  );

  return (
    <Box
      position="relative"
      w="100%"
      h="100vh"
      overflow="hidden"
      bgGradient="linear(to-br, #1a202c, #2d3748, #4a5568)"
    >
      <AnimatedBackground />

      <Grid
        templateColumns={{ base: "1fr", lg: "300px 1fr 300px" }}
        templateRows="1fr"
        h="100%"
        gap={4}
        p={4}
      >
        {/* Left Panel - Upgrades */}
        <VStack
          align="stretch"
          bg="rgba(26, 32, 44, 0.9)"
          borderRadius="lg"
          p={4}
          overflowY="auto"
          maxH="100%"
        >
          <Text
            fontSize="xl"
            fontWeight="bold"
            color="orange.300"
            textAlign="center"
            mb={4}
          >
            🏪 Upgrades
          </Text>

          {upgrades.map((upgrade) => (
            <Box
              key={upgrade.id}
              p={3}
              bg={
                gameState.shawarmas >= upgrade.cost
                  ? "rgba(72, 187, 120, 0.2)"
                  : "rgba(45, 55, 72, 0.6)"
              }
              borderRadius="md"
              border="1px solid"
              borderColor={
                gameState.shawarmas >= upgrade.cost ? "green.400" : "gray.600"
              }
              cursor={
                gameState.shawarmas >= upgrade.cost ? "pointer" : "not-allowed"
              }
              onClick={() => handleBuyUpgrade(upgrade)}
              transition="all 0.2s"
              _hover={{
                transform:
                  gameState.shawarmas >= upgrade.cost
                    ? "translateY(-2px)"
                    : "none",
                boxShadow:
                  gameState.shawarmas >= upgrade.cost
                    ? "0 4px 15px rgba(72, 187, 120, 0.4)"
                    : "none",
              }}
            >
              <VStack align="start" gap={1}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" fontWeight="bold" color="white">
                    {upgrade.icon} {upgrade.name}
                  </Text>
                  {upgrade.owned > 0 && (
                    <Badge colorScheme="green" size="sm">
                      {upgrade.owned}
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="xs" color="gray.400">
                  {upgrade.description}
                </Text>
                <HStack justify="space-between" w="full">
                  <Text fontSize="xs" color="green.300">
                    +{upgrade.shawarmasPerSecond}/sec
                  </Text>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={
                      gameState.shawarmas >= upgrade.cost
                        ? "green.300"
                        : "red.300"
                    }
                  >
                    {formatNumber(upgrade.cost)} 🥙
                  </Text>
                </HStack>
              </VStack>
            </Box>
          ))}
        </VStack>

        {/* Center Panel - Main Game */}
        <VStack justify="center" align="center" flex={1} position="relative">
          {/* Shawarma Counter */}
          <VStack gap={4} align="center">
            <Text
              fontSize="6xl"
              fontWeight="black"
              color="orange.300"
              textShadow="0 0 20px rgba(255, 165, 0, 0.5)"
              textAlign="center"
            >
              {formatShawarmaCount(gameState.shawarmas)}
            </Text>
            <Text fontSize="xl" color="gray.300" textAlign="center">
              {formatPerSecond(gameState.shawarmasPerSecond)}/sec
            </Text>
          </VStack>

          {/* Giant Shawarma */}
          <Box
            position="relative"
            cursor="pointer"
            onClick={handleShawarmaClick}
            _hover={{ transform: "scale(1.05)" }}
            _active={{ transform: "scale(0.95)" }}
            transition="all 0.1s"
          >
            <Text
              fontSize="20rem"
              lineHeight="1"
              userSelect="none"
              className="shawarma-hover"
              filter="drop-shadow(0 10px 25px rgba(0, 0, 0, 0.3))"
            >
              🥙
            </Text>

            {/* Click Animations */}
            {clickAnimations.map((animation) => (
              <Box
                key={animation.id}
                position="absolute"
                left={animation.x}
                top={animation.y}
                pointerEvents="none"
                className="float-up"
                fontSize="2xl"
                fontWeight="bold"
                color="green.300"
                textShadow="0 0 10px rgba(72, 187, 120, 0.8)"
              >
                +{formatNumber(gameState.shawarmasPerClick * clickMultiplier)}
              </Box>
            ))}

            {/* Production Animations */}
            {productionAnimations.map((animation) => (
              <Box
                key={animation.id}
                position="absolute"
                left={animation.x}
                top={animation.y}
                pointerEvents="none"
                className="float-up"
                fontSize="lg"
                fontWeight="bold"
                color="blue.300"
                textShadow="0 0 10px rgba(66, 153, 225, 0.8)"
              >
                +{formatNumber(animation.amount)}
              </Box>
            ))}
          </Box>

          {/* Click Power Display */}
          <HStack gap={2} align="center">
            <Text fontSize="lg" color="yellow.300" fontWeight="bold">
              👆 Click Power:
            </Text>
            <Text fontSize="lg" color="green.300" fontWeight="bold">
              {formatNumber(gameState.shawarmasPerClick * clickMultiplier)}
            </Text>
            {clickMultiplier > 1 && (
              <Badge colorScheme="purple" fontSize="sm">
                {clickMultiplier}x Boost!
              </Badge>
            )}
          </HStack>
        </VStack>

        {/* Right Panel - Click Upgrades & Stats */}
        <VStack align="stretch" gap={4} maxH="100%">
          {/* Click Upgrades */}
          <VStack
            align="stretch"
            bg="rgba(26, 32, 44, 0.9)"
            borderRadius="lg"
            p={4}
            overflowY="auto"
            flex={1}
          >
            <Text
              fontSize="xl"
              fontWeight="bold"
              color="purple.300"
              textAlign="center"
              mb={4}
            >
              ⚡ Click Upgrades
            </Text>

            {clickUpgrades.map((upgrade) => (
              <Box
                key={upgrade.id}
                p={3}
                bg={
                  upgrade.owned
                    ? "rgba(128, 90, 213, 0.3)"
                    : gameState.shawarmas >= upgrade.cost
                    ? "rgba(128, 90, 213, 0.2)"
                    : "rgba(45, 55, 72, 0.6)"
                }
                borderRadius="md"
                border="1px solid"
                borderColor={
                  upgrade.owned
                    ? "purple.400"
                    : gameState.shawarmas >= upgrade.cost
                    ? "purple.400"
                    : "gray.600"
                }
                cursor={
                  !upgrade.owned && gameState.shawarmas >= upgrade.cost
                    ? "pointer"
                    : "not-allowed"
                }
                onClick={() => !upgrade.owned && handleBuyClickUpgrade(upgrade)}
                transition="all 0.2s"
                opacity={upgrade.owned ? 0.7 : 1}
                _hover={{
                  transform:
                    !upgrade.owned && gameState.shawarmas >= upgrade.cost
                      ? "translateY(-2px)"
                      : "none",
                  boxShadow:
                    !upgrade.owned && gameState.shawarmas >= upgrade.cost
                      ? "0 4px 15px rgba(128, 90, 213, 0.4)"
                      : "none",
                }}
              >
                <VStack align="start" gap={1}>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" fontWeight="bold" color="white">
                      {upgrade.icon} {upgrade.name}
                    </Text>
                    {upgrade.owned && (
                      <Badge colorScheme="purple" size="sm">
                        OWNED
                      </Badge>
                    )}
                  </HStack>
                  <Text fontSize="xs" color="gray.400">
                    {upgrade.description}
                  </Text>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="xs" color="purple.300">
                      +{upgrade.shawarmasPerClick} per click
                    </Text>
                    {!upgrade.owned && (
                      <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color={
                          gameState.shawarmas >= upgrade.cost
                            ? "green.300"
                            : "red.300"
                        }
                      >
                        {formatNumber(upgrade.cost)} 🥙
                      </Text>
                    )}
                  </HStack>
                </VStack>
              </Box>
            ))}
          </VStack>

          {/* Stats Panel */}
          <StatsPanel
            stats={gameStats}
            gameState={gameState}
            upgrades={upgrades}
            showAchievements={showAchievements}
            onToggleAchievements={() => setShowAchievements(!showAchievements)}
          />
        </VStack>
      </Grid>

      {/* Notification System */}
      <NotificationSystem notifications={notifications} />

      {/* Special Events */}
      <SpecialEvents
        gameState={gameState}
        onTriggerEvent={triggerEvent}
        activeEvents={activeEvents}
      />
    </Box>
  );
};

export default ShawarmaClicker;
