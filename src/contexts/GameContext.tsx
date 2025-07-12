import React, { createContext, useContext, useReducer, useEffect } from "react";
import type { ReactNode } from "react";
import type {
  GameState,
  Upgrade,
  ClickUpgrade,
  GameStats,
} from "../types/game";
import type { TradingState } from "../types/trading";
import { initialGameState } from "../data/gameData";
import { loadFromStorage } from "../utils/gameUtils";
import { FOOD_ITEMS } from "../data/tradingData";

// Combined game state that includes both clicker and trading
interface CombinedGameState {
  // Clicker game state
  clicker: GameState;
  upgrades: Upgrade[];
  clickUpgrades: ClickUpgrade[];
  stats: GameStats;

  // Trading state
  trading: TradingState;

  // Meta game state
  version: string;
  lastSaved: number;
}

// Actions for the game state
type GameAction =
  | { type: "UPDATE_SHAWARMAS"; payload: number }
  | { type: "UPDATE_SPS"; payload: number }
  | { type: "UPDATE_SPC"; payload: number }
  | { type: "ADD_CLICK"; payload: number }
  | { type: "BUY_UPGRADE"; payload: { upgradeId: string; cost: number } }
  | { type: "BUY_CLICK_UPGRADE"; payload: { upgradeId: string; cost: number } }
  | { type: "UPDATE_TRADING_STATE"; payload: Partial<TradingState> }
  | {
      type: "EXECUTE_TRADE";
      payload: {
        type: "buy" | "sell";
        foodId: string;
        amount: number;
        price: number;
        cost: number;
      };
    }
  | { type: "UPDATE_PRICES"; payload: { [key: string]: number } }
  | { type: "SELECT_FOOD"; payload: string }
  | { type: "RESET_GAME" }
  | { type: "LOAD_GAME"; payload: CombinedGameState }
  | { type: "UPDATE_STATS"; payload: Partial<GameStats> };

// Initial combined state
const getInitialCombinedState = (): CombinedGameState => {
  const clickerState = loadFromStorage("shawarma-game-state", initialGameState);
  const upgrades = JSON.parse(
    localStorage.getItem("shawarma-upgrades") || "[]"
  );
  const clickUpgrades = JSON.parse(
    localStorage.getItem("shawarma-click-upgrades") || "[]"
  );
  const stats = JSON.parse(localStorage.getItem("shawarma-stats") || "{}");

  // Load trading state
  const savedTrading = localStorage.getItem("shawarma-trading");
  let tradingState: TradingState;

  if (savedTrading) {
    try {
      const parsed = JSON.parse(savedTrading);
      // Ensure portfolioAverageCosts exists for backward compatibility
      if (!parsed.portfolioAverageCosts) {
        parsed.portfolioAverageCosts = {};
      }
      tradingState = parsed;
    } catch {
      tradingState = createInitialTradingState(clickerState.shawarmas);
    }
  } else {
    tradingState = createInitialTradingState(clickerState.shawarmas);
  }

  return {
    clicker: clickerState,
    upgrades,
    clickUpgrades,
    stats: {
      totalClicks: 0,
      gameStartTime: Date.now(),
      bestClickRate: 0,
      totalUpgradesPurchased: 0,
      ...stats,
    },
    trading: tradingState,
    version: "2.0",
    lastSaved: Date.now(),
  };
};

// Helper function to create initial trading state
const createInitialTradingState = (shawarmaBalance: number): TradingState => {
  const initialPrices: { [key: string]: number } = {};
  const initialChartData: { [key: string]: any[] } = {};

  FOOD_ITEMS.forEach((food: any) => {
    initialPrices[food.id] = food.basePrice;
    initialChartData[food.id] = [];
  });

  return {
    portfolio: {},
    portfolioAverageCosts: {},
    tradeHistory: [],
    currentPrices: initialPrices,
    chartData: initialChartData,
    selectedFood: FOOD_ITEMS[0].id,
    shawarmaBalance,
  };
};

// Game reducer
const gameReducer = (
  state: CombinedGameState,
  action: GameAction
): CombinedGameState => {
  switch (action.type) {
    case "UPDATE_SHAWARMAS":
      return {
        ...state,
        clicker: { ...state.clicker, shawarmas: action.payload },
        trading: { ...state.trading, shawarmaBalance: action.payload },
      };

    case "UPDATE_SPS":
      return {
        ...state,
        clicker: { ...state.clicker, shawarmasPerSecond: action.payload },
      };

    case "UPDATE_SPC":
      return {
        ...state,
        clicker: { ...state.clicker, shawarmasPerClick: action.payload },
      };

    case "ADD_CLICK":
      const newShawarmas = state.clicker.shawarmas + action.payload;
      return {
        ...state,
        clicker: {
          ...state.clicker,
          shawarmas: newShawarmas,
          totalShawarmasEarned:
            state.clicker.totalShawarmasEarned + action.payload,
        },
        trading: { ...state.trading, shawarmaBalance: newShawarmas },
        stats: { ...state.stats, totalClicks: state.stats.totalClicks + 1 },
      };

    case "BUY_UPGRADE":
      const updatedUpgrades = state.upgrades.map((upgrade) =>
        upgrade.id === action.payload.upgradeId
          ? {
              ...upgrade,
              owned: upgrade.owned + 1,
              cost: Math.ceil(upgrade.cost * upgrade.costMultiplier),
            }
          : upgrade
      );
      const newShawarmasAfterUpgrade =
        state.clicker.shawarmas - action.payload.cost;

      return {
        ...state,
        clicker: { ...state.clicker, shawarmas: newShawarmasAfterUpgrade },
        trading: {
          ...state.trading,
          shawarmaBalance: newShawarmasAfterUpgrade,
        },
        upgrades: updatedUpgrades,
        stats: {
          ...state.stats,
          totalUpgradesPurchased: state.stats.totalUpgradesPurchased + 1,
        },
      };

    case "BUY_CLICK_UPGRADE":
      const updatedClickUpgrades = state.clickUpgrades.map((upgrade) =>
        upgrade.id === action.payload.upgradeId
          ? { ...upgrade, owned: true }
          : upgrade
      );
      const newShawarmasAfterClickUpgrade =
        state.clicker.shawarmas - action.payload.cost;

      return {
        ...state,
        clicker: { ...state.clicker, shawarmas: newShawarmasAfterClickUpgrade },
        trading: {
          ...state.trading,
          shawarmaBalance: newShawarmasAfterClickUpgrade,
        },
        clickUpgrades: updatedClickUpgrades,
        stats: {
          ...state.stats,
          totalUpgradesPurchased: state.stats.totalUpgradesPurchased + 1,
        },
      };

    case "UPDATE_TRADING_STATE":
      return {
        ...state,
        trading: { ...state.trading, ...action.payload },
      };

    case "EXECUTE_TRADE":
      const { type: tradeType, foodId, amount, price, cost } = action.payload;
      const tradeShawarmas =
        tradeType === "buy"
          ? state.clicker.shawarmas - cost
          : state.clicker.shawarmas + cost;

      const newPortfolio = { ...state.trading.portfolio };
      const newAverageCosts = { ...state.trading.portfolioAverageCosts };

      if (tradeType === "buy") {
        const currentAmount = newPortfolio[foodId] || 0;
        const currentAvgCost = newAverageCosts[foodId] || 0;
        const totalCurrentValue = currentAmount * currentAvgCost;
        const newTotalValue = totalCurrentValue + cost;
        const newTotalAmount = currentAmount + amount;
        const newAvgCost = newTotalValue / newTotalAmount;

        newPortfolio[foodId] = newTotalAmount;
        newAverageCosts[foodId] = newAvgCost;
      } else {
        newPortfolio[foodId] = (newPortfolio[foodId] || 0) - amount;
        if (newPortfolio[foodId] <= 0) {
          delete newPortfolio[foodId];
          delete newAverageCosts[foodId];
        }
      }

      const trade = {
        id: `trade-${Date.now()}`,
        foodId,
        type: tradeType,
        amount,
        price,
        timestamp: Date.now(),
        total: cost,
      };

      return {
        ...state,
        clicker: { ...state.clicker, shawarmas: tradeShawarmas },
        trading: {
          ...state.trading,
          shawarmaBalance: tradeShawarmas,
          portfolio: newPortfolio,
          portfolioAverageCosts: newAverageCosts,
          tradeHistory: [trade, ...state.trading.tradeHistory.slice(0, 49)],
        },
      };

    case "UPDATE_PRICES":
      return {
        ...state,
        trading: { ...state.trading, currentPrices: action.payload },
      };

    case "SELECT_FOOD":
      return {
        ...state,
        trading: { ...state.trading, selectedFood: action.payload },
      };

    case "UPDATE_STATS":
      return {
        ...state,
        stats: { ...state.stats, ...action.payload },
      };

    case "RESET_GAME":
      const resetState = getInitialCombinedState();
      return {
        ...resetState,
        stats: {
          ...resetState.stats,
          gameStartTime: Date.now(),
        },
      };

    case "LOAD_GAME":
      return {
        ...action.payload,
        lastSaved: Date.now(),
      };

    default:
      return state;
  }
};

// Context interface
interface GameContextType {
  state: CombinedGameState;
  dispatch: React.Dispatch<GameAction>;
  saveGame: () => void;
  loadGame: (file: File) => Promise<void>;
  resetGame: () => void;
  updateShawarmas: (amount: number) => void;
  addClick: (amount: number) => void;
  buyUpgrade: (upgradeId: string, cost: number) => void;
  buyClickUpgrade: (upgradeId: string, cost: number) => void;
  updateTradingState: (updates: Partial<TradingState>) => void;
  executeTrade: (
    type: "buy" | "sell",
    foodId: string,
    amount: number,
    price: number,
    cost: number
  ) => void;
  updatePrices: (prices: { [key: string]: number }) => void;
  selectFood: (foodId: string) => void;
}

// Create context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, getInitialCombinedState());

  // Auto-save every 10 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      localStorage.setItem(
        "shawarma-game-state",
        JSON.stringify(state.clicker)
      );
      localStorage.setItem("shawarma-upgrades", JSON.stringify(state.upgrades));
      localStorage.setItem(
        "shawarma-click-upgrades",
        JSON.stringify(state.clickUpgrades)
      );
      localStorage.setItem("shawarma-stats", JSON.stringify(state.stats));
      localStorage.setItem("shawarma-trading", JSON.stringify(state.trading));
    }, 10000);

    return () => clearInterval(autoSaveInterval);
  }, [state]);

  // Save game to file
  const saveGame = () => {
    try {
      const saveData = {
        ...state,
        savedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(saveData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shawarma-complete-save-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error saving game:", error);
    }
  };

  // Load game from file
  const loadGame = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const saveData = JSON.parse(e.target?.result as string);

          // Validate save data structure
          if (saveData.clicker && saveData.trading && saveData.upgrades) {
            dispatch({ type: "LOAD_GAME", payload: saveData });
            resolve();
          } else {
            reject(new Error("Invalid save file format!"));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  };

  // Reset game
  const resetGame = () => {
    if (
      confirm(
        "Are you sure you want to reset your entire game? This cannot be undone!"
      )
    ) {
      localStorage.removeItem("shawarma-game-state");
      localStorage.removeItem("shawarma-upgrades");
      localStorage.removeItem("shawarma-click-upgrades");
      localStorage.removeItem("shawarma-stats");
      localStorage.removeItem("shawarma-trading");
      dispatch({ type: "RESET_GAME" });
    }
  };

  // Helper functions
  const updateShawarmas = (amount: number) => {
    dispatch({ type: "UPDATE_SHAWARMAS", payload: amount });
  };

  const addClick = (amount: number) => {
    dispatch({ type: "ADD_CLICK", payload: amount });
  };

  const buyUpgrade = (upgradeId: string, cost: number) => {
    dispatch({ type: "BUY_UPGRADE", payload: { upgradeId, cost } });
  };

  const buyClickUpgrade = (upgradeId: string, cost: number) => {
    dispatch({ type: "BUY_CLICK_UPGRADE", payload: { upgradeId, cost } });
  };

  const updateTradingState = (updates: Partial<TradingState>) => {
    dispatch({ type: "UPDATE_TRADING_STATE", payload: updates });
  };

  const executeTrade = (
    type: "buy" | "sell",
    foodId: string,
    amount: number,
    price: number,
    cost: number
  ) => {
    dispatch({
      type: "EXECUTE_TRADE",
      payload: { type, foodId, amount, price, cost },
    });
  };

  const updatePrices = (prices: { [key: string]: number }) => {
    dispatch({ type: "UPDATE_PRICES", payload: prices });
  };

  const selectFood = (foodId: string) => {
    dispatch({ type: "SELECT_FOOD", payload: foodId });
  };

  const contextValue: GameContextType = {
    state,
    dispatch,
    saveGame,
    loadGame,
    resetGame,
    updateShawarmas,
    addClick,
    buyUpgrade,
    buyClickUpgrade,
    updateTradingState,
    executeTrade,
    updatePrices,
    selectFood,
  };

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
