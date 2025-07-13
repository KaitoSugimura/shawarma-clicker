import { useCallback } from "react";
import { useGame } from "../contexts/GameContext";
import { achievements } from "../data/gameData";
import { MILESTONES } from "../constants/gameConstants";
import type { Notification } from "../components/shared/interfaces";

interface UseClickerLogicProps {
  addNotification: (notification: Notification) => void;
  addClickAnimation: (x: number, y: number, amount: number) => void;
  lastClickTime: number;
  setLastClickTime: (time: number) => void;
  clickMultiplier: number;
}

interface UseClickerLogicResult {
  handleShawarmaClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  handleBuyUpgrade: (upgrade: any) => void;
  handleBuyClickUpgrade: (upgrade: any) => void;
}

const CLICK_THROTTLE_MS = 50;

export function useClickerLogic({
  addNotification,
  addClickAnimation,
  lastClickTime,
  setLastClickTime,
  clickMultiplier,
}: UseClickerLogicProps): UseClickerLogicResult {
  const { state, addClick, buyUpgrade, buyClickUpgrade, dispatch } = useGame();

  const { clicker: gameState, stats: gameStats } = state;

  const handleShawarmaClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      // Throttle rapid clicking to prevent performance issues
      const now = Date.now();
      if (now - lastClickTime < CLICK_THROTTLE_MS) {
        return;
      }
      setLastClickTime(now);

      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      const shawarmasGained = Math.max(
        1,
        (gameState.shawarmasPerClick || 1) * clickMultiplier
      );
      addClick(shawarmasGained);
      addClickAnimation(x, y, shawarmasGained);

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
      lastClickTime,
      gameState.shawarmasPerClick,
      clickMultiplier,
      gameState.shawarmas,
      gameStats.totalClicks,
      gameStats.bestClickRate,
      addClick,
      dispatch,
      addNotification,
      addClickAnimation,
      setLastClickTime,
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
        if (state.upgrades.every((u) => u.owned === 0)) {
          const achievement = achievements.find(
            (a) => a.id === "first-upgrade"
          );
          if (achievement) {
            addNotification({
              id: `achievement-${achievement.id}`,
              message: `🏆 Achievement Unlocked: ${achievement.name}`,
              type: "achievement",
              duration: 5000,
            });
          }
        }
      }
    },
    [gameState.shawarmas, buyUpgrade, addNotification, state.upgrades]
  );

  const handleBuyClickUpgrade = useCallback(
    (upgrade: any) => {
      if (!upgrade.owned && gameState.shawarmas >= upgrade.cost) {
        buyClickUpgrade(upgrade.id, upgrade.cost);

        addNotification({
          id: `click-upgrade-${upgrade.id}-${Date.now()}`,
          message: `Purchased ${upgrade.name}! Your clicks are now ${upgrade.multiplier}x stronger!`,
          type: "upgrade",
          duration: 3000,
        });

        // Achievement check for first click upgrade
        if (state.clickUpgrades.every((u) => !u.owned)) {
          const achievement = achievements.find(
            (a) => a.id === "first-click-upgrade"
          );
          if (achievement) {
            addNotification({
              id: `achievement-${achievement.id}`,
              message: `🏆 Achievement Unlocked: ${achievement.name}`,
              type: "achievement",
              duration: 5000,
            });
          }
        }
      }
    },
    [gameState.shawarmas, buyClickUpgrade, addNotification, state.clickUpgrades]
  );

  return {
    handleShawarmaClick,
    handleBuyUpgrade,
    handleBuyClickUpgrade,
  };
}
