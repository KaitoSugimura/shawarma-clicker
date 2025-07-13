import type { SpecialEvent, GameState } from "../types/game";
import { GoldenShawarma } from "./shared/GoldenShawarma";
import { ActiveEventDisplay } from "./shared/ActiveEventDisplay";
import { useSpecialEvents } from "../hooks/useSpecialEvents";

interface SpecialEventsProps {
  onEventTrigger: (event: SpecialEvent) => void;
  gameState: GameState;
  activeEvents: SpecialEvent[];
}

export function SpecialEvents({
  onEventTrigger,
  gameState,
  activeEvents,
}: SpecialEventsProps) {
  const { goldenShawarma, handleGoldenShawarmaClick } = useSpecialEvents(
    onEventTrigger,
    gameState
  );

  return (
    <>
      <GoldenShawarma
        goldenShawarma={goldenShawarma}
        onGoldenShawarmaClick={handleGoldenShawarmaClick}
      />
      <ActiveEventDisplay activeEvents={activeEvents} />
    </>
  );
}

export default SpecialEvents;
