import React, { useState, useEffect } from "react";
import { Box, Text, Button, VStack } from "@chakra-ui/react";

interface SpecialEvent {
  id: string;
  type: "golden_shawarma" | "frenzy" | "lucky_bonus";
  duration: number;
  multiplier: number;
  message: string;
  startTime: number;
}

interface SpecialEventsProps {
  onEventTrigger: (event: SpecialEvent) => void;
  currentShawarmas: number;
}

const SpecialEvents: React.FC<SpecialEventsProps> = ({
  onEventTrigger,
  currentShawarmas,
}) => {
  const [activeEvents, setActiveEvents] = useState<SpecialEvent[]>([]);
  const [goldenShawarma, setGoldenShawarma] = useState<{
    visible: boolean;
    x: number;
    y: number;
    timeLeft: number;
  } | null>(null);

  // Spawn golden shawarma randomly
  useEffect(() => {
    const spawnGoldenShawarma = () => {
      if (goldenShawarma?.visible) return;

      setGoldenShawarma({
        visible: true,
        x: Math.random() * 80 + 10, // 10% to 90% of screen width
        y: Math.random() * 60 + 20, // 20% to 80% of screen height
        timeLeft: 13000, // 13 seconds
      });
    };

    // Random chance every 30-120 seconds
    const interval = setInterval(() => {
      if (Math.random() < 0.1) {
        // 10% chance every check
        spawnGoldenShawarma();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [goldenShawarma]);

  // Golden shawarma countdown
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

  // Random events
  useEffect(() => {
    const triggerRandomEvent = () => {
      const events: Omit<SpecialEvent, "id" | "startTime">[] = [
        {
          type: "frenzy",
          duration: 77000, // 77 seconds (Cookie Clicker reference)
          multiplier: 7,
          message: "Click Frenzy! 7x clicking power for 77 seconds!",
        },
        {
          type: "lucky_bonus",
          duration: 1000,
          multiplier: 1,
          message: `Lucky! Gained ${Math.floor(
            currentShawarmas * 0.15
          )} shawarmas!`,
        },
      ];

      const event = events[Math.floor(Math.random() * events.length)];
      const fullEvent: SpecialEvent = {
        ...event,
        id: `event-${Date.now()}`,
        startTime: Date.now(),
      };

      setActiveEvents((prev) => [...prev, fullEvent]);
      onEventTrigger(fullEvent);
    };

    // Random events every 2-5 minutes
    const interval = setInterval(() => {
      if (Math.random() < 0.05) {
        // 5% chance every check
        triggerRandomEvent();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [currentShawarmas, onEventTrigger]);

  // Clean up expired events
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveEvents((prev) =>
        prev.filter((event) => Date.now() - event.startTime < event.duration)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleGoldenShawarmaClick = () => {
    if (!goldenShawarma?.visible) return;

    // Golden shawarma gives 10-25% of current shawarmas + base click value
    const bonus = Math.floor(currentShawarmas * (0.1 + Math.random() * 0.15));
    const goldenEvent: SpecialEvent = {
      id: `golden-${Date.now()}`,
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
      {/* Active Events Display */}
      {activeEvents.length > 0 && (
        <Box position="fixed" top="100px" left="20px" zIndex={999} w="250px">
          <VStack gap={2} align="stretch">
            {activeEvents.map((event) => (
              <Box
                key={event.id}
                p={3}
                bg="purple.100"
                borderWidth="2px"
                borderColor="purple.300"
                borderRadius="lg"
                boxShadow="lg"
              >
                <VStack gap={1}>
                  <Text fontSize="sm" fontWeight="bold" color="purple.700">
                    {event.type === "frenzy"
                      ? "🔥 CLICK FRENZY!"
                      : "✨ LUCKY BONUS!"}
                  </Text>
                  <Text fontSize="xs" color="purple.600" textAlign="center">
                    {formatTime(
                      event.duration - (Date.now() - event.startTime)
                    )}{" "}
                    remaining
                  </Text>
                  {event.type === "frenzy" && (
                    <Text fontSize="xs" color="purple.500">
                      {event.multiplier}x clicking power
                    </Text>
                  )}
                </VStack>
              </Box>
            ))}
          </VStack>
        </Box>
      )}

      {/* Golden Shawarma */}
      {goldenShawarma?.visible && (
        <Button
          position="fixed"
          left={`${goldenShawarma.x}%`}
          top={`${goldenShawarma.y}%`}
          zIndex={998}
          variant="ghost"
          size="lg"
          onClick={handleGoldenShawarmaClick}
          animation="goldenPulse 1s ease-in-out infinite"
          transform="translate(-50%, -50%)"
        >
          <VStack gap={1}>
            <Text fontSize="3xl">🥇</Text>
            <Text fontSize="xs" color="yellow.600" fontWeight="bold">
              {formatTime(goldenShawarma.timeLeft)}
            </Text>
          </VStack>
        </Button>
      )}

      {/* CSS Animations */}
      <style>
        {`
          @keyframes goldenPulse {
            0%, 100% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
            50% {
              transform: translate(-50%, -50%) scale(1.1);
              opacity: 0.8;
            }
          }
        `}
      </style>
    </>
  );
};

export default SpecialEvents;
export type { SpecialEvent };
