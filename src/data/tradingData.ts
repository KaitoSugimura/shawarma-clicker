import type { FoodItem } from "../types/trading";

export const FOOD_ITEMS: FoodItem[] = [
  {
    id: "pizza",
    name: "Pizza Slice",
    symbol: "PZZ",
    icon: "🍕",
    basePrice: 0.75,
    volatility: 0.15,
    description: "Classic Italian investment",
  },
  {
    id: "burger",
    name: "Burger",
    symbol: "BRG",
    icon: "🍔",
    basePrice: 1.2,
    volatility: 0.2,
    description: "American fast food giant",
  },
  {
    id: "taco",
    name: "Taco",
    symbol: "TCO",
    icon: "🌮",
    basePrice: 0.6,
    volatility: 0.25,
    description: "Mexican street food sensation",
  },
  {
    id: "sushi",
    name: "Sushi",
    symbol: "SSH",
    icon: "🍣",
    basePrice: 2.5,
    volatility: 0.3,
    description: "Premium Japanese delicacy",
  },
  {
    id: "ramen",
    name: "Ramen",
    symbol: "RMN",
    icon: "🍜",
    basePrice: 1.8,
    volatility: 0.18,
    description: "Japanese comfort food",
  },
  {
    id: "croissant",
    name: "Croissant",
    symbol: "CRS",
    icon: "🥐",
    basePrice: 0.9,
    volatility: 0.12,
    description: "French bakery stable",
  },
  {
    id: "hotdog",
    name: "Hot Dog",
    symbol: "HTD",
    icon: "🌭",
    basePrice: 0.8,
    volatility: 0.22,
    description: "Stadium food classic",
  },
  {
    id: "donut",
    name: "Donut",
    symbol: "DNT",
    icon: "🍩",
    basePrice: 0.5,
    volatility: 0.28,
    description: "Sweet morning treat",
  },
];

export const TRADING_CONFIG = {
  CANDLE_DURATION: 2000, // 2 seconds per candle for faster action
  PRICE_UPDATE_INTERVAL: 300, // Update prices every 300ms for more dynamic movement
  MAX_CANDLES: 60, // Keep last 60 candles
  VOLATILITY_MULTIPLIER: 0.15, // Higher volatility for more excitement
} as const;
