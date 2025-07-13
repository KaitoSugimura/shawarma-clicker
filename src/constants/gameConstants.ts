export const SPECIAL_EVENTS = {
  GOLDEN_SHAWARMA: {
    DURATION: 13000,
    SPAWN_CHANCE: 0.1,
    CHECK_INTERVAL: 5000,
    BONUS_MIN: 0.1,
    BONUS_MAX: 0.25,
  },
  CLICK_FRENZY: {
    DURATION: 77000,
    MULTIPLIER: 7,
  },
  LUCKY_BONUS: {
    DURATION: 1000,
    MULTIPLIER: 1,
    BONUS_PERCENTAGE: 0.15,
  },
  CHECK_INTERVAL: 10000,
  RANDOM_EVENT_CHANCE: 0.05,
} as const;

export const ACHIEVEMENT_TOTAL = 42;

export const MILESTONES = {
  clicks: [
    { threshold: 10, message: "You're getting the hang of it! 10 clicks!" },
    { threshold: 100, message: "Click master! 100 clicks achieved!" },
    { threshold: 1000, message: "Thousand clicks! Your fingers are strong!" },
    {
      threshold: 10000,
      message: "Ten thousand clicks! Incredible dedication!",
    },
  ],
  shawarmas: [
    { threshold: 10, message: "First batch complete! 10 shawarmas made!" },
    { threshold: 100, message: "Century of shawarmas! 100 made!" },
    { threshold: 1000, message: "Thousand shawarmas! You're a pro!" },
    { threshold: 10000, message: "Ten thousand shawarmas! Master chef!" },
    { threshold: 100000, message: "One hundred thousand shawarmas! Legend!" },
  ],
} as const;

export const NOTIFICATION_AUTO_CLOSE_DELAY = 3000;

export const ANIMATION_CLEANUP_DELAY = 600; // Reduced for better performance
export const MAX_CLICK_ANIMATIONS = 8; // Increased slightly for better visual feedback
export const MAX_PRODUCTION_ANIMATIONS = 5; // Increased for better visual feedback
