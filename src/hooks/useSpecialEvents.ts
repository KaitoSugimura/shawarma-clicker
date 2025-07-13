import { useState, useEffect, useCallback } from "react";
import { SPECIAL_EVENTS } from "../constants/gameConstants";
import { useGame } from "../contexts/GameContext";
import type { SpecialEvent, GameState } from "../types/game";

interface GoldenShawarmaState {
  visible: boolean;
  x: number;
  y: number;
  timeLeft: number;
}

interface UseSpecialEventsResult {
  goldenShawarma: GoldenShawarmaState | null;
  handleGoldenShawarmaClick: () => void;
}

export function useSpecialEvents(
  onEventTrigger: (event: SpecialEvent) => void,
  gameState: GameState
): UseSpecialEventsResult {
  const { updateShawarmas } = useGame();
  const [goldenShawarma, setGoldenShawarma] =
    useState<GoldenShawarmaState | null>(null);

  // Golden Shawarma spawning logic
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

  // Golden Shawarma countdown timer
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
  }, [goldenShawarma]);

  // Random events spawning
  useEffect(() => {
    const triggerRandomEvent = () => {
      const events: Omit<SpecialEvent, "id" | "startTime">[] = [
        {
          name: "Shawarma Frenzy!",
          type: "frenzy",
          duration: 10000,
          multiplier: 3,
          message: "Triple clicking power for 10 seconds!",
        },
        {
          name: "Lucky Bonus!",
          type: "lucky_bonus",
          duration: 15000,
          multiplier: 2,
          message: "Double production for 15 seconds!",
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
      if (Math.random() < 0.05 && gameState.totalShawarmasEarned > 100) {
        triggerRandomEvent();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [onEventTrigger, gameState.totalShawarmasEarned]);

  // Handle golden shawarma click
  const handleGoldenShawarmaClick = useCallback(() => {
    if (!goldenShawarma?.visible) return;

    setGoldenShawarma(null);
    const bonus = Math.floor(
      gameState.shawarmasPerSecond * 30 + gameState.shawarmasPerClick * 100
    );

    // Actually add the bonus shawarmas to the player's balance
    updateShawarmas(gameState.shawarmas + bonus);

    const goldenEvent: SpecialEvent = {
      id: `golden-${Date.now()}`,
      name: "Golden Shawarma!",
      type: "golden_shawarma",
      duration: 0,
      multiplier: 1,
      message: `You found a golden shawarma! +${bonus.toLocaleString()} shawarmas!`,
      startTime: Date.now(),
    };

    onEventTrigger(goldenEvent);
  }, [goldenShawarma, gameState, onEventTrigger, updateShawarmas]);

  return {
    goldenShawarma,
    handleGoldenShawarmaClick,
  };
}
