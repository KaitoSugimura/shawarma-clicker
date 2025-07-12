import React, { useState, useEffect, useCallback } from "react";
import { Box, VStack, HStack, Text, Grid, Badge } from "@chakra-ui/react";

import NotificationSystem from "./NotificationSystem";
import SpecialEvents from "./SpecialEvents";
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
  const [activeEvents, setActiveEvents] = useState<SpecialEvent[]>([]);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, notification.duration || 3000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Auto-production effect
  useEffect(() => {
    if (gameState.shawarmasPerSecond <= 0) return;

    const interval = setInterval(() => {
      const production = Math.floor(gameState.shawarmasPerSecond);
      if (production > 0) {
        updateShawarmas(production);

        // Add production animation
        const newAnimation = {
          id: Date.now() + Math.random(),
          x: 45 + Math.random() * 10,
          y: 45 + Math.random() * 10,
          amount: production,
        };

        setProductionAnimations((prev) => {
          const updated = [...prev, newAnimation];
          return updated.length > MAX_PRODUCTION_ANIMATIONS
            ? updated.slice(-MAX_PRODUCTION_ANIMATIONS)
            : updated;
        });

        // Clean up animation
        setTimeout(() => {
          setProductionAnimations((prev) =>
            prev.filter((anim) => anim.id !== newAnimation.id)
          );
        }, ANIMATION_CLEANUP_DELAY);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.shawarmasPerSecond, updateShawarmas]);

  // Achievement checking effect
  useEffect(() => {
    achievements.forEach((achievement) => {
      if (
        !gameState.achievements.includes(achievement.id) &&
        achievement.requirement(gameState, upgrades)
      ) {
        // Add achievement to game state manually
        dispatch({
          type: "UPDATE_SHAWARMAS",
          payload: 0,
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
  }, [gameState, upgrades, dispatch, addNotification]);

  const handleShawarmaClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      const shawarmasGained = gameState.shawarmasPerClick * clickMultiplier;
      addClick(shawarmasGained);

      // Add click animation
      const newAnimation = { id: Date.now() + Math.random(), x, y };
      setClickAnimations((prev) => {
        const updated = [...prev, newAnimation];
        return updated.length > MAX_CLICK_ANIMATIONS
          ? updated.slice(-MAX_CLICK_ANIMATIONS)
          : updated;
      });

      // Clean up animation
      setTimeout(() => {
        setClickAnimations((prev) =>
          prev.filter((anim) => anim.id !== newAnimation.id)
        );
      }, ANIMATION_CLEANUP_DELAY);

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
    <>
      <Box
        h="100vh"
        w="100vw"
        bg="gray.900"
        color="white"
        overflow="hidden"
        position="fixed"
        top="0"
        left="0"
        margin="0"
        padding="0"
      >
        {/* Animated Background */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          zIndex="0"
          opacity="0.1"
        >
          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <Box
              key={i}
              position="absolute"
              w="4px"
              h="4px"
              bg="orange.400"
              borderRadius="full"
              animation={`float${i % 3} ${4 + (i % 3)}s ease-in-out infinite`}
              left={`${Math.random() * 100}%`}
              top={`${Math.random() * 100}%`}
            />
          ))}
        </Box>

        <VStack
          h="100vh"
          gap={0}
          align="stretch"
          position="relative"
          zIndex="1"
        >
          {/* Header */}
          <Box
            p={{ base: 3, md: 4 }}
            bg="rgba(26, 32, 44, 0.95)"
            borderBottomWidth="1px"
            borderBottomColor="gray.700"
            backdropFilter="blur(10px)"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.3)"
          >
            <VStack gap={{ base: 2, md: 4 }}>
              <Text
                fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
                fontWeight="bold"
                color="orange.400"
                textAlign="center"
              >
                🥙 Shawarma Clicker 🥙
              </Text>
              <HStack gap={{ base: 4, md: 8 }} justify="center" wrap="wrap">
                <VStack gap={1}>
                  <Text
                    fontSize={{ base: "xl", md: "2xl" }}
                    fontWeight="bold"
                    color="orange.300"
                  >
                    {formatShawarmaCount(gameState.shawarmas)}
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    Shawarmas
                  </Text>
                </VStack>
                <VStack gap={1}>
                  <Text
                    fontSize={{ base: "md", md: "lg" }}
                    fontWeight="semibold"
                    color="orange.300"
                  >
                    {formatPerSecond(gameState.shawarmasPerSecond)}/sec
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    Per Second
                  </Text>
                </VStack>
                <VStack gap={1}>
                  <Text fontSize="lg" fontWeight="semibold" color="orange.300">
                    {formatNumber(gameState.totalShawarmasEarned)}
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    Total Earned
                  </Text>
                </VStack>
              </HStack>

              {/* Mobile-only game info */}
              <VStack gap={2} display={{ base: "flex", md: "none" }} mt={2}>
                <Text
                  fontSize="sm"
                  textAlign="center"
                  color="orange.300"
                  fontWeight="medium"
                >
                  Tap the Shawarma! +
                  {gameState.shawarmasPerClick * clickMultiplier} per tap
                  {clickMultiplier > 1 && (
                    <Text as="span" color="purple.400" fontWeight="bold" ml={1}>
                      (🔥 {clickMultiplier}x!)
                    </Text>
                  )}
                </Text>

                {gameState.shawarmasPerSecond > 0 && (
                  <HStack gap={2} justify="center">
                    <Text fontSize="xs" color="cyan.300">
                      Auto-production:{" "}
                      {formatPerSecond(gameState.shawarmasPerSecond)}/sec
                    </Text>
                  </HStack>
                )}
              </VStack>
            </VStack>
          </Box>

          {/* Main Game Area */}
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
            flex="1"
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
                      base: "140px",
                      sm: "180px",
                      md: "240px",
                      lg: "320px",
                    }}
                    h={{
                      base: "140px",
                      sm: "180px",
                      md: "240px",
                      lg: "320px",
                    }}
                    fontSize={{
                      base: "100px",
                      sm: "120px",
                      md: "160px",
                      lg: "220px",
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
                    🥙
                    {/* Click Animation Overlay */}
                    {clickAnimations.map((animation) => (
                      <Box
                        key={animation.id}
                        position="absolute"
                        left={`${animation.x}%`}
                        top={`${animation.y}%`}
                        fontSize="lg"
                        fontWeight="bold"
                        color="orange.300"
                        pointerEvents="none"
                        transform="translate(-50%, -50%)"
                        animation="clickPop 0.6s ease-out forwards"
                        zIndex="20"
                      >
                        +{gameState.shawarmasPerClick * clickMultiplier}
                      </Box>
                    ))}
                    {/* Production Animation Overlay */}
                    {productionAnimations.map((animation) => (
                      <Box
                        key={animation.id}
                        position="absolute"
                        left={`${animation.x}%`}
                        top={`${animation.y}%`}
                        fontSize="md"
                        fontWeight="semibold"
                        color="cyan.300"
                        pointerEvents="none"
                        transform="translate(-50%, -50%)"
                        animation="productionFloat 1s ease-out forwards"
                        zIndex="15"
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
                  <Text
                    fontSize="xl"
                    fontWeight="bold"
                    mb={4}
                    color="orange.400"
                  >
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
                                boxShadow:
                                  "0 4px 12px rgba(251, 211, 141, 0.3)",
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
                              <Text
                                fontWeight="semibold"
                                fontSize="sm"
                                color="white"
                              >
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
                              +
                              {(upgrade.baseProduction * upgrade.owned).toFixed(
                                1
                              )}
                              /sec
                            </Text>
                          </VStack>
                          <VStack align="end" gap={1}>
                            <Text
                              fontSize="sm"
                              fontWeight="bold"
                              color="green.400"
                            >
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
                  <Text
                    fontSize="xl"
                    fontWeight="bold"
                    mb={4}
                    color="purple.400"
                  >
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
                                boxShadow:
                                  "0 4px 12px rgba(196, 181, 253, 0.3)",
                              }
                            : {}
                        }
                        _focus={{ boxShadow: "none" }}
                        transition="all 0.2s"
                      >
                        <HStack justify="space-between">
                          <VStack align="start" gap={1} flex={1}>
                            <HStack>
                              <Text
                                fontWeight="semibold"
                                fontSize="sm"
                                color="white"
                              >
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
                            {upgrade.owned
                              ? "OWNED"
                              : formatNumber(upgrade.cost)}
                          </Text>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>

                {/* Achievements */}
                <Box>
                  <HStack
                    justify="space-between"
                    align="center"
                    mb={showAchievements ? 4 : 2}
                    cursor="pointer"
                    onClick={() => setShowAchievements(!showAchievements)}
                    _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
                    p={2}
                    borderRadius="md"
                    transition="all 0.2s"
                  >
                    <Text fontSize="xl" fontWeight="bold" color="yellow.400">
                      Achievements ({gameState.achievements.length}/
                      {achievements.length})
                    </Text>
                    <Text fontSize="lg" color="yellow.400">
                      {showAchievements ? "▼" : "▶"}
                    </Text>
                  </HStack>

                  {showAchievements && (
                    <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                      {achievements.map((achievement) => {
                        const unlocked = gameState.achievements.includes(
                          achievement.id
                        );
                        return (
                          <Box
                            key={achievement.id}
                            p={2}
                            bg={
                              unlocked
                                ? "rgba(72, 187, 120, 0.1)"
                                : "rgba(74, 85, 104, 0.3)"
                            }
                            borderWidth="1px"
                            borderColor={unlocked ? "green.400" : "gray.600"}
                            borderRadius="md"
                            position="relative"
                            overflow="hidden"
                            title={achievement.description}
                          >
                            <VStack align="start" gap={1}>
                              <HStack gap={1}>
                                <Text fontSize="sm">
                                  {unlocked ? "🏆" : "🔒"}
                                </Text>
                                <Text
                                  fontSize="xs"
                                  fontWeight="semibold"
                                  color="white"
                                  overflow="hidden"
                                  textOverflow="ellipsis"
                                  whiteSpace="nowrap"
                                >
                                  {achievement.name}
                                </Text>
                              </HStack>
                              <Text
                                fontSize="xs"
                                color="gray.400"
                                lineHeight="1.2"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                display="-webkit-box"
                                css={{
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                }}
                              >
                                {achievement.description}
                              </Text>
                            </VStack>
                            {unlocked && (
                              <Box
                                position="absolute"
                                top="0"
                                right="0"
                                bg="green.400"
                                color="white"
                                fontSize="xs"
                                px={1}
                                transform="rotate(45deg) translate(30%, -30%)"
                                w="40px"
                                textAlign="center"
                              >
                                ✓
                              </Box>
                            )}
                          </Box>
                        );
                      })}
                    </Grid>
                  )}

                  {!showAchievements && (
                    <HStack justify="center" gap={2} mt={2}>
                      {[
                        ...Array(Math.min(6, gameState.achievements.length)),
                      ].map((_, i) => (
                        <Text key={i} fontSize="sm">
                          🏆
                        </Text>
                      ))}
                      {gameState.achievements.length > 6 && (
                        <Text fontSize="sm" color="gray.400">
                          +{gameState.achievements.length - 6}
                        </Text>
                      )}
                    </HStack>
                  )}
                </Box>
              </VStack>
            </Box>
          </Grid>
        </VStack>

        {/* Enhanced CSS Animations */}
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
                transform: translate(-50%, -50%) scale(0.8);
              }
              50% {
                opacity: 0.8;
                transform: translate(-50%, -50%) scale(1.2) translateY(-15px);
              }
              100% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.6) translateY(-40px);
              }
            }

            @keyframes shawarmaGlow {
              0%, 100% {
                text-shadow: 0 0 20px rgba(255, 165, 0, 0.5);
              }
              50% {
                text-shadow: 0 0 30px rgba(255, 165, 0, 0.8);
              }
            }

            /* Remove button outlines */
            button:focus {
              outline: none !important;
              box-shadow: none !important;
            }

            button:focus-visible {
              outline: none !important;
              box-shadow: none !important;
            }

            *:focus {
              outline: none !important;
              box-shadow: none !important;
            }
          `}
        </style>
      </Box>

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
    </>
  );
};

export default ShawarmaClicker;
