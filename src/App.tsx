import { useState } from "react";
import "./App.css";
import ShawarmaClicker from "./components/ShawarmaClicker";
import TradingPanel from "./components/TradingPanel";
import { Box, VStack, HStack, Button, Text } from "@chakra-ui/react";
import { FaRedo, FaSave, FaDownload } from "react-icons/fa";
import { useGame } from "./contexts/GameContext";
import { formatNumber } from "./utils/gameUtils";

function App() {
  const [activeTab, setActiveTab] = useState<"game" | "trade">("game");
  const { state, saveGame, loadGame, resetGame } = useGame();

  const handleLoadGame = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await loadGame(file);
      alert("Game loaded successfully!");
    } catch (error) {
      console.error("Error loading save file:", error);
      alert("Error loading save file!");
    }

    event.target.value = "";
  };

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
      <VStack h="full" gap={0}>
        <HStack
          w="full"
          p={4}
          bg="rgba(26, 32, 44, 0.95)"
          borderBottom="1px solid"
          borderColor="gray.600"
          justify="space-between"
          align="center"
          gap={4}
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
          </HStack>

          <HStack gap={3}>
            {/* Game controls - always visible */}
            <Button
              onClick={resetGame}
              colorScheme="red"
              size="sm"
              variant="outline"
            >
              <FaRedo style={{ marginRight: "6px" }} /> Reset
            </Button>
            <Button
              onClick={saveGame}
              colorScheme="green"
              size="sm"
              variant="outline"
            >
              <FaSave style={{ marginRight: "6px" }} /> Save
            </Button>
            <Box as="label">
              <Button
                as="span"
                colorScheme="purple"
                size="sm"
                variant="outline"
                cursor="pointer"
              >
                <FaDownload style={{ marginRight: "6px" }} /> Load
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={handleLoadGame}
                style={{ display: "none" }}
              />
            </Box>
            <Box>
              <Text color="orange.300" fontSize="lg" fontWeight="bold">
                💰 {formatNumber(state.clicker.shawarmas)} SHW
              </Text>
            </Box>
          </HStack>
        </HStack>

        <Box w="full" flex={1} overflow="hidden">
          {activeTab === "game" ? <ShawarmaClicker /> : <TradingPanel />}
        </Box>
      </VStack>
    </Box>
  );
}

export default App;
