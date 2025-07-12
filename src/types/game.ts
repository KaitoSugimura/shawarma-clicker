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
  shawarmasPerSecond: number; // Add this property
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
  shawarmasPerClick: number; // Add this property
  icon: string; // Add this property
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
  name: string;
  type: "golden_shawarma" | "frenzy" | "lucky_bonus";
  duration: number;
  multiplier: number;
  message: string;
  startTime: number;
}

export interface Notification {
  id: string;
  title?: string;
  message: string;
  type: "achievement" | "upgrade" | "milestone" | "special";
  timestamp?: number;
  duration?: number;
}
