import React, { useState } from "react";
import { Box, VStack, HStack, Button, IconButton } from "@chakra-ui/react";
import { FaRedo, FaSave, FaDownload, FaBars } from "react-icons/fa";
import type {
  GameState,
  Upgrade,
  ClickUpgrade,
  Notification,
  GameStats,
} from "../types/game";

interface GameControlsProps {
  onReset: () => void;
  onSave: () => void;
  onLoad: (
    gameState: GameState,
    upgrades: Upgrade[],
    clickUpgrades: ClickUpgrade[],
    gameStats?: GameStats
  ) => void;
  addNotification: (notification: Notification) => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  onReset,
  onSave,
  onLoad,
  addNotification,
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLoadGame = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const saveData = JSON.parse(e.target?.result as string);

        if (saveData.gameState && saveData.upgrades && saveData.clickUpgrades) {
          onLoad(
            saveData.gameState,
            saveData.upgrades,
            saveData.clickUpgrades,
            saveData.gameStats
          );
          addNotification({
            id: `load-${Date.now()}`,
            title: "Game Loaded!",
            message: "Save file loaded successfully",
            type: "milestone",
            timestamp: Date.now(),
          });
        }
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
    event.target.value = "";
  };

  return (
    <Box position="absolute" top="20px" right="20px" zIndex="1000">
      <Box display={{ base: "none", md: "block" }}>
        <HStack gap={2}>
          <Button
            onClick={onReset}
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
            onClick={onSave}
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
              onChange={handleLoadGame}
              style={{ display: "none" }}
            />
          </Box>
        </HStack>
      </Box>

      <Box display={{ base: "block", md: "none" }}>
        <VStack gap={2} align="end">
          <IconButton
            aria-label="Toggle game actions"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            colorScheme="gray"
            size="sm"
            variant="solid"
            _hover={{
              transform: "translateY(-1px)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
            }}
            _focus={{ boxShadow: "none" }}
            _active={{ transform: "scale(0.95)" }}
            transition="all 0.2s"
          >
            <FaBars />
          </IconButton>

          {showMobileMenu && (
            <VStack
              gap={2}
              align="stretch"
              bg="gray.800"
              borderColor="gray.600"
              borderWidth="1px"
              borderRadius="md"
              p={2}
              minW="120px"
              boxShadow="lg"
            >
              <Button
                onClick={() => {
                  onReset();
                  setShowMobileMenu(false);
                }}
                colorScheme="orange"
                size="sm"
                variant="solid"
                w="full"
                fontSize="xs"
                fontWeight="medium"
                _focus={{ boxShadow: "none" }}
              >
                <FaRedo style={{ marginRight: "4px" }} /> Reset
              </Button>
              <Button
                onClick={() => {
                  onSave();
                  setShowMobileMenu(false);
                }}
                colorScheme="blue"
                size="sm"
                variant="solid"
                w="full"
                fontSize="xs"
                fontWeight="medium"
                _focus={{ boxShadow: "none" }}
              >
                <FaSave style={{ marginRight: "4px" }} /> Save
              </Button>
              <Box as="label" w="full">
                <Button
                  as="span"
                  colorScheme="purple"
                  size="sm"
                  cursor="pointer"
                  variant="solid"
                  w="full"
                  fontSize="xs"
                  fontWeight="medium"
                  _focus={{ boxShadow: "none" }}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <FaDownload style={{ marginRight: "4px" }} /> Load
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    handleLoadGame(e);
                    setShowMobileMenu(false);
                  }}
                  style={{ display: "none" }}
                />
              </Box>
            </VStack>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default GameControls;
