export interface LeaderboardEntry {
  id: string;
  userId: string;
  displayName: string;
  photoURL?: string;
  score: number;
  rank: number;
  totalShawarmas: number;
  shawarmasPerSecond: number;
  prestige: number;
  achievementCount: number;
  lastUpdated: number;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  totalPlayers: number;
  lastUpdated: number;
  userRank?: number;
}

export type LeaderboardCategory = 
  | 'totalShawarmas'
  | 'shawarmasPerSecond'
  | 'prestige'
  | 'achievements';

export interface LeaderboardFilters {
  category: LeaderboardCategory;
  timeframe?: 'all' | 'week' | 'month';
  limit: number;
}
