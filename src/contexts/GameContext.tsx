import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import type {
  GameState,
  Upgrade,
  ClickUpgrade,
  GameStats,
} from "../types/game";
import type { TradingState } from "../types/trading";
import {
  initialGameState,
  initialUpgrades,
  initialClickUpgrades,
} from "../data/gameData";
import { loadFromStorage } from "../utils/gameUtils";
import { FOOD_ITEMS, TRADING_CONFIG } from "../data/tradingData";
import { auth } from "../firebase/config";
import { CloudSaveService } from "../services/CloudSaveService";
import { toaster } from "../components/ui/toaster";

// Combined game state that includes both clicker and trading
export interface CombinedGameState {
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
  | { type: "UNLOCK_ACHIEVEMENT"; payload: string }
  | { type: "RESET_GAME" }
  | { type: "LOAD_GAME"; payload: CombinedGameState }
  | { type: "UPDATE_STATS"; payload: Partial<GameStats> };

// Initial combined state
const getInitialCombinedState = (): CombinedGameState => {
  const clickerState = loadFromStorage("shawarma-game-state", initialGameState);

  // Load upgrades from localStorage or use initial upgrades
  let upgrades: Upgrade[];
  try {
    const savedUpgrades = JSON.parse(
      localStorage.getItem("shawarma-upgrades") || "[]"
    );

    if (Array.isArray(savedUpgrades) && savedUpgrades.length > 0) {
      upgrades = savedUpgrades;
    } else {
      // Use initial upgrades if none saved
      upgrades = initialUpgrades.map((upgrade: Upgrade) => ({
        ...upgrade,
        owned: 0,
      }));
    }
  } catch {
    // Use initial upgrades on error
    upgrades = initialUpgrades.map((upgrade: Upgrade) => ({
      ...upgrade,
      owned: 0,
    }));
  }

  // Load click upgrades with format validation
  let clickUpgrades: ClickUpgrade[];
  try {
    const savedClickUpgrades = JSON.parse(
      localStorage.getItem("shawarma-click-upgrades") || "[]"
    );

    // Validate the saved click upgrades format
    if (Array.isArray(savedClickUpgrades) && savedClickUpgrades.length > 0) {
      const hasValidFormat = savedClickUpgrades.every(
        (upgrade: any) =>
          upgrade &&
          typeof upgrade.id === "string" &&
          typeof upgrade.shawarmasPerClick === "number" &&
          typeof upgrade.owned === "boolean"
      );

      if (hasValidFormat) {
        clickUpgrades = savedClickUpgrades;
      } else {
        // Reset invalid format - use initial click upgrades
        clickUpgrades = initialClickUpgrades.map((upgrade: ClickUpgrade) => ({
          ...upgrade,
          owned: false,
        }));
        localStorage.removeItem("shawarma-click-upgrades");
      }
    } else {
      // Use initial click upgrades if none saved
      clickUpgrades = initialClickUpgrades.map((upgrade: ClickUpgrade) => ({
        ...upgrade,
        owned: false,
      }));
    }
  } catch {
    // Reset on any parsing error - use initial click upgrades
    clickUpgrades = initialClickUpgrades.map((upgrade: ClickUpgrade) => ({
      ...upgrade,
      owned: false,
    }));
    localStorage.removeItem("shawarma-click-upgrades");
  }

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
    clicker: {
      ...clickerState,
      shawarmasPerSecond: calculateShawarmasPerSecond(upgrades),
      shawarmasPerClick: Math.max(1, calculateShawarmasPerClick(clickUpgrades)),
    },
    upgrades,
    clickUpgrades,
    stats: {
      totalClicks: 0,
      gameStartTime: Date.now(),
      bestClickRate: 0,
      totalUpgradesPurchased: 0,
      totalClickUpgradesPurchased: 0,
      totalTrades: 0,
      totalProfit: 0,
      bestTradeProfit: 0,
      tradesInSession: 0,
      longestHoldTime: 0,
      quickestProfitableFlip: Infinity,
      playTime: 0,
      totalResets: 0,
      ...stats,
    },
    trading: tradingState,
    version: "2.0",
    lastSaved: Date.now(),
  };
};

// Helper function to calculate total shawarmas per second from upgrades
const calculateShawarmasPerSecond = (upgrades: Upgrade[]): number => {
  return upgrades.reduce((total, upgrade) => {
    return total + upgrade.shawarmasPerSecond * upgrade.owned;
  }, 0);
};

// Helper function to calculate total shawarmas per click from click upgrades
const calculateShawarmasPerClick = (clickUpgrades: ClickUpgrade[]): number => {
  const calculated = clickUpgrades.reduce((total, upgrade) => {
    return total + (upgrade.owned ? upgrade.shawarmasPerClick : 0);
  }, 1); // Base click value is 1

  // Ensure we never return 0 or invalid values
  return Math.max(1, calculated || 1);
};

// Helper function to generate fake historical chart data
const generateFakeHistoricalData = (food: any, candles: number = 60): any[] => {
  const history = [];
  const now = Date.now();
  const candleDuration = TRADING_CONFIG.CANDLE_DURATION;

  let currentPrice = food.basePrice;

  for (let i = candles - 1; i >= 0; i--) {
    const timestamp = now - i * candleDuration;

    // Generate realistic price movement
    const volatilityFactor = food.volatility * 0.05; // Smaller movements for history
    const priceChange =
      (Math.random() - 0.5) * 2 * volatilityFactor * currentPrice;

    const open = currentPrice;
    currentPrice = Math.max(0.001, currentPrice + priceChange);

    // Generate high/low within reasonable bounds
    const volatilityRange = volatilityFactor * currentPrice * 0.5;
    const high = Math.max(open, currentPrice) + Math.random() * volatilityRange;
    const low = Math.min(open, currentPrice) - Math.random() * volatilityRange;

    history.push({
      timestamp,
      open,
      high: Math.max(high, Math.max(open, currentPrice)),
      low: Math.max(0.001, Math.min(low, Math.min(open, currentPrice))),
      close: currentPrice,
      volume: Math.floor(Math.random() * 1000) + 100,
    });
  }

  return history;
};

// Helper function to create initial trading state
const createInitialTradingState = (shawarmaBalance: number): TradingState => {
  const initialPrices: { [key: string]: number } = {};
  const initialChartData: { [key: string]: any[] } = {};

  FOOD_ITEMS.forEach((food: any) => {
    // Set current price to the last price from historical data
    const historicalData = generateFakeHistoricalData(
      food,
      TRADING_CONFIG.MAX_CANDLES
    );
    const lastCandle = historicalData[historicalData.length - 1];

    initialPrices[food.id] = lastCandle.close;
    initialChartData[food.id] = historicalData;
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
      const newShawarmasPerSecond =
        calculateShawarmasPerSecond(updatedUpgrades);

      return {
        ...state,
        clicker: {
          ...state.clicker,
          shawarmas: newShawarmasAfterUpgrade,
          shawarmasPerSecond: newShawarmasPerSecond,
        },
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
      const newShawarmasPerClick =
        calculateShawarmasPerClick(updatedClickUpgrades);

      return {
        ...state,
        clicker: {
          ...state.clicker,
          shawarmas: newShawarmasAfterClickUpgrade,
          shawarmasPerClick: newShawarmasPerClick,
        },
        trading: {
          ...state.trading,
          shawarmaBalance: newShawarmasAfterClickUpgrade,
        },
        clickUpgrades: updatedClickUpgrades,
        stats: {
          ...state.stats,
          totalClickUpgradesPurchased:
            state.stats.totalClickUpgradesPurchased + 1,
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

      // Calculate profit for sell trades
      let tradeProfit = 0;
      if (tradeType === "sell") {
        const avgCost = newAverageCosts[foodId] || 0;
        tradeProfit = (price - avgCost) * amount;
      }

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

      // Update trading stats
      const newStats = {
        ...state.stats,
        totalTrades: state.stats.totalTrades + 1,
        totalProfit: state.stats.totalProfit + tradeProfit,
        bestTradeProfit: Math.max(state.stats.bestTradeProfit, tradeProfit),
      };

      return {
        ...state,
        clicker: { ...state.clicker, shawarmas: tradeShawarmas },
        stats: newStats,
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

    case "UNLOCK_ACHIEVEMENT":
      return {
        ...state,
        clicker: {
          ...state.clicker,
          achievements: [...state.clicker.achievements, action.payload],
        },
      };

    case "RESET_GAME":
      const resetState = getInitialCombinedState();
      return {
        ...resetState,
        stats: {
          ...resetState.stats,
          gameStartTime: Date.now(),
          totalResets: state.stats.totalResets + 1,
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
  user: User | null;
  authLoading: boolean;
  saveGame: () => void;
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
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [lastCloudSave, setLastCloudSave] = useState<number>(0);
  const [pendingChanges, setPendingChanges] = useState(false);

  // Authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setAuthLoading(false);

      if (user) {
        // Try to load cloud save when user signs in
        try {
          const cloudSave = await CloudSaveService.loadFromCloud(user);
          if (cloudSave) {
            dispatch({ type: "LOAD_GAME", payload: cloudSave });
            console.log("Loaded game from cloud");
          }
        } catch (error) {
          console.error("Failed to load cloud save:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Track changes to trigger cloud saves
  useEffect(() => {
    setPendingChanges(true);
  }, [state]);

  // Optimized cloud auto-save (every 60 seconds, only if changes and user is signed in)
  useEffect(() => {
    if (!user) return;

    const cloudSaveInterval = setInterval(async () => {
      if (pendingChanges && Date.now() - lastCloudSave > 30000) {
        // 30 second minimum between saves
        try {
          await CloudSaveService.saveToCloud(user, state);
          setLastCloudSave(Date.now());
          setPendingChanges(false);
          console.log("Auto-saved to cloud");
        } catch (error) {
          console.error("Auto-save to cloud failed:", error);
        }
      }
    }, 60000); // Check every 60 seconds

    return () => clearInterval(cloudSaveInterval);
  }, [user, state, pendingChanges, lastCloudSave]);

  // Fallback localStorage save for offline users (reduced frequency)
  useEffect(() => {
    if (user) return; // Skip localStorage if user is signed in

    const localSaveInterval = setInterval(() => {
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
    }, 30000); // Save every 30 seconds for offline users

    return () => clearInterval(localSaveInterval);
  }, [state, user]);

  // Manual save game to cloud (immediate)
  const saveGame = async () => {
    if (user) {
      try {
        await CloudSaveService.saveToCloud(user, state);
        setLastCloudSave(Date.now());
        setPendingChanges(false);
        console.log("Manual save to cloud successful");

        // Show success notification
        toaster.create({
          title: "Game Saved",
          description: "Progress saved to cloud successfully!",
          type: "success",
          duration: 3000,
        });
      } catch (error) {
        console.error("Manual save to cloud failed:", error);

        // Show error notification
        toaster.create({
          title: "Save Failed",
          description: "Failed to save to cloud. Please try again.",
          type: "error",
          duration: 5000,
        });
      }
    } else {
      // Show notification for non-authenticated users
      toaster.create({
        title: "Sign In Required",
        description:
          "Please sign in with Google to save your progress to the cloud.",
        type: "error",
        duration: 5000,
      });
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
    user,
    authLoading,
    saveGame,
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
