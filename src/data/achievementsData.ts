import type { Achievement } from "../components/shared/interfaces";

export const achievements: Achievement[] = [
  {
    id: "first-click",
    name: "First Bite",
    description: "Click the shawarma for the first time",
    icon: "🥙",
    category: "clicker",
    requirement: (state) => state.clicker.totalShawarmasEarned >= 1,
  },
  {
    id: "ten-clicks",
    name: "Getting Started",
    description: "Click 10 times",
    icon: "👆",
    category: "clicker",
    requirement: (state) => state.stats.totalClicks >= 10,
  },
  {
    id: "hundred-clicks",
    name: "Clicking Enthusiast",
    description: "Click 100 times",
    icon: "🚀",
    category: "clicker",
    requirement: (state) => state.stats.totalClicks >= 100,
  },
  {
    id: "thousand-clicks",
    name: "Click Master",
    description: "Click 1,000 times",
    icon: "🖱️",
    category: "clicker",
    requirement: (state) => state.stats.totalClicks >= 1000,
  },
  {
    id: "ten-thousand-clicks",
    name: "Click Specialist",
    description: "Click 10,000 times",
    icon: "⚡",
    category: "clicker",
    requirement: (state) => state.stats.totalClicks >= 10000,
  },
  {
    id: "hundred-thousand-clicks",
    name: "Click Legend",
    description: "Click 100,000 times",
    icon: "🌟",
    category: "clicker",
    requirement: (state) => state.stats.totalClicks >= 100000,
  },

  {
    id: "ten-shawarmas",
    name: "First Dozen",
    description: "Earn 10 shawarmas",
    icon: "🔢",
    category: "clicker",
    requirement: (state) => state.clicker.totalShawarmasEarned >= 10,
  },
  {
    id: "hundred-shawarmas",
    name: "Shawarma Starter",
    description: "Earn 100 shawarmas",
    icon: "💯",
    category: "clicker",
    requirement: (state) => state.clicker.totalShawarmasEarned >= 100,
  },
  {
    id: "thousand-shawarmas",
    name: "Shawarma Enthusiast",
    description: "Earn 1,000 shawarmas",
    icon: "🎯",
    category: "clicker",
    requirement: (state) => state.clicker.totalShawarmasEarned >= 1000,
  },
  {
    id: "ten-thousand-shawarmas",
    name: "Shawarma Collector",
    description: "Earn 10,000 shawarmas",
    icon: "📈",
    category: "clicker",
    requirement: (state) => state.clicker.totalShawarmasEarned >= 10000,
  },
  {
    id: "hundred-thousand-shawarmas",
    name: "Shawarma Mogul",
    description: "Earn 100,000 shawarmas",
    icon: "🏰",
    category: "clicker",
    requirement: (state) => state.clicker.totalShawarmasEarned >= 100000,
  },
  {
    id: "million-shawarmas",
    name: "Shawarma Millionaire",
    description: "Earn 1 million shawarmas",
    icon: "💰",
    category: "clicker",
    requirement: (state) => state.clicker.totalShawarmasEarned >= 1000000,
  },
  {
    id: "ten-million-shawarmas",
    name: "Shawarma Empire",
    description: "Earn 10 million shawarmas",
    icon: "🏛️",
    category: "clicker",
    requirement: (state) => state.clicker.totalShawarmasEarned >= 10000000,
  },
  {
    id: "hundred-million-shawarmas",
    name: "Shawarma Titan",
    description: "Earn 100 million shawarmas",
    icon: "🌍",
    category: "clicker",
    requirement: (state) => state.clicker.totalShawarmasEarned >= 100000000,
  },

  {
    id: "first-upgrade",
    name: "First Investment",
    description: "Purchase your first upgrade",
    icon: "🛍️",
    category: "clicker",
    requirement: (_, upgrades) => upgrades?.some((u: any) => u.owned > 0),
  },
  {
    id: "five-upgrades",
    name: "Smart Buyer",
    description: "Purchase 5 upgrades",
    icon: "🛒",
    category: "clicker",
    requirement: (state) => state.stats.totalUpgradesPurchased >= 5,
  },
  {
    id: "ten-upgrades",
    name: "Upgrade Collector",
    description: "Purchase 10 upgrades",
    icon: "📦",
    category: "clicker",
    requirement: (state) => state.stats.totalUpgradesPurchased >= 10,
  },
  {
    id: "twenty-five-upgrades",
    name: "Upgrade Enthusiast",
    description: "Purchase 25 upgrades",
    icon: "📋",
    category: "clicker",
    requirement: (state) => state.stats.totalUpgradesPurchased >= 25,
  },
  {
    id: "fifty-upgrades",
    name: "Upgrade Master",
    description: "Purchase 50 upgrades",
    icon: "🎖️",
    category: "clicker",
    requirement: (state) => state.stats.totalUpgradesPurchased >= 50,
  },
  {
    id: "hundred-upgrades",
    name: "Upgrade Legend",
    description: "Purchase 100 upgrades",
    icon: "🏆",
    category: "clicker",
    requirement: (state) => state.stats.totalUpgradesPurchased >= 100,
  },

  {
    id: "first-click-upgrade",
    name: "Better Clicking",
    description: "Purchase your first click upgrade",
    icon: "👆",
    category: "clicker",
    requirement: (state) => state.stats.totalClickUpgradesPurchased >= 1,
  },
  {
    id: "five-click-upgrades",
    name: "Click Enhancer",
    description: "Purchase 5 click upgrades",
    icon: "✋",
    category: "clicker",
    requirement: (state) => state.stats.totalClickUpgradesPurchased >= 5,
  },
  {
    id: "all-click-upgrades",
    name: "Maximum Power",
    description: "Purchase all available click upgrades",
    icon: "💪",
    category: "clicker",
    requirement: (state) => state.stats.totalClickUpgradesPurchased >= 8,
  },
  {
    id: "powerful-clicks",
    name: "Power Clicker",
    description: "Reach 50+ shawarmas per click",
    icon: "⚡",
    category: "clicker",
    requirement: (state) => state.clicker.shawarmasPerClick >= 50,
  },
  {
    id: "mega-clicks",
    name: "Mega Clicker",
    description: "Reach 100+ shawarmas per click",
    icon: "🔥",
    category: "clicker",
    requirement: (state) => state.clicker.shawarmasPerClick >= 100,
  },
  {
    id: "ultra-clicks",
    name: "Ultra Clicker",
    description: "Reach 250+ shawarmas per click",
    icon: "💥",
    category: "clicker",
    requirement: (state) => state.clicker.shawarmasPerClick >= 250,
  },

  {
    id: "auto-production",
    name: "Passive Income",
    description: "Reach 1 shawarma per second",
    icon: "⚙️",
    category: "clicker",
    requirement: (state) => state.clicker.shawarmasPerSecond >= 1,
  },
  {
    id: "steady-production",
    name: "Steady Flow",
    description: "Reach 10 shawarmas per second",
    icon: "🌊",
    category: "clicker",
    requirement: (state) => state.clicker.shawarmasPerSecond >= 10,
  },
  {
    id: "production-master",
    name: "Production Master",
    description: "Reach 100 shawarmas per second",
    icon: "🏭",
    category: "clicker",
    requirement: (state) => state.clicker.shawarmasPerSecond >= 100,
  },
  {
    id: "production-titan",
    name: "Production Titan",
    description: "Reach 1,000 shawarmas per second",
    icon: "⚡",
    category: "clicker",
    requirement: (state) => state.clicker.shawarmasPerSecond >= 1000,
  },
  {
    id: "production-god",
    name: "Production God",
    description: "Reach 10,000 shawarmas per second",
    icon: "🎆",
    category: "clicker",
    requirement: (state) => state.clicker.shawarmasPerSecond >= 10000,
  },

  {
    id: "first-trade",
    name: "Market Debut",
    description: "Make your first trade in the food exchange",
    icon: "📈",
    category: "trading",
    requirement: (state) => state.stats.totalTrades >= 1,
  },
  {
    id: "five-trades",
    name: "Getting Trading",
    description: "Complete 5 trades",
    icon: "📊",
    category: "trading",
    requirement: (state) => state.stats.totalTrades >= 5,
  },
  {
    id: "ten-trades",
    name: "Active Trader",
    description: "Complete 10 trades",
    icon: "💹",
    category: "trading",
    requirement: (state) => state.stats.totalTrades >= 10,
  },
  {
    id: "twenty-five-trades",
    name: "Frequent Trader",
    description: "Complete 25 trades",
    icon: "📋",
    category: "trading",
    requirement: (state) => state.stats.totalTrades >= 25,
  },
  {
    id: "fifty-trades",
    name: "Trading Regular",
    description: "Complete 50 trades",
    icon: "📌",
    category: "trading",
    requirement: (state) => state.stats.totalTrades >= 50,
  },
  {
    id: "hundred-trades",
    name: "Trading Veteran",
    description: "Complete 100 trades",
    icon: "🎖️",
    category: "trading",
    requirement: (state) => state.stats.totalTrades >= 100,
  },
  {
    id: "thousand-trades",
    name: "Trading Master",
    description: "Complete 1,000 trades",
    icon: "🏆",
    category: "trading",
    requirement: (state) => state.stats.totalTrades >= 1000,
  },

  {
    id: "first-profit",
    name: "Profit Maker",
    description: "Make your first profitable trade",
    icon: "💹",
    category: "trading",
    requirement: (state) => state.stats.totalProfit > 0,
  },
  {
    id: "hundred-profit",
    name: "Growing Wealth",
    description: "Earn 100 shawarma profit from trading",
    icon: "💰",
    category: "trading",
    requirement: (state) => state.stats.totalProfit >= 100,
  },
  {
    id: "thousand-profit",
    name: "Market Genius",
    description: "Earn 1,000 shawarma profit from trading",
    icon: "🧠",
    category: "trading",
    requirement: (state) => state.stats.totalProfit >= 1000,
  },
  {
    id: "ten-thousand-profit",
    name: "Trading Tycoon",
    description: "Earn 10,000 shawarma profit from trading",
    icon: "💎",
    category: "trading",
    requirement: (state) => state.stats.totalProfit >= 10000,
  },
  {
    id: "hundred-thousand-profit",
    name: "Wall Street Wolf",
    description: "Earn 100,000 shawarma profit from trading",
    icon: "🐺",
    category: "trading",
    requirement: (state) => state.stats.totalProfit >= 100000,
  },
  {
    id: "million-profit",
    name: "Trading Legend",
    description: "Earn 1 million shawarma profit from trading",
    icon: "👑",
    category: "trading",
    requirement: (state) => state.stats.totalProfit >= 1000000,
  },

  {
    id: "first-food",
    name: "Food Collector",
    description: "Buy your first food item",
    icon: "🍎",
    category: "trading",
    requirement: (state) => {
      const portfolio = state.trading.portfolio;
      return Object.values(portfolio).some((amount: any) => amount > 0);
    },
  },
  {
    id: "diversified",
    name: "Diversified Portfolio",
    description: "Own at least 10 units of 3 different food items",
    icon: "🗂️",
    category: "trading",
    requirement: (state) => {
      const portfolio = state.trading.portfolio;
      const diversifiedItems = Object.values(portfolio).filter(
        (amount: any) => amount >= 10
      );
      return diversifiedItems.length >= 3;
    },
  },
  {
    id: "well-diversified",
    name: "Well Diversified",
    description: "Own at least 10 units of 5 different food items",
    icon: "📊",
    category: "trading",
    requirement: (state) => {
      const portfolio = state.trading.portfolio;
      const diversifiedItems = Object.values(portfolio).filter(
        (amount: any) => amount >= 10
      );
      return diversifiedItems.length >= 5;
    },
  },
  {
    id: "food-baron",
    name: "Food Baron",
    description: "Own at least 25 units of 5 different food items",
    icon: "🏰",
    category: "trading",
    requirement: (state) => {
      const portfolio = state.trading.portfolio;
      const diversifiedItems = Object.values(portfolio).filter(
        (amount: any) => amount >= 25
      );
      return diversifiedItems.length >= 5;
    },
  },
  {
    id: "food-hoarder",
    name: "Food Hoarder",
    description: "Own 100 units of any single food item",
    icon: "🏪",
    category: "trading",
    requirement: (state) => {
      const portfolio = state.trading.portfolio;
      return Object.values(portfolio).some((amount: any) => amount >= 100);
    },
  },
  {
    id: "food-empire",
    name: "Food Empire",
    description: "Own 500 units of any single food item",
    icon: "🏛️",
    category: "trading",
    requirement: (state) => {
      const portfolio = state.trading.portfolio;
      return Object.values(portfolio).some((amount: any) => amount >= 500);
    },
  },
  {
    id: "food-monopoly",
    name: "Food Monopoly",
    description: "Own 1,000 units of any single food item",
    icon: "🌍",
    category: "trading",
    requirement: (state) => {
      const portfolio = state.trading.portfolio;
      return Object.values(portfolio).some((amount: any) => amount >= 1000);
    },
  },

  {
    id: "market-timing",
    name: "Perfect Timing",
    description: "Buy low and sell high with 50% profit margin",
    icon: "⏰",
    category: "trading",
    requirement: (state) => state.stats.bestTradeProfit >= 50,
  },
  {
    id: "day-trader",
    name: "Day Trader",
    description: "Complete 10 trades in a single session",
    icon: "📅",
    category: "trading",
    requirement: (state) => state.stats.tradesInSession >= 10,
  },
  {
    id: "patient-investor",
    name: "Patient Investor",
    description: "Hold a food item for over 5 minutes before selling",
    icon: "⌛",
    category: "trading",
    requirement: (state) => state.stats.longestHoldTime >= 300,
  },
  {
    id: "quick-flip",
    name: "Quick Flip",
    description: "Buy and sell within 10 seconds for profit",
    icon: "⚡",
    category: "trading",
    requirement: (state) => state.stats.quickestProfitableFlip <= 10,
  },

  {
    id: "early-adopter",
    name: "Early Adopter",
    description: "Play for 5 minutes straight",
    icon: "⏳",
    category: "general",
    requirement: (state) => state.stats.playTime >= 300,
  },
  {
    id: "committed-player",
    name: "Committed Player",
    description: "Play for 30 minutes total",
    icon: "🕰️",
    category: "general",
    requirement: (state) => state.stats.playTime >= 1800,
  },
  {
    id: "dedicated-player",
    name: "Dedicated Player",
    description: "Play for 1 hour total",
    icon: "🎮",
    category: "general",
    requirement: (state) => state.stats.playTime >= 3600,
  },
  {
    id: "hardcore-player",
    name: "Hardcore Player",
    description: "Play for 5 hours total",
    icon: "🔥",
    category: "general",
    requirement: (state) => state.stats.playTime >= 18000,
  },
  {
    id: "marathon-player",
    name: "Marathon Player",
    description: "Play for 24 hours total",
    icon: "🏃",
    category: "general",
    requirement: (state) => state.stats.playTime >= 86400,
  },

  {
    id: "reset-courage",
    name: "Fresh Start",
    description: "Reset your progress once",
    icon: "🔄",
    category: "general",
    requirement: (state) => state.stats.totalResets >= 1,
  },
  {
    id: "persistent-player",
    name: "Persistent Player",
    description: "Reset your progress 5 times",
    icon: "🔁",
    category: "general",
    requirement: (state) => state.stats.totalResets >= 5,
  },
  {
    id: "jack-of-all-trades",
    name: "Jack of All Trades",
    description: "Own every type of upgrade and have traded every food item",
    icon: "🎭",
    category: "general",
    requirement: (state) => {
      const hasAllUpgrades = state.stats.totalUpgradesPurchased >= 20;
      const hasAllFoods = Object.keys(state.trading.portfolio).length >= 10;
      return hasAllUpgrades && hasAllFoods;
    },
  },
  {
    id: "balanced-approach",
    name: "Balanced Approach",
    description: "Earn 10,000 from clicking and 10,000 from trading",
    icon: "⚖️",
    category: "general",
    requirement: (state) => {
      const clickingEarnings = state.clicker.totalShawarmasEarned;
      const tradingProfit = state.stats.totalProfit;
      return clickingEarnings >= 10000 && tradingProfit >= 10000;
    },
  },
  {
    id: "efficiency-expert",
    name: "Efficiency Expert",
    description:
      "Maintain 1000+ shawarmas per second while having 100+ shawarmas per click",
    icon: "⚡",
    category: "general",
    requirement: (state) => {
      return (
        state.clicker.shawarmasPerSecond >= 1000 &&
        state.clicker.shawarmasPerClick >= 100
      );
    },
  },
  {
    id: "number-cruncher",
    name: "Number Cruncher",
    description: "Reach 1 billion total shawarmas earned",
    icon: "🔢",
    category: "general",
    requirement: (state) => state.clicker.totalShawarmasEarned >= 1000000000,
  },
  {
    id: "completionist",
    name: "Completionist",
    description: "Unlock 50 achievements",
    icon: "🏆",
    category: "general",
    requirement: () => false, // Calculated dynamically
  },
  {
    id: "achievement-hunter",
    name: "Achievement Hunter",
    description: "Unlock 25 achievements",
    icon: "🎯",
    category: "general",
    requirement: () => false, // Calculated dynamically
  },
  {
    id: "legend",
    name: "Shawarma Legend",
    description: "Unlock 75 achievements",
    icon: "👑",
    category: "general",
    requirement: () => false, // Calculated dynamically
  },
];
