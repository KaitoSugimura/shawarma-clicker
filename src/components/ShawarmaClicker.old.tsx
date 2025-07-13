import React, { useState, useEffect, useCallback } from "react";
import { Box, VStack, HStack, Text, Grid, Badge } from "@chakra-ui/react";

import NotificationSystem from "./NotificationSystem";
import SpecialEvents from "./SpecialEvents";
import AnimatedBackground from "./AnimatedBackground";
import type { Notification, SpecialEvent } from "../types/game";
import { achievements } from "../data/gameData";
import { formatNumber, formatPerSecond } from "../utils/gameUtils";
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
    addProduction,
    buyUpgrade,
    buyClickUpgrade,
    dispatch,
  } = useGame();
  const {
    clicker: gameState,
    upgrades,
    clickUpgrades,
    stats: gameStats,
  } = state;

  const [clickAnimations, setClickAnimations] = useState<
    Array<{ id: number; x: number; y: number; timestamp: number }>
  >([]);
  const [productionAnimations, setProductionAnimations] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      amount: number;
      timestamp: number;
    }>
  >([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [clickMultiplier, setClickMultiplier] = useState(1);
  const [activeEvents, setActiveEvents] = useState<SpecialEvent[]>([]);
  const [lastClickTime, setLastClickTime] = useState(0);

  // Throttle rapid clicking to prevent performance issues
  const CLICK_THROTTLE_MS = 50; // Minimum time between clicks

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => {
      // Limit notifications to prevent memory bloat
      const newNotifications = [notification, ...prev.slice(0, 3)];
      return newNotifications;
    });
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, notification.duration || 3000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Auto-production effect with enhanced visual feedback
  useEffect(() => {
    console.log(
      "Auto-production effect triggered. shawarmasPerSecond:",
      gameState.shawarmasPerSecond
    );

    if (gameState.shawarmasPerSecond <= 0) {
      console.log(
        "No production - shawarmasPerSecond is",
        gameState.shawarmasPerSecond
      );
      return;
    }

    console.log(
      "Starting auto-production interval with",
      gameState.shawarmasPerSecond,
      "per second"
    );

    const interval = setInterval(() => {
      const production = Math.floor(gameState.shawarmasPerSecond);
      console.log("Production tick:", production);
      if (production > 0) {
        addProduction(production); // Use addProduction for auto-generated shawarmas

        // Add multiple production animations for better visibility
        const animationCount = Math.min(
          3,
          Math.max(1, Math.floor(production / 10))
        );

        for (let i = 0; i < animationCount; i++) {
          setTimeout(() => {
            const newAnimation = {
              id: Date.now() + Math.random() + i,
              x: 30 + Math.random() * 40, // Wider spread around the shawarma
              y: 30 + Math.random() * 40, // Wider spread around the shawarma
              amount: Math.floor(production / animationCount),
              timestamp: Date.now(),
            };

            setProductionAnimations((prev) => {
              const updated = [...prev, newAnimation];
              // More aggressive cleanup to prevent accumulation
              return updated.length > MAX_PRODUCTION_ANIMATIONS
                ? updated.slice(-MAX_PRODUCTION_ANIMATIONS)
                : updated;
            });

            // Clean up animation with shorter duration for performance
            setTimeout(() => {
              setProductionAnimations((prev) =>
                prev.filter((anim) => anim.id !== newAnimation.id)
              );
            }, ANIMATION_CLEANUP_DELAY);
          }, i * 150); // Stagger animations for better visual effect
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.shawarmasPerSecond, addProduction]);

  // Enhanced cleanup effect to prevent memory leaks
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();

      // Clean up old click animations (older than 2 seconds)
      setClickAnimations((prev) => prev.filter((anim) => now - anim.id < 2000));

      // Clean up old production animations (older than 3 seconds)
      setProductionAnimations((prev) =>
        prev.filter((anim) => now - anim.timestamp < 3000)
      );
    }, 1000); // Run cleanup every second

    return () => clearInterval(cleanupInterval);
  }, []);

  // Achievement checking effect
  useEffect(() => {
    achievements.forEach((achievement) => {
      if (
        !gameState.achievements.includes(achievement.id) &&
        achievement.requirement(gameState, upgrades, clickUpgrades)
      ) {
        // Add achievement to game state
        dispatch({
          type: "UNLOCK_ACHIEVEMENT",
          payload: achievement.id,
        });

        addNotification({
          id: `achievement-${achievement.id}`,
          title: "Achievement Unlocked!",
          message: `${achievement.name}: ${achievement.description}`,
          type: "achievement",
          duration: 5000,
        });
      }
    });
  }, [
    gameState.shawarmas,
    gameState.totalShawarmasEarned,
    gameState.achievements.length,
    dispatch,
    addNotification,
  ]);

  const handleShawarmaClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      // Throttle rapid clicking to prevent performance issues
      const now = Date.now();
      if (now - lastClickTime < CLICK_THROTTLE_MS) {
        return;
      }
      setLastClickTime(now);

      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      const shawarmasGained = Math.max(
        1,
        (gameState.shawarmasPerClick || 1) * clickMultiplier
      );
      addClick(shawarmasGained);

      // Add click animation with timestamp for better cleanup
      const newAnimation = {
        id: now + Math.random(),
        x,
        y,
        timestamp: now,
      };

      setClickAnimations((prev) => {
        // More aggressive cleanup - keep only recent animations
        const recentAnimations = prev.filter(
          (anim) => now - anim.timestamp < 1000
        );
        const updated = [...recentAnimations, newAnimation];

        return updated.length > MAX_CLICK_ANIMATIONS
          ? updated.slice(-MAX_CLICK_ANIMATIONS)
          : updated;
      });

      // Faster cleanup for click animations to prevent lag
      setTimeout(() => {
        setClickAnimations((prev) =>
          prev.filter((anim) => anim.id !== newAnimation.id)
        );
      }, 600); // Reduced from ANIMATION_CLEANUP_DELAY

      // Update stats
      const newTotalClicks = gameStats.totalClicks + 1;
      const newClickRate = Math.max(gameStats.bestClickRate, shawarmasGained);

      dispatch({
        type: "UPDATE_STATS",
        payload: {
          totalClicks: newTotalClicks,
          bestClickRate: newClickRate,
        },
      });

      // Check for click milestones
      const totalClicks = newTotalClicks;
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
      lastClickTime,
      gameState.shawarmasPerClick,
      clickMultiplier,
      gameState.shawarmas,
      gameStats.totalClicks,
      gameStats.bestClickRate,
      addClick,
      dispatch,
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

        // Update stats
        dispatch({
          type: "UPDATE_STATS",
          payload: {
            totalUpgradesPurchased: gameStats.totalUpgradesPurchased + 1,
          },
        });
      }
    },
    [
      gameState.shawarmas,
      upgrades,
      buyUpgrade,
      gameStats.totalUpgradesPurchased,
      dispatch,
      addNotification,
    ]
  );

  const handleBuyClickUpgrade = useCallback(
    (upgrade: any) => {
      if (gameState.shawarmas >= upgrade.cost) {
        buyClickUpgrade(upgrade.id, upgrade.cost);

        addNotification({
          id: `click-upgrade-${upgrade.id}-${Date.now()}`,
          message: `Purchased ${upgrade.name}! +${upgrade.clickPower} per click`,
          type: "upgrade",
          duration: 3000,
        });

        // Update stats
        dispatch({
          type: "UPDATE_STATS",
          payload: {
            totalUpgradesPurchased: gameStats.totalUpgradesPurchased + 1,
          },
        });
      }
    },
    [
      gameState.shawarmas,
      buyClickUpgrade,
      gameStats.totalUpgradesPurchased,
      dispatch,
      addNotification,
    ]
  );

  const triggerEvent = useCallback(
    (event: SpecialEvent) => {
      setActiveEvents((prev) => [...prev, event]);

      if (event.type === "frenzy") {
        setClickMultiplier((prev) => prev * event.multiplier);
        setTimeout(() => {
          setClickMultiplier((prev) => prev / event.multiplier);
        }, event.duration);
      }

      addNotification({
        id: `event-${Date.now()}`,
        title: "Special Event!",
        message: event.message,
        type: "milestone",
        duration: event.duration,
      });

      // Remove event after duration
      setTimeout(() => {
        setActiveEvents((prev) => prev.filter((e) => e.id !== event.id));
        setClickMultiplier((prev) => prev / event.multiplier);
      }, event.duration);
    },
    [addNotification]
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

        <VStack gap={{ base: 3, md: 6 }} align="center" zIndex="2">
          {/* Animated Background Behind Shawarma */}
          <AnimatedBackground />

          {/* Instructions text - only show on medium+ screens */}
          <Text
            fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
            textAlign="center"
            color="orange.300"
            fontWeight="semibold"
            px={4}
            display={{ base: "none", md: "block" }}
          >
            Click the Shawarma to earn more!
          </Text>

          {/* Main Shawarma */}
          <Box position="relative" zIndex="10">
            <Box
              onClick={handleShawarmaClick}
              cursor="pointer"
              display="flex"
              alignItems="center"
              justifyContent="center"
              w={{
                base: "180px",
                sm: "220px",
                md: "300px",
                lg: "400px",
              }}
              h={{
                base: "180px",
                sm: "220px",
                md: "300px",
                lg: "400px",
              }}
              fontSize={{
                base: "120px",
                sm: "150px",
                md: "200px",
                lg: "280px",
              }}
              borderRadius="full"
              bg="radial-gradient(circle, rgba(255, 165, 0, 0.3), rgba(255, 140, 0, 0.1))"
              boxShadow="0 0 30px rgba(255, 165, 0, 0.5), inset 0 0 20px rgba(255, 165, 0, 0.1)"
              transform="scale(1)"
              transition="all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)"
              _hover={{
                transform: "scale(1.05)",
                boxShadow:
                  "0 0 40px rgba(255, 165, 0, 0.7), inset 0 0 25px rgba(255, 165, 0, 0.2)",
              }}
              _active={{
                transform: "scale(0.95)",
                boxShadow:
                  "0 0 20px rgba(255, 165, 0, 0.8), inset 0 0 30px rgba(255, 165, 0, 0.3)",
              }}
            >
              <Text
                fontSize="inherit"
                animation={
                  gameState.shawarmasPerSecond > 0
                    ? "shawarmaGlow 2s ease-in-out infinite"
                    : "none"
                }
              >
                🥙
              </Text>
              {/* Click Animation Overlay */}
              {clickAnimations.map((animation) => (
                <Box
                  key={animation.id}
                  position="absolute"
                  left={`${animation.x}%`}
                  top={`${animation.y}%`}
                  fontSize="3xl"
                  fontWeight="bold"
                  color="orange.300"
                  pointerEvents="none"
                  transform="translate(-50%, -50%)"
                  animation="clickPop 0.6s ease-out forwards"
                  zIndex="20"
                  textShadow="0 0 10px rgba(255, 165, 0, 0.8)"
                >
                  +{gameState.shawarmasPerClick * clickMultiplier}
                </Box>
              ))}
              {/* Production Animation Overlay - Enhanced */}
              {productionAnimations.map((animation) => (
                <Box
                  key={animation.id}
                  position="absolute"
                  left={`${animation.x}%`}
                  top={`${animation.y}%`}
                  fontSize="2xl"
                  fontWeight="bold"
                  color="green.300"
                  pointerEvents="none"
                  transform="translate(-50%, -50%)"
                  animation="productionFloat 2s ease-out forwards"
                  zIndex="15"
                  textShadow="0 0 15px rgba(72, 187, 120, 0.9)"
                  _before={{
                    content: '"⚡"',
                    mr: 1,
                    fontSize: "lg",
                  }}
                >
                  +{animation.amount}
                </Box>
              ))}
            </Box>

            {/* Click multiplier indicator */}
            {clickMultiplier > 1 && (
              <Box
                position="absolute"
                top="-10px"
                right="-10px"
                bg="purple.500"
                color="white"
                fontSize="sm"
                fontWeight="bold"
                px={2}
                py={1}
                borderRadius="full"
                boxShadow="0 0 10px rgba(128, 90, 213, 0.6)"
                animation="pulse 1s ease-in-out infinite"
              >
                🔥{clickMultiplier}x
              </Box>
            )}
          </Box>

          {/* Per-click and Per-second display for desktop */}
          <VStack gap={2} display={{ base: "none", md: "flex" }}>
            <Text
              fontSize="xl"
              fontWeight="semibold"
              color="orange.300"
              textAlign="center"
            >
              +{gameState.shawarmasPerClick * clickMultiplier} per click
              {clickMultiplier > 1 && (
                <Text as="span" color="purple.400" fontWeight="bold">
                  {" "}
                  (🔥 Frenzy!)
                </Text>
              )}
            </Text>

            {gameState.shawarmasPerSecond > 0 && (
              <Box
                px={4}
                py={2}
                bg="rgba(26, 32, 44, 0.7)"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="cyan.600"
              >
                <Text
                  fontSize="md"
                  color="cyan.300"
                  textAlign="center"
                  fontWeight="medium"
                >
                  🏭 Auto-production: +
                  {formatPerSecond(gameState.shawarmasPerSecond)}/sec
                </Text>
              </Box>
            )}

            {gameState.shawarmasPerSecond > 0 && (
              <Box
                w="200px"
                h="3"
                bg="rgba(74, 85, 104, 0.6)"
                borderRadius="full"
                overflow="hidden"
                border="1px solid"
                borderColor="gray.600"
              >
                <Box
                  h="full"
                  bg="linear-gradient(90deg, cyan.400, cyan.300, cyan.400)"
                  borderRadius="full"
                  animation="progressBar 1s ease-in-out infinite"
                  boxShadow="0 0 10px rgba(56, 178, 172, 0.4)"
                />
              </Box>
            )}
          </VStack>
        </VStack>

        {/* Fixed Efficiency Stats Overlay */}
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
                {formatPerSecond(gameState.shawarmasPerSecond)}
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
                {formatNumber(gameState.shawarmasPerClick * clickMultiplier)}
              </Text>
            </HStack>
            {gameState.shawarmasPerSecond > 0 && (
              <HStack justify="space-between">
                <Text fontSize={{ base: "xs", md: "xs" }} color="gray.400">
                  1K in
                </Text>
                <Text
                  fontSize={{ base: "xs", md: "xs" }}
                  fontWeight="bold"
                  color="cyan.300"
                >
                  {Math.ceil(1000 / gameState.shawarmasPerSecond)}s
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
        display={{ base: "block", md: "block" }}
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
            <Text fontSize="xl" fontWeight="bold" mb={4} color="orange.400">
              Production Upgrades
            </Text>
            <VStack gap={3}>
              {upgrades.map((upgrade) => (
                <Box
                  key={upgrade.id}
                  p={3}
                  w="full"
                  bg={
                    gameState.shawarmas >= upgrade.cost
                      ? "rgba(251, 211, 141, 0.1)"
                      : "rgba(74, 85, 104, 0.3)"
                  }
                  borderWidth="1px"
                  borderColor={
                    gameState.shawarmas >= upgrade.cost
                      ? "orange.400"
                      : "gray.600"
                  }
                  borderRadius="lg"
                  cursor={
                    gameState.shawarmas >= upgrade.cost
                      ? "pointer"
                      : "not-allowed"
                  }
                  opacity={gameState.shawarmas >= upgrade.cost ? 1 : 0.6}
                  onClick={() => handleBuyUpgrade(upgrade)}
                  _hover={
                    gameState.shawarmas >= upgrade.cost
                      ? {
                          bg: "rgba(251, 211, 141, 0.2)",
                          borderColor: "orange.300",
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(251, 211, 141, 0.3)",
                        }
                      : {}
                  }
                  _focus={{ boxShadow: "none" }}
                  transition="all 0.2s"
                >
                  <HStack justify="space-between">
                    <VStack align="start" gap={1} flex={1}>
                      <HStack>
                        <Text fontSize="2xl">{upgrade.icon}</Text>
                        <Text fontWeight="semibold" fontSize="sm" color="white">
                          {upgrade.name}
                        </Text>
                        {upgrade.owned > 0 && (
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
                      </HStack>
                      <Text fontSize="xs" color="gray.400">
                        {upgrade.description}
                      </Text>
                      <Text fontSize="xs" color="orange.300">
                        +{(upgrade.baseProduction * upgrade.owned).toFixed(1)}
                        /sec
                      </Text>
                    </VStack>
                    <VStack align="end" gap={1}>
                      <Text fontSize="sm" fontWeight="bold" color="green.400">
                        {formatNumber(upgrade.cost)}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Box>

          {/* Click Upgrades */}
          <Box>
            <Text fontSize="xl" fontWeight="bold" mb={4} color="purple.400">
              Click Upgrades
            </Text>
            <VStack gap={3}>
              {clickUpgrades.map((upgrade) => (
                <Box
                  key={upgrade.id}
                  p={3}
                  w="full"
                  bg={
                    upgrade.owned
                      ? "rgba(72, 187, 120, 0.1)"
                      : gameState.shawarmas >= upgrade.cost
                      ? "rgba(196, 181, 253, 0.1)"
                      : "rgba(74, 85, 104, 0.3)"
                  }
                  borderWidth="1px"
                  borderColor={
                    upgrade.owned
                      ? "green.400"
                      : gameState.shawarmas >= upgrade.cost
                      ? "purple.400"
                      : "gray.600"
                  }
                  borderRadius="lg"
                  cursor={
                    !upgrade.owned && gameState.shawarmas >= upgrade.cost
                      ? "pointer"
                      : "not-allowed"
                  }
                  opacity={
                    upgrade.owned
                      ? 0.8
                      : gameState.shawarmas >= upgrade.cost
                      ? 1
                      : 0.6
                  }
                  onClick={() => handleBuyClickUpgrade(upgrade)}
                  _hover={
                    !upgrade.owned && gameState.shawarmas >= upgrade.cost
                      ? {
                          bg: "rgba(196, 181, 253, 0.2)",
                          borderColor: "purple.300",
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(196, 181, 253, 0.3)",
                        }
                      : {}
                  }
                  _focus={{ boxShadow: "none" }}
                  transition="all 0.2s"
                >
                  <HStack justify="space-between">
                    <VStack align="start" gap={1} flex={1}>
                      <HStack>
                        <Text fontWeight="semibold" fontSize="sm" color="white">
                          {upgrade.name}
                        </Text>
                        {upgrade.owned && (
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
                    </VStack>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={upgrade.owned ? "green.400" : "green.400"}
                    >
                      {upgrade.owned ? "OWNED" : formatNumber(upgrade.cost)}
                    </Text>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Box>

          {/* Game Statistics */}
          <Box>
            <Text fontSize="xl" fontWeight="bold" mb={4} color="cyan.400">
              📊 Game Statistics
            </Text>
            <VStack gap={3} align="stretch">
              <Box
                p={3}
                bg="rgba(74, 85, 104, 0.3)"
                borderWidth="1px"
                borderColor="gray.600"
                borderRadius="lg"
              >
                <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                  <VStack align="start" gap={1}>
                    <Text fontSize="xs" color="gray.400">
                      Total Clicks
                    </Text>
                    <Text fontSize="sm" fontWeight="bold" color="cyan.300">
                      {formatNumber(gameStats.totalClicks)}
                    </Text>
                  </VStack>
                  <VStack align="start" gap={1}>
                    <Text fontSize="xs" color="gray.400">
                      Best Click Rate
                    </Text>
                    <Text fontSize="sm" fontWeight="bold" color="cyan.300">
                      {formatNumber(gameStats.bestClickRate)}/click
                    </Text>
                  </VStack>
                  <VStack align="start" gap={1}>
                    <Text fontSize="xs" color="gray.400">
                      Total Earned
                    </Text>
                    <Text fontSize="sm" fontWeight="bold" color="cyan.300">
                      {formatNumber(gameState.totalShawarmasEarned)}
                    </Text>
                  </VStack>
                  <VStack align="start" gap={1}>
                    <Text fontSize="xs" color="gray.400">
                      Upgrades Bought
                    </Text>
                    <Text fontSize="sm" fontWeight="bold" color="cyan.300">
                      {formatNumber(gameStats.totalUpgradesPurchased)}
                    </Text>
                  </VStack>
                  <VStack align="start" gap={1}>
                    <Text fontSize="xs" color="gray.400">
                      Shawarmas Per Second
                    </Text>
                    <Text fontSize="sm" fontWeight="bold" color="cyan.300">
                      {formatPerSecond(gameState.shawarmasPerSecond)}/sec
                    </Text>
                  </VStack>
                  <VStack align="start" gap={1}>
                    <Text fontSize="xs" color="gray.400">
                      Shawarmas Per Click
                    </Text>
                    <Text fontSize="sm" fontWeight="bold" color="cyan.300">
                      {formatNumber(gameState.shawarmasPerClick)}/click
                    </Text>
                  </VStack>
                </Grid>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes clickFloat {
            0% {
              opacity: 1;
              transform: translate(-50%, -50%) translateY(0px) scale(0.8);
            }
            50% {
              opacity: 1;
              transform: translate(-50%, -50%) translateY(-30px) scale(1.2);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) translateY(-80px) scale(1.4);
            }
          }

          @keyframes productionFloat {
            0% {
              opacity: 1;
              transform: translate(-50%, -50%) translateY(0px) scale(0.6);
            }
            30% {
              opacity: 0.9;
              transform: translate(-50%, -50%) translateY(-25px) scale(1.1);
            }
            70% {
              opacity: 0.7;
              transform: translate(-50%, -50%) translateY(-55px) scale(1.2);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) translateY(-90px) scale(1.3);
            }
          }
          
          @keyframes progressBar {
            0% {
              width: 0%;
            }
            100% {
              width: 100%;
            }
          }

          @keyframes backgroundMove {
            0% {
              transform: translateX(0) translateY(0);
            }
            100% {
              transform: translateX(50px) translateY(50px);
            }
          }

          @keyframes float0 {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
              opacity: 0.3;
            }
            50% {
              transform: translateY(-20px) rotate(180deg);
              opacity: 0.8;
            }
          }

          @keyframes float1 {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
              opacity: 0.4;
            }
            50% {
              transform: translateY(-30px) rotate(-180deg);
              opacity: 0.9;
            }
          }

          @keyframes float2 {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
              opacity: 0.2;
            }
            50% {
              transform: translateY(-25px) rotate(90deg);
              opacity: 0.7;
            }
          }

          @keyframes clickPop {
            0% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(0.5);
            }
            30% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1.5) translateY(-10px);
            }
            70% {
              opacity: 0.8;
              transform: translate(-50%, -50%) scale(1.3) translateY(-25px);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.8) translateY(-50px);
            }
          }

          @keyframes productionFloat {
            0% {
              opacity: 0.9;
              transform: translate(-50%, -50%) scale(0.8);
            }
            20% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1.3) translateY(-8px);
            }
            50% {
              opacity: 0.8;
              transform: translate(-50%, -50%) scale(1.2) translateY(-20px);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(1.0) translateY(-40px);
            }
          }

          @keyframes shawarmaGlow {
            0%, 100% {
              text-shadow: 0 0 20px rgba(255, 165, 0, 0.5), 0 0 40px rgba(255, 165, 0, 0.3);
              filter: drop-shadow(0 0 15px rgba(255, 165, 0, 0.4));
            }
            50% {
              text-shadow: 0 0 30px rgba(255, 165, 0, 0.8), 0 0 60px rgba(255, 165, 0, 0.5);
              filter: drop-shadow(0 0 25px rgba(255, 165, 0, 0.7));
            }
          }
        `}
      </style>

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
};

export default ShawarmaClicker;
