export interface FoodItem {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  basePrice: number;
  volatility: number;
  description: string;
}

export interface TradingData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Portfolio {
  [foodId: string]: number;
}

export interface Trade {
  id: string;
  foodId: string;
  type: "buy" | "sell";
  amount: number;
  price: number;
  timestamp: number;
  total: number;
}

export interface TradingState {
  portfolio: Portfolio;
  portfolioAverageCosts: { [foodId: string]: number };
  tradeHistory: Trade[];
  currentPrices: { [foodId: string]: number };
  chartData: { [foodId: string]: TradingData[] };
  selectedFood: string;
  shawarmaBalance: number;
}
