import React, { useState, useEffect } from "react";
import { Box, Text, Button, VStack } from "@chakra-ui/react";
import { SPECIAL_EVENTS } from "../constants/gameConstants";
import type { SpecialEvent, GameState } from "../types/game";

interface SpecialEventsProps {
  onEventTrigger: (event: SpecialEvent) => void;
  gameState: GameState;
  activeEvents: SpecialEvent[];
}

const SpecialEvents: React.FC<SpecialEventsProps> = ({
  onEventTrigger,
  gameState,
  activeEvents,
}) => {
  const [goldenShawarma, setGoldenShawarma] = useState<{
    visible: boolean;
    x: number;
    y: number;
    timeLeft: number;
  } | null>(null);

  useEffect(() => {
    const spawnGoldenShawarma = () => {
      if (goldenShawarma?.visible) return;

      setGoldenShawarma({
        visible: true,
        x: Math.random() * 80 + 10,
        y: Math.random() * 60 + 20,
        timeLeft: SPECIAL_EVENTS.GOLDEN_SHAWARMA.DURATION,
      });
    };

    const interval = setInterval(() => {
      if (Math.random() < 0.1) {
        spawnGoldenShawarma();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [goldenShawarma]);

  useEffect(() => {
    if (!goldenShawarma?.visible) return;

    const interval = setInterval(() => {
      setGoldenShawarma((prev) => {
        if (!prev) return null;
        const newTimeLeft = prev.timeLeft - 100;

        if (newTimeLeft <= 0) {
          return null;
        }

        return { ...prev, timeLeft: newTimeLeft };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [goldenShawarma?.visible]);

  useEffect(() => {
    const triggerRandomEvent = () => {
      const events: Omit<SpecialEvent, "id" | "startTime">[] = [
        {
          name: "Click Frenzy",
          type: "frenzy",
          duration: SPECIAL_EVENTS.CLICK_FRENZY.DURATION,
          multiplier: SPECIAL_EVENTS.CLICK_FRENZY.MULTIPLIER,
          message: "Click Frenzy! 7x clicking power for 77 seconds!",
        },
        {
          name: "Lucky Bonus",
          type: "lucky_bonus",
          duration: SPECIAL_EVENTS.LUCKY_BONUS.DURATION,
          multiplier: SPECIAL_EVENTS.LUCKY_BONUS.MULTIPLIER,
          message: `Lucky! Gained ${Math.floor(
            gameState.shawarmas * SPECIAL_EVENTS.LUCKY_BONUS.BONUS_PERCENTAGE
          )} shawarmas!`,
        },
      ];

      const event = events[Math.floor(Math.random() * events.length)];
      const fullEvent: SpecialEvent = {
        ...event,
        id: `event-${Date.now()}`,
        startTime: Date.now(),
      };

      onEventTrigger(fullEvent);
    };

    const interval = setInterval(() => {
      if (Math.random() < 0.05) {
        triggerRandomEvent();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [gameState.shawarmas, onEventTrigger]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Cleanup is now handled by the parent component
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleGoldenShawarmaClick = () => {
    if (!goldenShawarma?.visible) return;

    const bonus = Math.floor(
      gameState.shawarmas * (0.1 + Math.random() * 0.15)
    );
    const goldenEvent: SpecialEvent = {
      id: `golden-${Date.now()}`,
      name: "Golden Shawarma",
      type: "lucky_bonus",
      duration: 1000,
      multiplier: 1,
      message: `Golden Shawarma! Gained ${bonus} shawarmas!`,
      startTime: Date.now(),
    };

    onEventTrigger(goldenEvent);
    setGoldenShawarma(null);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return seconds > 60
      ? `${Math.floor(seconds / 60)}:${(seconds % 60)
          .toString()
          .padStart(2, "0")}`
      : `${seconds}s`;
  };

  return (
    <>
      {activeEvents.length > 0 && (
        <Box position="fixed" top="100px" left="20px" zIndex={999} w="280px">
          <VStack gap={3} align="stretch">
            {activeEvents.map((event) => (
              <Box
                key={event.id}
                p={4}
                bg={
                  event.type === "frenzy"
                    ? "linear-gradient(135deg, rgba(251, 211, 141, 0.15), rgba(237, 137, 54, 0.15))"
                    : "linear-gradient(135deg, rgba(255, 165, 0, 0.15), rgba(255, 140, 0, 0.15))"
                }
                borderWidth={event.type === "frenzy" ? "2px" : "0px"}
                borderColor={
                  event.type === "frenzy" ? "orange.400" : "transparent"
                }
                borderRadius="xl"
                boxShadow={
                  event.type === "frenzy"
                    ? "0 8px 32px rgba(251, 211, 141, 0.3)"
                    : "0 8px 32px rgba(255, 165, 0, 0.3)"
                }
                backdropFilter="blur(10px)"
                animation={
                  event.type === "frenzy"
                    ? "frenzyPulse 1.5s ease-in-out infinite"
                    : "luckyGlow 2s ease-in-out infinite"
                }
              >
                <VStack gap={2}>
                  <Text
                    fontSize="md"
                    fontWeight="bold"
                    color={
                      event.type === "frenzy" ? "orange.300" : "orange.200"
                    }
                    textAlign="center"
                    textShadow="0 2px 4px rgba(0, 0, 0, 0.8)"
                  >
                    {event.type === "frenzy"
                      ? "🔥 CLICK FRENZY!"
                      : "🥙 LUCKY BONUS!"}
                  </Text>
                  <Text
                    fontSize="sm"
                    color="gray.300"
                    textAlign="center"
                    fontWeight="medium"
                    bg="rgba(0, 0, 0, 0.4)"
                    px={2}
                    py={1}
                    borderRadius="md"
                  >
                    {formatTime(
                      event.duration - (Date.now() - event.startTime)
                    )}{" "}
                    remaining
                  </Text>
                  {event.type === "frenzy" && (
                    <Text
                      fontSize="sm"
                      color="orange.200"
                      fontWeight="semibold"
                      textAlign="center"
                    >
                      {event.multiplier}x clicking power
                    </Text>
                  )}
                </VStack>
              </Box>
            ))}
          </VStack>
        </Box>
      )}

      {goldenShawarma?.visible && (
        <Button
          position="fixed"
          left={`${goldenShawarma.x}%`}
          top={`${goldenShawarma.y}%`}
          zIndex={998}
          variant="ghost"
          size="xl"
          onClick={handleGoldenShawarmaClick}
          animation="goldenPulse 1s ease-in-out infinite"
          transform="translate(-50%, -50%)"
          minW="120px"
          minH="120px"
          borderRadius="full"
          _hover={{
            transform: "translate(-50%, -50%) scale(1.1)",
          }}
          _focus={{ boxShadow: "none" }}
          transition="all 0.2s"
          bg="transparent"
          border="none"
          boxShadow="none"
        >
          <VStack gap={1}>
            <Text
              fontSize="6xl"
              textShadow="0 0 20px rgba(255, 215, 0, 0.8)"
              filter="drop-shadow(0 0 15px rgba(255, 215, 0, 0.6))"
            >
              🥙
            </Text>
            <Text
              fontSize="xs"
              color="yellow.200"
              fontWeight="bold"
              textShadow="0 0 5px rgba(0, 0, 0, 0.8)"
              bg="rgba(0, 0, 0, 0.7)"
              px={2}
              py={1}
              borderRadius="md"
            >
              {formatTime(goldenShawarma.timeLeft)}
            </Text>
          </VStack>
        </Button>
      )}

      <style>
        {`
          @keyframes goldenPulse {
            0%, 100% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
              filter: drop-shadow(0 0 20px rgba(255, 165, 0, 0.8));
            }
            50% {
              transform: translate(-50%, -50%) scale(1.1);
              opacity: 0.95;
              filter: drop-shadow(0 0 30px rgba(255, 165, 0, 1)) drop-shadow(0 0 40px rgba(255, 215, 0, 0.6));
            }
          }

          @keyframes frenzyPulse {
            0%, 100% {
              transform: scale(1);
              filter: drop-shadow(0 0 8px rgba(251, 211, 141, 0.4));
            }
            50% {
              transform: scale(1.02);
              filter: drop-shadow(0 0 16px rgba(251, 211, 141, 0.6));
            }
          }

          @keyframes luckyGlow {
            0%, 100% {
              transform: scale(1);
              filter: drop-shadow(0 0 8px rgba(255, 165, 0, 0.4));
            }
            50% {
              transform: scale(1.01);
              filter: drop-shadow(0 0 12px rgba(255, 165, 0, 0.6));
            }
          }
        `}
      </style>
    </>
  );
};

export default SpecialEvents;
