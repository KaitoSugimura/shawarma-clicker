import React, { useState, useEffect, useCallback } from "react";
import { Box, VStack, HStack, Text, Grid, Badge } from "@chakra-ui/react";

import NotificationSystem from "./NotificationSystem";
import SpecialEvents from "./SpecialEvents";
import StatsPanel from "./StatsPanel";
import AnimatedBackground from "./AnimatedBackground";
import GameControls from "./GameControls";
import type {
  GameState,
  Upgrade,
  Notification,
  SpecialEvent,
  GameStats,
} from "../types/game";
import {
  initialGameState,
  initialUpgrades,
  initialClickUpgrades,
  achievements,
} from "../data/gameData";
import {
  formatNumber,
  formatShawarmaCount,
  formatPerSecond,
  loadFromStorage,
} from "../utils/gameUtils";
import {
  MILESTONES,
  ANIMATION_CLEANUP_DELAY,
  MAX_CLICK_ANIMATIONS,
  MAX_PRODUCTION_ANIMATIONS,
} from "../constants/gameConstants";

const ShawarmaClicker: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() =>
    loadFromStorage("shawarma-game-state", initialGameState)
  );

  const [upgrades, setUpgrades] = useState<Upgrade[]>(() =>
    loadFromStorage("shawarma-upgrades", initialUpgrades)
  );

  const [clickUpgrades, setClickUpgrades] = useState(() =>
    loadFromStorage("shawarma-click-upgrades", initialClickUpgrades)
  );

  const [gameStats, setGameStats] = useState<GameStats>({
    totalClicks: 0,
    gameStartTime: Date.now(),
    bestClickRate: 0,
    totalUpgradesPurchased: 0,
  });

  const [clickAnimations, setClickAnimations] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const [productionAnimations, setProductionAnimations] = useState<
    Array<{ id: number; x: number; y: number; amount: number }>
  >([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [clickMultiplier, setClickMultiplier] = useState(1);
  const [showAchievements, setShowAchievements] = useState(true);

  // Auto-save game progress - Commented out to prevent conflicts
  // useAutoSave('shawarma-game-state', gameState);
  // useAutoSave('shawarma-upgrades', upgrades);
  // useAutoSave('shawarma-click-upgrades', clickUpgrades);
  // useAutoSave('shawarma-stats', gameStats);

  // Handle special events
  const handleSpecialEvent = useCallback(
    (event: SpecialEvent) => {
      if (event.type === "frenzy") {
        setClickMultiplier(event.multiplier);
        setTimeout(() => {
          setClickMultiplier(1);
        }, event.duration);
      } else if (event.type === "lucky_bonus") {
        const bonus = Math.floor(gameState.shawarmas * 0.15);
        setGameState((prev) => ({
          ...prev,
          shawarmas: prev.shawarmas + bonus,
          totalShawarmasEarned: prev.totalShawarmasEarned + bonus,
        }));
      }

      // Show notification
      addNotification({
        id: `special-event-${Date.now()}`,
        title: "Special Event!",
        message: event.message,
        type: "milestone",
        timestamp: Date.now(),
      });
    },
    [gameState.shawarmas]
  );

  // Calculate shawarmas per second
  useEffect(() => {
    const sps = upgrades.reduce((total, upgrade) => {
      return total + upgrade.baseProduction * upgrade.owned;
    }, 0);
    setGameState((prev) => ({ ...prev, shawarmasPerSecond: sps }));
  }, [upgrades]);

  // Auto-clicker effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState((prev) => {
        if (prev.shawarmasPerSecond > 0) {
          // Add production animation
          const animationId = Date.now();
          const randomX = 150 + Math.random() * 100; // Random position around the shawarma
          const randomY = 150 + Math.random() * 100;

          setProductionAnimations((prevAnims) => [
            ...prevAnims,
            {
              id: animationId,
              x: randomX,
              y: randomY,
              amount: prev.shawarmasPerSecond,
            },
          ]);
        }

        return {
          ...prev,
          shawarmas: prev.shawarmas + prev.shawarmasPerSecond,
          totalShawarmasEarned:
            prev.totalShawarmasEarned + prev.shawarmasPerSecond,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.shawarmasPerSecond]);

  // Check achievements and show notifications
  useEffect(() => {
    achievements.forEach((achievement) => {
      if (
        !gameState.achievements.includes(achievement.id) &&
        achievement.requirement(gameState, upgrades)
      ) {
        setGameState((prev) => ({
          ...prev,
          achievements: [...prev.achievements, achievement.id],
        }));

        // Add achievement notification
        const notification: Notification = {
          id: `achievement-${achievement.id}-${Date.now()}`,
          title: "Achievement Unlocked!",
          message: achievement.name,
          type: "achievement",
          timestamp: Date.now(),
        };
        setNotifications((prev) => [...prev, notification]);
      }
    });
  }, [gameState, upgrades, achievements]);

  // Show milestone notifications
  useEffect(() => {
    MILESTONES.forEach((milestone) => {
      if (
        gameState.totalShawarmasEarned >= milestone &&
        gameState.totalShawarmasEarned - gameState.shawarmasPerSecond <
          milestone
      ) {
        const notification: Notification = {
          id: `milestone-${milestone}-${Date.now()}`,
          title: "Milestone Reached!",
          message: `${formatNumber(milestone)} shawarmas earned!`,
          type: "milestone",
          timestamp: Date.now(),
        };
        setNotifications((prev) => [...prev, notification]);
      }
    });
  }, [gameState.totalShawarmasEarned, gameState.shawarmasPerSecond]);

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [...prev, notification]);
  };

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Click animation cleanup
  useEffect(() => {
    const cleanup = setTimeout(() => {
      setClickAnimations((prev) => prev.slice(-MAX_CLICK_ANIMATIONS));
    }, ANIMATION_CLEANUP_DELAY);
    return () => clearTimeout(cleanup);
  }, [clickAnimations]);

  // Production animation cleanup
  useEffect(() => {
    const cleanup = setTimeout(() => {
      setProductionAnimations((prev) => prev.slice(-MAX_PRODUCTION_ANIMATIONS));
    }, ANIMATION_CLEANUP_DELAY);
    return () => clearTimeout(cleanup);
  }, [productionAnimations]);

  const handleShawarmaClick = useCallback(
    (event: React.MouseEvent) => {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      setClickAnimations((prev) => [...prev, { id: Date.now(), x, y }]);

      const clickValue = gameState.shawarmasPerClick * clickMultiplier;

      setGameState((prev) => ({
        ...prev,
        shawarmas: prev.shawarmas + clickValue,
        totalShawarmasEarned: prev.totalShawarmasEarned + clickValue,
      }));

      // Update stats
      setGameStats((prev) => ({
        ...prev,
        totalClicks: prev.totalClicks + 1,
      }));
    },
    [gameState.shawarmasPerClick, clickMultiplier]
  );

  const buyUpgrade = (upgradeId: string) => {
    const upgrade = upgrades.find((u) => u.id === upgradeId);
    if (!upgrade || gameState.shawarmas < upgrade.cost) return;

    setGameState((prev) => ({
      ...prev,
      shawarmas: prev.shawarmas - upgrade.cost,
    }));

    setUpgrades((prev) =>
      prev.map((u) =>
        u.id === upgradeId
          ? {
              ...u,
              owned: u.owned + 1,
              cost: Math.floor(u.cost * u.costMultiplier),
            }
          : u
      )
    );

    // Update stats
    setGameStats((prev) => ({
      ...prev,
      totalUpgradesPurchased: prev.totalUpgradesPurchased + 1,
    }));

    // Show upgrade notification
    addNotification({
      id: `upgrade-${upgradeId}-${Date.now()}`,
      title: "Upgrade Purchased!",
      message: `${upgrade.name} (${upgrade.owned + 1})`,
      type: "upgrade",
      timestamp: Date.now(),
    });
  };

  const buyClickUpgrade = (upgradeId: string) => {
    const upgrade = clickUpgrades.find((u) => u.id === upgradeId);
    if (!upgrade || upgrade.owned || gameState.shawarmas < upgrade.cost) return;

    setGameState((prev) => ({
      ...prev,
      shawarmas: prev.shawarmas - upgrade.cost,
      shawarmasPerClick: prev.shawarmasPerClick * upgrade.multiplier,
    }));

    setClickUpgrades((prev) =>
      prev.map((u) => (u.id === upgradeId ? { ...u, owned: true } : u))
    );

    // Show upgrade notification
    addNotification({
      id: `click-upgrade-${upgradeId}-${Date.now()}`,
      title: "Click Upgrade Purchased!",
      message: `${upgrade.name} - ${upgrade.multiplier}x clicking power!`,
      type: "upgrade",
      timestamp: Date.now(),
    });
  };

  const resetGame = () => {
    setGameState(initialGameState);
    setUpgrades(initialUpgrades);
    setClickUpgrades(initialClickUpgrades);
    setGameStats({
      totalClicks: 0,
      gameStartTime: Date.now(),
      bestClickRate: 0,
      totalUpgradesPurchased: 0,
    });
    setNotifications([]);

    localStorage.removeItem("shawarma-game-state");
    localStorage.removeItem("shawarma-upgrades");
    localStorage.removeItem("shawarma-click-upgrades");
    localStorage.removeItem("shawarma-stats");
  };

  const saveGame = () => {
    const saveData = {
      gameState,
      upgrades,
      clickUpgrades,
      timestamp: Date.now(),
    };

    const dataStr = JSON.stringify(saveData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `shawarma-save-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();

    URL.revokeObjectURL(url);

    addNotification({
      id: `save-${Date.now()}`,
      title: "Game Saved!",
      message: "Save file downloaded successfully",
      type: "milestone",
      timestamp: Date.now(),
    });
  };

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

        <GameControls
          onReset={resetGame}
          onSave={saveGame}
          onLoad={(newGameState, newUpgrades, newClickUpgrades) => {
            setGameState(newGameState);
            setUpgrades(newUpgrades);
            setClickUpgrades(newClickUpgrades);
          }}
          addNotification={addNotification}
        />

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
                      xl: "380px",
                    }}
                    h={{
                      base: "140px",
                      sm: "180px",
                      md: "240px",
                      lg: "320px",
                      xl: "380px",
                    }}
                    borderRadius="50%"
                    bg="transparent"
                    _hover={{
                      transform: "scale(1.05)",
                      filter: "drop-shadow(0 0 50px rgba(251, 211, 141, 0.8))",
                    }}
                    _active={{
                      transform: "scale(0.9)",
                    }}
                    transition="all 0.15s"
                    userSelect="none"
                  >
                    <Text
                      fontSize={{
                        base: "110px",
                        sm: "140px",
                        md: "190px",
                        lg: "250px",
                        xl: "320px",
                      }}
                      animation="shawarmaGlow 3s ease-in-out infinite"
                      lineHeight="1"
                    >
                      🥙
                    </Text>
                  </Box>

                  {/* Click animations */}
                  {clickAnimations.map((anim) => (
                    <Text
                      key={anim.id}
                      position="absolute"
                      left={`${anim.x}px`}
                      top={`${anim.y}px`}
                      fontSize={{ base: "2xl", md: "4xl" }}
                      fontWeight="bold"
                      color="orange.300"
                      pointerEvents="none"
                      animation="clickFloat 1s ease-out forwards"
                      transform="translate(-50%, -50%)"
                      textShadow="0 3px 6px rgba(0,0,0,0.7)"
                    >
                      +{gameState.shawarmasPerClick * clickMultiplier}
                    </Text>
                  ))}

                  {/* Production animations */}
                  {productionAnimations.map((anim) => (
                    <Text
                      key={anim.id}
                      position="absolute"
                      left={`${anim.x}px`}
                      top={`${anim.y}px`}
                      fontSize={{ base: "xl", md: "3xl" }}
                      fontWeight="bold"
                      color="cyan.300"
                      pointerEvents="none"
                      animation="productionFloat 2s ease-out forwards"
                      transform="translate(-50%, -50%)"
                      textShadow="0 3px 6px rgba(0,0,0,0.7)"
                    >
                      +{formatPerSecond(anim.amount)} 🥙
                    </Text>
                  ))}
                </Box>

                {/* Per-click text and progress bar - only show on medium+ screens */}
                <VStack
                  gap={{ base: 4, md: 6 }}
                  align="center"
                  display={{ base: "none", md: "flex" }}
                >
                  <Text
                    textAlign="center"
                    color="gray.300"
                    fontSize={{ base: "md", md: "lg" }}
                    px={4}
                  >
                    +{gameState.shawarmasPerClick * clickMultiplier} per click
                    {clickMultiplier > 1 && (
                      <Text
                        as="span"
                        color="purple.400"
                        fontWeight="bold"
                        ml={2}
                      >
                        (🔥 {clickMultiplier}x FRENZY!)
                      </Text>
                    )}
                  </Text>

                  {/* Production Progress Bar */}
                  {gameState.shawarmasPerSecond > 0 && (
                    <Box
                      w="full"
                      maxW={{ base: "90%", sm: "350px", md: "400px" }}
                    >
                      <Text
                        fontSize="sm"
                        mb={2}
                        textAlign="center"
                        color="gray.400"
                      >
                        Auto-production active
                      </Text>
                      <Box
                        w="full"
                        h="6"
                        bg="rgba(74, 85, 104, 0.6)"
                        borderRadius="full"
                        overflow="hidden"
                        border="1px solid"
                        borderColor="gray.600"
                      >
                        <Box
                          h="full"
                          bg="linear-gradient(90deg, orange.400, orange.300, orange.400)"
                          borderRadius="full"
                          animation="progressBar 1s ease-in-out infinite"
                          boxShadow="0 0 10px rgba(251, 211, 141, 0.4)"
                        />
                      </Box>
                    </Box>
                  )}
                </VStack>
              </VStack>
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
                        onClick={() => buyUpgrade(upgrade.id)}
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
                        onClick={() => buyClickUpgrade(upgrade.id)}
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

                {/* Stats Panel */}
                <StatsPanel
                  stats={gameStats}
                  shawarmasPerSecond={gameState.shawarmasPerSecond}
                  totalEarned={gameState.totalShawarmasEarned}
                  achievements={gameState.achievements}
                />
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
        onEventTrigger={handleSpecialEvent}
        currentShawarmas={gameState.shawarmas}
      />
    </>
  );
};

export default ShawarmaClicker;
