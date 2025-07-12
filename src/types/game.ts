export interface GameState {
  shawarmas: number;
  shawarmasPerSecond: number;
  shawarmasPerClick: number;
  totalShawarmasEarned: number;
  prestige: number;
  achievements: string[];
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  owned: number;
  baseProduction: number;
  costMultiplier: number;
  maxOwned?: number;
  icon: string;
}

export interface ClickUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  owned: boolean;
  multiplier: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: (state: GameState, upgrades: Upgrade[]) => boolean;
  reward?: string;
}

export interface GameStats {
  totalClicks: number;
  gameStartTime: number;
  bestClickRate: number;
  totalUpgradesPurchased: number;
}

export interface SpecialEvent {
  id: string;
  type: "golden_shawarma" | "frenzy" | "lucky_bonus";
  duration: number;
  multiplier: number;
  message: string;
  startTime: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "achievement" | "upgrade" | "milestone";
  timestamp: number;
}
