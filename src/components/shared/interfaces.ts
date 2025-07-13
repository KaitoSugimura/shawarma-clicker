export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (state: any, upgrades?: any, trading?: any) => boolean;
  category: "clicker" | "trading" | "general";
  reward?: string;
}

export interface ClickAnimation {
  id: number;
  x: number;
  y: number;
  timestamp: number;
  amount: number;
}

export interface ProductionAnimation extends ClickAnimation {
  amount: number;
}

export interface AchievementGridProps {
  achievements: Achievement[];
  isUnlocked: (achievement: Achievement) => boolean;
}

export interface CategoryFilterProps {
  selectedCategory: "all" | "clicker" | "trading" | "general";
  onCategoryChange: (
    category: "all" | "clicker" | "trading" | "general"
  ) => void;
  unlockedCount: number;
  totalCount: number;
  getCategoryCount: (category: string) => string;
}

export interface UpgradeItemProps {
  upgrade: any;
  canAfford: boolean;
  onBuy: (upgrade: any) => void;
  isProduction?: boolean;
}

export interface ClickAnimationProps {
  animations: ClickAnimation[];
  shawarmasPerClick: number;
  clickMultiplier: number;
}

export interface ProductionAnimationProps {
  animations: ProductionAnimation[];
}

export interface ShawarmaDisplayProps {
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  shawarmasPerClick: number;
  clickMultiplier: number;
  shawarmasPerSecond: number;
  clickAnimations: ClickAnimation[];
  productionAnimations: ProductionAnimation[];
}

export interface GameStatsProps {
  stats: any;
  gameState: any;
}

export interface EfficiencyStatsProps {
  shawarmasPerSecond: number;
  shawarmasPerClick: number;
  clickMultiplier: number;
}

export interface Notification {
  id: string;
  title?: string;
  message: string;
  type: "achievement" | "upgrade" | "milestone" | "special";
  timestamp?: number;
  duration?: number;
}

export interface FoodItemListProps {
  foods: any[];
  currentPrices: { [key: string]: number };
  selectedFood: string;
  onSelectFood: (foodId: string) => void;
  priceFlash: { [key: string]: "up" | "down" | null };
  portfolio: { [key: string]: number };
}

export interface TradingPanelProps {
  selectedFood: string;
  currentPrice: number;
  tradeAmount: number;
  tradeType: "buy" | "sell";
  portfolio: { [key: string]: number };
  totalValue: number;
  shawarmas: number;
  onTradeAmountChange: (amount: number) => void;
  onTradeTypeChange: (type: "buy" | "sell") => void;
  onExecuteTrade: () => void;
}

export interface MarketSummaryProps {
  portfolio: { [key: string]: number };
  currentPrices: { [key: string]: number };
  totalValue: number;
  profitLoss: number;
}

// Stats and special events interfaces
export interface StatItemProps {
  label: string;
  value: string;
  tooltip?: string;
  color?: string;
  icon?: string;
}

export interface AchievementProgressSectionProps {
  achievementsCount: number;
  totalAchievements?: number;
}

export interface GoldenShawarmaState {
  visible: boolean;
  x: number;
  y: number;
  timeLeft: number;
}

export interface GoldenShawarmaProps {
  goldenShawarma: GoldenShawarmaState | null;
  onGoldenShawarmaClick: () => void;
}

export interface ActiveEventDisplayProps {
  activeEvents: any[]; // Using any[] to avoid circular dependency with SpecialEvent
}
