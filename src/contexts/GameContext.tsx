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
import { FOOD_ITEMS, TRADING_CONFIG } from "../data/tradingData";
import { auth } from "../firebase/config";
import { CloudSaveService } from "../services/CloudSaveService";
import { toaster } from "../components/ui/toaster";

export interface CombinedGameState {
  clicker: GameState;
  upgrades: Upgrade[];
  clickUpgrades: ClickUpgrade[];
  stats: GameStats;
  trading: TradingState;
  version: string;
  lastSaved: number;
}

type GameAction =
  | { type: "UPDATE_SHAWARMAS"; payload: number }
  | { type: "UPDATE_SPS"; payload: number }
  | { type: "UPDATE_SPC"; payload: number }
  | { type: "ADD_CLICK"; payload: number }
  | { type: "ADD_PRODUCTION"; payload: number }
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

const getInitialCombinedState = (): CombinedGameState => {
  const upgrades = initialUpgrades.map((upgrade: Upgrade) => ({
    ...upgrade,
    owned: 0,
  }));

  const clickUpgrades = initialClickUpgrades.map((upgrade: ClickUpgrade) => ({
    ...upgrade,
    owned: false,
  }));

  const tradingState = createInitialTradingState(initialGameState.shawarmas);

  return {
    clicker: {
      ...initialGameState,
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
    },
    trading: tradingState,
    version: "2.0",
    lastSaved: Date.now(),
  };
};

const calculateShawarmasPerSecond = (upgrades: Upgrade[]): number => {
  return upgrades.reduce((total, upgrade) => {
    return total + upgrade.shawarmasPerSecond * upgrade.owned;
  }, 0);
};

const calculateShawarmasPerClick = (clickUpgrades: ClickUpgrade[]): number => {
  const calculated = clickUpgrades.reduce((total, upgrade) => {
    return total + (upgrade.owned ? upgrade.shawarmasPerClick : 0);
  }, 1);

  return Math.max(1, calculated || 1);
};

const generateFakeHistoricalData = (food: any, candles: number = 60): any[] => {
  const history = [];
  const now = Date.now();
  const candleDuration = TRADING_CONFIG.CANDLE_DURATION;

  let currentPrice = food.basePrice;

  for (let i = candles - 1; i >= 0; i--) {
    const timestamp = now - i * candleDuration;

    const volatilityFactor = food.volatility * 0.05;
    const priceChange =
      (Math.random() - 0.5) * 2 * volatilityFactor * currentPrice;

    const open = currentPrice;
    currentPrice = Math.max(0.001, currentPrice + priceChange);

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

const createInitialTradingState = (shawarmaBalance: number): TradingState => {
  const initialPrices: { [key: string]: number } = {};
  const initialChartData: { [key: string]: any[] } = {};
  const initialVolatilityPeriods: {
    [key: string]: { active: boolean; endTime: number; multiplier: number };
  } = {};

  FOOD_ITEMS.forEach((food: any) => {
    const historicalData = generateFakeHistoricalData(
      food,
      TRADING_CONFIG.MAX_CANDLES
    );
    const lastCandle = historicalData[historicalData.length - 1];

    initialPrices[food.id] = lastCandle.close;
    initialChartData[food.id] = historicalData;
    initialVolatilityPeriods[food.id] = {
      active: false,
      endTime: 0,
      multiplier: 1,
    };
  });

  return {
    portfolio: {},
    portfolioAverageCosts: {},
    tradeHistory: [],
    currentPrices: initialPrices,
    chartData: initialChartData,
    selectedFood: FOOD_ITEMS[0].id,
    shawarmaBalance,
    volatilityPeriods: initialVolatilityPeriods,
    lastVolatilityCheck: Date.now(),
  };
};

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

    case "ADD_PRODUCTION":
      const newShawarmasFromProduction =
        state.clicker.shawarmas + action.payload;
      return {
        ...state,
        clicker: {
          ...state.clicker,
          shawarmas: newShawarmasFromProduction,
          totalShawarmasEarned:
            state.clicker.totalShawarmasEarned + action.payload,
        },
        trading: {
          ...state.trading,
          shawarmaBalance: newShawarmasFromProduction,
        },
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
      const loadedState = action.payload;
      const recalculatedShawarmasPerSecond = calculateShawarmasPerSecond(
        loadedState.upgrades
      );
      const recalculatedShawarmasPerClick = calculateShawarmasPerClick(
        loadedState.clickUpgrades
      );

      const freshTradingState = createInitialTradingState(
        loadedState.clicker?.shawarmas || 0
      );
      const migratedTradingState = {
        ...freshTradingState,
        ...loadedState.trading,
        volatilityPeriods:
          loadedState.trading?.volatilityPeriods ||
          freshTradingState.volatilityPeriods,
        lastVolatilityCheck:
          loadedState.trading?.lastVolatilityCheck || Date.now(),
      };

      return {
        ...loadedState,
        clicker: {
          ...loadedState.clicker,
          shawarmasPerSecond: recalculatedShawarmasPerSecond,
          shawarmasPerClick: recalculatedShawarmasPerClick,
        },
        trading: migratedTradingState,
        lastSaved: Date.now(),
      };

    default:
      return state;
  }
};

interface GameContextType {
  state: CombinedGameState;
  dispatch: React.Dispatch<GameAction>;
  user: User | null;
  authLoading: boolean;
  gameLoading: boolean;
  saveGame: (isAutoSave?: boolean) => void; // Fix: Add the optional parameter
  recoverFromCloud: () => void; // Add recovery function
  testAutoSave: () => void; // Add test function
  updateShawarmas: (amount: number) => void;
  addClick: (amount: number) => void;
  addProduction: (amount: number) => void;
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

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, getInitialCombinedState());
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [gameLoading, setGameLoading] = useState(true);
  const [lastCloudSave, setLastCloudSave] = useState<number>(0);
  const [pendingChanges, setPendingChanges] = useState(false);

  // Use refs to ensure we always have the latest values in the interval
  const stateRef = React.useRef(state);
  const pendingChangesRef = React.useRef(pendingChanges);
  const lastCloudSaveRef = React.useRef(lastCloudSave);

  // Update refs whenever values change
  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);

  React.useEffect(() => {
    pendingChangesRef.current = pendingChanges;
  }, [pendingChanges]);

  React.useEffect(() => {
    lastCloudSaveRef.current = lastCloudSave;
  }, [lastCloudSave]);

  useEffect(() => {
    localStorage.removeItem("shawarma-game-state");
    localStorage.removeItem("shawarma-upgrades");
    localStorage.removeItem("shawarma-click-upgrades");
    localStorage.removeItem("shawarma-stats");
    localStorage.removeItem("shawarma-trading");
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setAuthLoading(false);

      if (user) {
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

      setGameLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log("State changed, setting pendingChanges to true");
    setPendingChanges(true);
  }, [state]);

  useEffect(() => {
    if (!user) return;

    console.log("Setting up FIXED auto-save interval for user:", user?.email);

    const cloudSaveInterval = setInterval(async () => {
      const currentPendingChanges = pendingChangesRef.current;
      const currentLastCloudSave = lastCloudSaveRef.current;
      const currentState = stateRef.current;

      console.log("Auto-save check running...", {
        pendingChanges: currentPendingChanges,
        timeSinceLastSave: Date.now() - currentLastCloudSave,
        shouldSave:
          currentPendingChanges && Date.now() - currentLastCloudSave > 30000,
        currentShawarmas: currentState?.clicker?.shawarmas || 0,
        hasValidState: !!(currentState && currentState.clicker),
      });

      if (currentPendingChanges && Date.now() - currentLastCloudSave > 30000) {
        console.log("Triggering auto-save with direct state access...");

        // DIRECTLY save using the current state from ref, not the closure
        if (user && currentState && currentState.clicker) {
          try {
            console.log(
              "Auto-save: Saving state with",
              currentState.clicker.shawarmas,
              "shawarmas"
            );
            await CloudSaveService.saveToCloud(user, currentState);
            setLastCloudSave(Date.now());
            setPendingChanges(false);
            console.log("Auto-save successful with direct state access");

            toaster.create({
              title: "Auto-Saved",
              description: "Game progress automatically saved to cloud",
              type: "info",
              duration: 2000,
            });
          } catch (error) {
            console.error("Auto-save failed:", error);
            toaster.create({
              title: "Auto-Save Failed",
              description: "Failed to auto-save to cloud",
              type: "error",
              duration: 3000,
            });
          }
        } else {
          console.error("Auto-save skipped: Invalid state or no user");
        }
      }
    }, 30000); // Auto-save check every 30 seconds

    return () => {
      console.log("Cleaning up auto-save interval");
      clearInterval(cloudSaveInterval);
    };
  }, [user]); // Only depend on user, not state changes

  const saveGame = async (isAutoSave = false) => {
    console.log(`saveGame called with isAutoSave: ${isAutoSave}`);

    if (user) {
      try {
        await CloudSaveService.saveToCloud(user, state);
        setLastCloudSave(Date.now());
        setPendingChanges(false);

        if (isAutoSave) {
          console.log("Auto-save successful");
          toaster.create({
            title: "Auto-Saved",
            description: "Game progress saved.",
            type: "info",
            duration: 2000,
          });
        } else {
          console.log("Manual save to cloud successful");
          toaster.create({
            title: "Game Saved",
            description: "Progress saved.",
            type: "success",
            duration: 3000,
          });
        }
      } catch (error) {
        console.error(
          isAutoSave ? "Auto-save failed:" : "Manual save failed:",
          error
        );

        toaster.create({
          title: isAutoSave ? "Auto-Save Failed" : "Save Failed",
          description: isAutoSave
            ? "Failed to auto-save to cloud"
            : "Failed to save to cloud. Please try again.",
          type: "error",
          duration: 5000,
        });
      }
    } else if (!isAutoSave) {
      toaster.create({
        title: "Sign In Required",
        description:
          "Your progress is only saved while playing. Sign in with Google for permanent cloud saves!",
        type: "error",
        duration: 5000,
      });
    }
  };

  const updateShawarmas = (amount: number) => {
    dispatch({ type: "UPDATE_SHAWARMAS", payload: amount });
  };

  const addClick = (amount: number) => {
    dispatch({ type: "ADD_CLICK", payload: amount });
  };

  const addProduction = (amount: number) => {
    dispatch({ type: "ADD_PRODUCTION", payload: amount });
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

  useEffect(() => {
    if (state.clicker.shawarmasPerSecond <= 0) return;

    const productionInterval = setInterval(() => {
      const production = state.clicker.shawarmasPerSecond;
      if (production > 0) {
        addProduction(production);
      }
    }, 1000);

    return () => clearInterval(productionInterval);
  }, [state.clicker.shawarmasPerSecond]);

  // EMERGENCY DATA RECOVERY FUNCTION
  const recoverFromCloud = async () => {
    if (!user) {
      console.error("No user logged in for recovery");
      return;
    }

    try {
      console.log("Attempting to recover data from cloud...");
      const cloudSave = await CloudSaveService.loadFromCloud(user);
      if (cloudSave) {
        dispatch({ type: "LOAD_GAME", payload: cloudSave });
        console.log("Data recovered from cloud!");

        toaster.create({
          title: "Data Recovered",
          description: "Your game data has been recovered from cloud save",
          type: "success",
          duration: 5000,
        });
      } else {
        console.error("No cloud save found to recover from");
        toaster.create({
          title: "No Recovery Data",
          description: "No cloud save found to recover from",
          type: "error",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Failed to recover data:", error);
      toaster.create({
        title: "Recovery Failed",
        description: "Failed to recover data from cloud",
        type: "error",
        duration: 5000,
      });
    }
  };

  // SAFE AUTO-SAVE FUNCTION FOR TESTING
  const testAutoSave = async () => {
    const currentState = stateRef.current;
    console.log("Testing auto-save with current state:", {
      shawarmas: currentState?.clicker?.shawarmas,
      hasState: !!currentState,
      hasClicker: !!(currentState && currentState.clicker),
    });

    if (user && currentState && currentState.clicker) {
      try {
        await CloudSaveService.saveToCloud(user, currentState);
        console.log("Test auto-save successful!");
        toaster.create({
          title: "Test Auto-Save Success",
          description: `Saved ${currentState.clicker.shawarmas} shawarmas successfully`,
          type: "success",
          duration: 3000,
        });
      } catch (error) {
        console.error("Test auto-save failed:", error);
        toaster.create({
          title: "Test Auto-Save Failed",
          description: "Failed to save current state",
          type: "error",
          duration: 5000,
        });
      }
    } else {
      console.error("Cannot test auto-save: missing user or invalid state");
    }
  };

  const contextValue: GameContextType = {
    state,
    dispatch,
    user,
    authLoading,
    gameLoading,
    saveGame,
    recoverFromCloud,
    testAutoSave,
    updateShawarmas,
    addClick,
    addProduction,
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

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
