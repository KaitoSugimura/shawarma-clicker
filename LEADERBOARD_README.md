# Leaderboard System

## Overview

The leaderboard system allows players to compete against each other based on their game progress. It tracks various metrics and provides rankings across different categories.

## Features

### Categories
- **Total Shawarmas**: Based on lifetime shawarma earnings
- **Shawarmas Per Second**: Current production rate
- **Prestige Level**: Number of prestige resets completed
- **Achievements**: Total number of achievements unlocked

### Scoring System
The leaderboard uses a weighted scoring system that considers:
- Total Shawarmas Earned (weight: 1x)
- Shawarmas Per Second (weight: 100x)
- Prestige Level (weight: 1,000,000x)
- Achievement Count (weight: 10,000x)

### Components

#### LeaderboardPanel
Main component displaying the leaderboard with:
- Category selection dropdown
- User's current rank (if logged in)
- Top 50 players list
- Real-time ranking updates

#### LeaderboardStats
Statistics panel showing:
- Global player count
- User's rank and percentile
- Progress indicators
- Performance tips

#### LeaderboardService
Backend service handling:
- User entry updates
- Leaderboard data fetching
- Rank calculations
- Firebase Firestore operations

### Database Structure

The leaderboard data is stored in Firebase Firestore:

```typescript
Collection: "leaderboard_entries"
Document ID: user.uid
Fields:
- userId: string
- displayName: string
- photoURL?: string
- score: number (calculated)
- totalShawarmas: number
- shawarmasPerSecond: number
- prestige: number
- achievementCount: number
- lastUpdated: number
- serverTimestamp: Firestore timestamp
```

### Auto-Updates

- User entries are automatically updated when:
  - Manual game saves occur
  - Every 5th auto-save (to reduce server load)
- Leaderboard refreshes every time a user switches categories
- Real-time rank calculations based on current data

### Performance Considerations

- Limited to top 50 entries for display performance
- Debounced updates to prevent excessive Firebase writes
- Cached user rank calculations
- Optimized queries with proper indexing

### Security

- All writes require user authentication
- User can only update their own leaderboard entry
- Firebase security rules enforce data validation
- Protection against cheating through server-side validation

### Testing

For development purposes, a test data generator is available:
- Only visible in development mode
- Generates realistic test data for current user
- Helps verify leaderboard functionality

## Usage

### Integration

The leaderboard is integrated into the main game through:

1. **GameContext**: Automatic updates during save operations
2. **App.tsx**: Tab navigation to leaderboard panel
3. **Firebase**: Real-time data synchronization

### User Experience

- Seamless integration with existing game flow
- Visual feedback for rank changes
- Competitive elements to encourage engagement
- Achievement-based progression tracking

## Future Enhancements

Potential improvements:
- Seasonal leaderboards
- Guild/team competitions
- Special event categories
- Detailed player profiles
- Real-time notifications for rank changes
- Anti-cheat measures
- Leaderboard rewards system
