import { useState } from "react";
import "./App.css";
import ShawarmaClicker from "./components/ShawarmaClicker";
import TradingPanel from "./components/TradingPanel";
import AchievementsPanel from "./components/AchievementsPanel";
import { AuthDropdown } from "./components/AuthDropdown";
import { Toaster } from "./components/ui/toaster";
import { Box, VStack, HStack, Button, Text, Spinner } from "@chakra-ui/react";
import { FaSave } from "react-icons/fa";
import { useGame } from "./contexts/GameContext";
import { formatNumber } from "./utils/gameUtils";

function App() {
  const [activeTab, setActiveTab] = useState<"game" | "trade" | "achievements">(
    "game"
  );
  const { state, user, authLoading, gameLoading, saveGame } = useGame();

  // Show loading screen while Firebase is connecting or game data is loading
  if (authLoading || gameLoading) {
    return (
      <Box
        w="100vw"
        h="100vh"
        position="fixed"
        top="0"
        left="0"
        bg="#1a202c"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap={4}>
          <Spinner size="xl" color="orange.300" />
          <Text color="white" fontSize="lg">
            Loading Shawarma Clicker...
          </Text>
          <Text color="gray.400" fontSize="sm">
            Connecting to Firebase...
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      w="100vw"
      h="100vh"
      position="fixed"
      top="0"
      left="0"
      overflow="hidden"
      bg="#1a202c"
    >
      <VStack h="full" gap={0} overflow="visible">
        <HStack
          w="full"
          p={4}
          bg="rgba(26, 32, 44, 0.95)"
          borderBottom="1px solid"
          borderColor="gray.600"
          justify="space-between"
          align="center"
          gap={4}
          zIndex={100}
          position="relative"
          overflow="visible"
        >
          <HStack gap={3}>
            <Button
              variant={activeTab === "game" ? "solid" : "outline"}
              colorScheme="orange"
              onClick={() => setActiveTab("game")}
              size="md"
              px={6}
            >
              🥙 Shawarma Clicker
            </Button>
            <Button
              variant={activeTab === "trade" ? "solid" : "outline"}
              colorScheme="blue"
              onClick={() => setActiveTab("trade")}
              size="md"
              px={6}
            >
              📈 Food Exchange
            </Button>
            <Button
              variant={activeTab === "achievements" ? "solid" : "outline"}
              colorScheme="yellow"
              onClick={() => setActiveTab("achievements")}
              size="md"
              px={6}
            >
              🏆 Achievements
            </Button>
          </HStack>

          <HStack gap={3}>
            {/* Manual Save Button */}
            <Button
              onClick={saveGame}
              colorScheme="green"
              size="sm"
              variant="outline"
            >
              <FaSave style={{ marginRight: "6px" }} /> Save
            </Button>

            {/* Auth Dropdown */}
            <AuthDropdown user={user} loading={authLoading} />

            <Box>
              <Text color="orange.300" fontSize="lg" fontWeight="bold">
                💰 {formatNumber(state.clicker.shawarmas)} SHW
              </Text>
            </Box>
          </HStack>
        </HStack>

        <Box w="full" flex={1} overflow="hidden">
          {activeTab === "game" ? (
            <ShawarmaClicker />
          ) : activeTab === "trade" ? (
            <TradingPanel />
          ) : (
            <AchievementsPanel />
          )}
        </Box>
      </VStack>

      {/* Toast notifications */}
      <Toaster />
    </Box>
  );
}

export default App;
