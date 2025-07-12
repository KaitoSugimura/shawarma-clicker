import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Grid,
  Badge,
} from "@chakra-ui/react";
import { FaRedo, FaSave, FaDownload } from "react-icons/fa";
import { useLocalStorage } from "../hooks/useLocalStorage";

import NotificationSystem from "./NotificationSystem";
import SpecialEvents from "./SpecialEvents";
import StatsPanel from "./StatsPanel";
import AnimatedBackground from "./AnimatedBackground";
import type { Notification } from "./NotificationSystem";
import type { SpecialEvent } from "./SpecialEvents";
import type { GameStats } from "./StatsPanel";

// Game state interface
interface GameState {
  shawarmas: number;
  shawarmasPerSecond: number;
  shawarmasPerClick: number;
  totalShawarmasEarned: number;
  prestige: number;
  achievements: string[];
}

// Upgrade interface
interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  owned: number;
  baseProduction: number;
  costMultiplier: number;
  maxOwned?: number;
  icon: string;
}

// Achievement interface
interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: (state: GameState, upgrades: Upgrade[]) => boolean;
  reward?: string;
}

const ShawarmaClicker: React.FC = () => {
  // Safe localStorage - load on init, save manually
  const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const saveToStorage = <T,>(key: string, value: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to save ${key}:`, error);
    }
  };

  // Load initial state from localStorage once
  const [gameState, setGameState] = useState<GameState>(() =>
    loadFromStorage("shawarma-game-state", {
      shawarmas: 0,
      shawarmasPerSecond: 0,
      shawarmasPerClick: 1,
      totalShawarmasEarned: 0,
      prestige: 0,
      achievements: [],
    })
  );

  const [upgrades, setUpgrades] = useState<Upgrade[]>(() =>
    loadFromStorage("shawarma-upgrades", [
      {
        id: "cursor",
        name: "Auto Flipper",
        description: "Automatically flips shawarmas for you",
        cost: 15,
        owned: 0,
        baseProduction: 0.1,
        costMultiplier: 1.15,
        icon: "👆",
      },
      {
        id: "kitchen",
        name: "Kitchen Helper",
        description: "A helper to prepare shawarmas faster",
        cost: 100,
        owned: 0,
        baseProduction: 1,
        costMultiplier: 1.15,
        icon: "👨‍🍳",
      },
      {
        id: "grill",
        name: "Professional Grill",
        description: "High-quality grill for perfect shawarmas",
        cost: 1100,
        owned: 0,
        baseProduction: 8,
        costMultiplier: 1.15,
        icon: "🔥",
      },
      {
        id: "restaurant",
        name: "Shawarma Restaurant",
        description: "Your own restaurant serving customers",
        cost: 12000,
        owned: 0,
        baseProduction: 47,
        costMultiplier: 1.15,
        icon: "🏪",
      },
      {
        id: "factory",
        name: "Shawarma Factory",
        description: "Mass production of delicious shawarmas",
        cost: 130000,
        owned: 0,
        baseProduction: 260,
        costMultiplier: 1.15,
        icon: "🏭",
      },
      {
        id: "franchise",
        name: "Shawarma Franchise",
        description: "Expand your business across the world",
        cost: 1400000,
        owned: 0,
        baseProduction: 1400,
        costMultiplier: 1.15,
        icon: "🌍",
      },
    ])
  );

  const [clickUpgrades, setClickUpgrades] = useState(() =>
    loadFromStorage("shawarma-click-upgrades", [
      {
        id: "better_hands",
        name: "Better Hands",
        description: "Double your clicking power",
        cost: 100,
        owned: false,
        multiplier: 2,
      },
      {
        id: "golden_touch",
        name: "Golden Touch",
        description: "Triple your clicking power",
        cost: 1000,
        owned: false,
        multiplier: 3,
      },
      {
        id: "master_chef",
        name: "Master Chef",
        description: "5x clicking power",
        cost: 10000,
        owned: false,
        multiplier: 5,
      },
    ])
  );

  const [gameStats, setGameStats] = useState<GameStats>({
    totalClicks: 0,
    gameStartTime: Date.now(),
    bestClickRate: 0,
    totalUpgradesPurchased: 0,
  });

  const [achievements] = useState<Achievement[]>([
    {
      id: "first_shawarma",
      name: "First Bite",
      description: "Click your first shawarma",
      requirement: (state) => state.totalShawarmasEarned >= 1,
    },
    {
      id: "hundred_shawarmas",
      name: "Shawarma Lover",
      description: "Earn 100 shawarmas",
      requirement: (state) => state.totalShawarmasEarned >= 100,
    },
    {
      id: "thousand_shawarmas",
      name: "Shawarma Addict",
      description: "Earn 1,000 shawarmas",
      requirement: (state) => state.totalShawarmasEarned >= 1000,
    },
    {
      id: "ten_thousand_shawarmas",
      name: "Shawarma Master",
      description: "Earn 10,000 shawarmas",
      requirement: (state) => state.totalShawarmasEarned >= 10000,
    },
    {
      id: "first_upgrade",
      name: "Getting Automated",
      description: "Buy your first upgrade",
      requirement: (_state, upgrades) => upgrades.some((u) => u.owned > 0),
    },
    {
      id: "fast_production",
      name: "Speed Demon",
      description: "Produce 10 shawarmas per second",
      requirement: (state) => state.shawarmasPerSecond >= 10,
    },
    {
      id: "production_master",
      name: "Production Master",
      description: "Produce 100 shawarmas per second",
      requirement: (state) => state.shawarmasPerSecond >= 100,
    },
  ]);

  const [clickAnimations, setClickAnimations] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const [productionAnimations, setProductionAnimations] = useState<
    Array<{ id: number; x: number; y: number; amount: number }>
  >([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [clickMultiplier, setClickMultiplier] = useState(1);

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
      setGameState((prev) => ({
        ...prev,
        shawarmas: prev.shawarmas + prev.shawarmasPerSecond,
        totalShawarmasEarned:
          prev.totalShawarmasEarned + prev.shawarmasPerSecond,
      }));
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
    const milestones = [10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000];
    milestones.forEach((milestone) => {
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

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Click animation cleanup
  useEffect(() => {
    const cleanup = setTimeout(() => {
      setClickAnimations((prev) => prev.slice(-5)); // Keep only last 5 animations
    }, 2000);
    return () => clearTimeout(cleanup);
  }, [clickAnimations]);

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
    setGameState({
      shawarmas: 0,
      shawarmasPerSecond: 0,
      shawarmasPerClick: 1,
      totalShawarmasEarned: 0,
      prestige: 0,
      achievements: [],
    });

    // Reset upgrades to initial state
    setUpgrades([
      {
        id: "cursor",
        name: "Auto Flipper",
        description: "Automatically flips shawarmas for you",
        cost: 15,
        owned: 0,
        baseProduction: 0.1,
        costMultiplier: 1.15,
        icon: "👆",
      },
      {
        id: "kitchen",
        name: "Kitchen Helper",
        description: "A helper to prepare shawarmas faster",
        cost: 100,
        owned: 0,
        baseProduction: 1,
        costMultiplier: 1.15,
        icon: "👨‍🍳",
      },
      {
        id: "grill",
        name: "Professional Grill",
        description: "High-quality grill for perfect shawarmas",
        cost: 1100,
        owned: 0,
        baseProduction: 8,
        costMultiplier: 1.15,
        icon: "🔥",
      },
      {
        id: "restaurant",
        name: "Shawarma Restaurant",
        description: "Your own restaurant serving customers",
        cost: 12000,
        owned: 0,
        baseProduction: 47,
        costMultiplier: 1.15,
        icon: "🏪",
      },
      {
        id: "factory",
        name: "Shawarma Factory",
        description: "Mass production of delicious shawarmas",
        cost: 130000,
        owned: 0,
        baseProduction: 260,
        costMultiplier: 1.15,
        icon: "🏭",
      },
      {
        id: "franchise",
        name: "Shawarma Franchise",
        description: "Expand your business across the world",
        cost: 1400000,
        owned: 0,
        baseProduction: 1400,
        costMultiplier: 1.15,
        icon: "🌍",
      },
    ]);

    setClickUpgrades([
      {
        id: "better_hands",
        name: "Better Hands",
        description: "Double your clicking power",
        cost: 100,
        owned: false,
        multiplier: 2,
      },
      {
        id: "golden_touch",
        name: "Golden Touch",
        description: "Triple your clicking power",
        cost: 1000,
        owned: false,
        multiplier: 3,
      },
      {
        id: "master_chef",
        name: "Master Chef",
        description: "5x clicking power",
        cost: 10000,
        owned: false,
        multiplier: 5,
      },
    ]);

    // Reset stats
    setGameStats({
      totalClicks: 0,
      gameStartTime: Date.now(),
      bestClickRate: 0,
      totalUpgradesPurchased: 0,
    });

    // Clear localStorage to avoid conflicts
    localStorage.removeItem("shawarma-game-state");
    localStorage.removeItem("shawarma-upgrades");
    localStorage.removeItem("shawarma-click-upgrades");
    localStorage.removeItem("shawarma-stats");

    // Clear notifications
    setNotifications([]);
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

  const loadGame = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const saveData = JSON.parse(e.target?.result as string);

        if (saveData.gameState) setGameState(saveData.gameState);
        if (saveData.upgrades) setUpgrades(saveData.upgrades);
        if (saveData.clickUpgrades) setClickUpgrades(saveData.clickUpgrades);

        addNotification({
          id: `load-${Date.now()}`,
          title: "Game Loaded!",
          message: "Save file loaded successfully",
          type: "milestone",
          timestamp: Date.now(),
        });
      } catch (error) {
        addNotification({
          id: `load-error-${Date.now()}`,
          title: "Load Failed!",
          message: "Invalid save file format",
          type: "milestone",
          timestamp: Date.now(),
        });
      }
    };
    reader.readAsText(file);

    // Reset the input
    event.target.value = "";
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return Math.floor(num).toLocaleString();
  };

  const formatPerSecond = (num: number): string => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    if (num >= 1) return num.toFixed(1);
    return num.toFixed(1);
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

        {/* Top-Right Control Buttons */}
        <Box position="absolute" top="20px" right="20px" zIndex="1000">
          <HStack gap={2}>
            <Button
              onClick={resetGame}
              colorScheme="orange"
              size="sm"
              variant="solid"
              px={3}
              py={2}
              borderRadius="md"
              fontSize="xs"
              fontWeight="medium"
              _hover={{
                transform: "translateY(-1px)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              }}
              _focus={{ boxShadow: "none" }}
              _active={{ transform: "scale(0.95)" }}
              transition="all 0.2s"
            >
              <FaRedo style={{ marginRight: "4px" }} /> Reset
            </Button>
            <Button
              onClick={saveGame}
              colorScheme="blue"
              size="sm"
              variant="solid"
              px={3}
              py={2}
              borderRadius="md"
              fontSize="xs"
              fontWeight="medium"
              _hover={{
                transform: "translateY(-1px)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              }}
              _focus={{ boxShadow: "none" }}
              _active={{ transform: "scale(0.95)" }}
              transition="all 0.2s"
            >
              <FaSave style={{ marginRight: "4px" }} /> Save
            </Button>
            <Box as="label">
              <Button
                as="span"
                colorScheme="purple"
                size="sm"
                cursor="pointer"
                variant="solid"
                px={3}
                py={2}
                borderRadius="md"
                fontSize="xs"
                fontWeight="medium"
                _hover={{
                  transform: "translateY(-1px)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                }}
                _focus={{ boxShadow: "none" }}
                _active={{ transform: "scale(0.95)" }}
                transition="all 0.2s"
              >
                <FaDownload style={{ marginRight: "4px" }} /> Load
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={loadGame}
                style={{ display: "none" }}
              />
            </Box>
          </HStack>
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
            p={4}
            bg="rgba(26, 32, 44, 0.95)"
            borderBottomWidth="1px"
            borderBottomColor="gray.700"
            backdropFilter="blur(10px)"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.3)"
          >
            <VStack gap={4}>
              <Text fontSize="4xl" fontWeight="bold" color="orange.400">
                🥙 Shawarma Clicker 🥙
              </Text>
              <HStack gap={8} justify="center" wrap="wrap">
                <VStack gap={1}>
                  <Text fontSize="2xl" fontWeight="bold" color="orange.300">
                    {formatNumber(gameState.shawarmas)}
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    Shawarmas
                  </Text>
                </VStack>
                <VStack gap={1}>
                  <Text fontSize="lg" fontWeight="semibold" color="orange.300">
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
            </VStack>
          </Box>

          {/* Main Game Area */}
          <Grid templateColumns="1fr 400px" flex="1" gap={0} minH="0">
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

              <VStack gap={6} align="center" zIndex="2">
                {/* Animated Background Behind Shawarma */}
                <AnimatedBackground />

                <Text
                  fontSize="2xl"
                  textAlign="center"
                  color="orange.300"
                  fontWeight="semibold"
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
                    w="400px"
                    h="400px"
                    borderRadius="50%"
                    bg="transparent"
                    _hover={{
                      transform: "scale(1.1)",
                      filter: "drop-shadow(0 0 50px rgba(251, 211, 141, 0.8))",
                    }}
                    _active={{
                      transform: "scale(0.9)",
                    }}
                    transition="all 0.15s"
                    userSelect="none"
                  >
                    <Text
                      fontSize="350px"
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
                      fontSize="2xl"
                      fontWeight="bold"
                      color="orange.300"
                      pointerEvents="none"
                      animation="clickFloat 1s ease-out forwards"
                      transform="translate(-50%, -50%)"
                      textShadow="0 2px 4px rgba(0,0,0,0.5)"
                    >
                      +{gameState.shawarmasPerClick * clickMultiplier}
                    </Text>
                  ))}
                </Box>

                <VStack gap={2} align="center">
                  <Text textAlign="center" color="gray.300" fontSize="lg">
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
                    <Box w="full" maxW="400px">
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
              borderLeftWidth="1px"
              borderLeftColor="gray.700"
              h="full"
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
                                <Badge colorScheme="orange" variant="solid">
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
                                <Badge colorScheme="green" variant="solid">
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
                  <Text
                    fontSize="xl"
                    fontWeight="bold"
                    mb={4}
                    color="yellow.400"
                  >
                    Achievements ({gameState.achievements.length}/
                    {achievements.length})
                  </Text>
                  <VStack gap={2}>
                    {achievements.map((achievement) => {
                      const unlocked = gameState.achievements.includes(
                        achievement.id
                      );
                      return (
                        <Box
                          key={achievement.id}
                          p={2}
                          w="full"
                          bg={
                            unlocked
                              ? "rgba(72, 187, 120, 0.1)"
                              : "rgba(74, 85, 104, 0.3)"
                          }
                          borderWidth="1px"
                          borderColor={unlocked ? "green.400" : "gray.600"}
                          borderRadius="lg"
                        >
                          <HStack>
                            <Text fontSize="lg">{unlocked ? "🏆" : "🔒"}</Text>
                            <VStack align="start" gap={0} flex={1}>
                              <Text
                                fontSize="sm"
                                fontWeight="semibold"
                                color="white"
                              >
                                {achievement.name}
                              </Text>
                              <Text fontSize="xs" color="gray.400">
                                {achievement.description}
                              </Text>
                            </VStack>
                          </HStack>
                        </Box>
                      );
                    })}
                  </VStack>
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
                transform: translate(-50%, -50%) translateY(0px) scale(1);
              }
              100% {
                opacity: 0;
                transform: translate(-50%, -50%) translateY(-60px) scale(1.2);
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
