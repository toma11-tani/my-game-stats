# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**My Game Stats** - 阪神タイガースファンのための野球観戦記録アプリ（モバイル専用Webアプリ）

Mobile-first web app for Hanshin Tigers fans to track game attendance, view player stats from attended games, and record game memos.

## Tech Stack

- **Next.js 16.1.1** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui**
- **Supabase** (PostgreSQL database + API)
- **React 19** with `useOptimistic`, `useTransition`

## Common Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:3000

# Production build
npm run build        # Build for production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint
```

## Database Setup

When setting up the database or adding new data:

1. Run `schema.sql` in Supabase SQL Editor (creates tables)
2. Run `seed.sql` to populate sample data

Environment variables required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Architecture

### App Structure (Next.js App Router)

- **`app/layout.tsx`** - Root layout with fonts (Inter, Noto Sans JP) and bottom navigation
- **`app/page.tsx`** - Dashboard showing attendance stats and recent games
- **`app/actions.ts`** - Server Actions for check-in/out and memo updates
- **Routes:**
  - `/games` - Game list with check-in buttons (Optimistic UI)
  - `/games/[id]` - Game detail with scoreboard, batter/pitcher stats tabs, memo editor
  - `/stats` - Player stats aggregated from attended games only
  - `/profile` - User attendance history and stadium statistics

### Data Layer

- **`lib/api.ts`** - All Supabase data fetching functions (see API reference below)
- **`lib/supabase.ts`** - Supabase client initialization
- **`lib/types.ts`** - TypeScript type definitions for DB schema
- **Server Components** - Default for data fetching, minimize client JS
- **Server Actions** - Used for mutations (check-in, memo updates)

## Database Schema

### Core Tables

**`teams`** - Team information (Hanshin, opponents)
- Includes `abbreviation` (1-char for scoreboard), `color_primary`, `color_secondary`

**`players`** - Player roster
- Links to `teams` via `team_id`

**`games`** - Game records
- `opponent_team_id` → `teams`, `result_type` ('win', 'loss', 'draw')
- `home_score`, `away_score`

**`game_stats`** - Scoreboard detail data (NEW)
- `game_id` (UUID): Foreign key referencing `games.id`
- `home_score`, `away_score`: Total scores
- `home_innings`, `away_innings`: Array of scores per inning (Int[])
- `home_hits`, `away_hits`, `home_errors`, `away_errors`: Game statistics

**`game_player_stats`** - Batter stats per game
- `at_bats`, `hits`, `homeruns`, `rbi`, `runs`, `stolen_bases`
- **Note**: No sorting applied - displayed in DB insertion order

**`game_pitcher_stats`** - Pitcher stats per game
- `result`: Supports 'win', 'loss', 'lose', 'save', 'hold', 'S', 'H', '勝', '負' (all converted to Japanese display)
- `innings`, `balls`, `hits`, `strikeouts`, `walks`, `runs`

**`user_attendance`** - User's game attendance
- `user_id` (currently hardcoded as `00000000-0000-0000-0000-000000000000`)
- `game_id`, `memo`

### Key Design Principles

1. **Fully database-driven** - All team info (names, abbreviations, colors) comes from DB, zero hardcoding
2. **Normalized schema** - Foreign keys enforce data integrity
3. **UUIDs** for all primary keys
4. **1:1 relationship** - `games` and `game_stats` linked by same UUID

## Design System

### Colors
- **Background**: `bg-slate-50` (soft, not pure white)
- **Text**: `text-slate-900` (#1e293b, not pure black for readability)
- **Accent**: `#F6D32D` (Hanshin Tigers yellow - use sparingly, only for key actions)
- **Game detail page**: White-based design (`bg-white` cards, `bg-slate-50` background)
- **Headers**: `bg-slate-900` gradient with white text

### Design Principles
- **Apple-inspired refinement**: Proper spacing, shadows, rounded corners
- **Mobile-first**: `max-w-lg` container width throughout
- **High-quality components**: shadcn/ui, avoid cheap-looking UI
- **Restrained color usage**: Tigers yellow only where it matters
- **Accordion UI**: Used for collapsible sections (games by month, stats rankings)

## Key Features & Implementation Notes

### Games List Page (Monthly Accordion)
- **shadcn/ui Accordion** with `type="multiple"` for expanding multiple months
- Games grouped by "YYYY年MM月" format
- Each accordion header shows month and game count
- **Default state**: All months collapsed
- Check-in/out with Optimistic UI

### Game Detail Page (White Theme)
- **Scoreboard**: Displays inning-by-inning scores from `game_stats` table
  - Uses `home_innings` / `away_innings` arrays
  - Falls back to '-' if no `game_stats` record exists
  - Shows total scores, hits, and errors
- **Batter Stats Tab**: Displays in DB insertion order (no sorting)
- **Pitcher Stats Tab**:
  - Result labels: 'win'/'勝' → 勝, 'loss'/'lose'/'負' → 負, 'save'/'S' → S, 'hold'/'H' → H
  - Color-coded badges (yellow=win, red=loss, blue=save, green=hold)
  - Empty column header for result field
- **Memo Editor**: White card design with inline save

### Stats Rankings Page
- **Batting Rankings** (Top 5 each, accordion format):
  - 打率 (Batting Average) - Requires 観戦試合数 × 1 at-bats
  - 本塁打 (Home Runs) - Excludes 0
  - 打点 (RBI) - Excludes 0
  - 盗塁 (Stolen Bases) - Excludes 0
- **Pitching Rankings** (Top 5 each, accordion format):
  - 失点率 (Runs Average) - Requires 観戦試合数 × 0.5 innings, calculated as (runs × 9) / innings
  - 勝利数 (Wins) - Counts 'win' or '勝' results, excludes 0
  - 投球回 (Innings) - Excludes 0
  - 奪三振 (Strikeouts) - Excludes 0
- **Default state**: All accordions collapsed
- **Trophy icons**: Gold (1st), Silver (2nd), Bronze (3rd)
- **Japanese only**: No English abbreviations (AVG, HR, etc.)

### Optimistic UI (Check-in/out)
- Uses React `useOptimistic` hook in `components/game-card.tsx`
- Updates UI instantly before server confirmation
- Server Actions in `app/actions.ts` handle actual DB updates

## API Reference

### Data Fetching (`lib/api.ts`)

All functions use Supabase client and return data or throw errors.

```typescript
// Game data
getAllGamesWithAttendance()              // Games with isAttended flag
getGameDetail(gameId: string)            // Single game with team info
getGameScoreboardData(gameId: string)    // Scoreboard data from game_stats (NEW)

// Player stats
getGameBatterStats(gameId: string)       // Batter stats for game (no sorting)
getGamePitcherStats(gameId: string)      // Pitcher stats for game
getPlayerStatsForAttendedGames()         // Aggregated stats from attended games

// Rankings (NEW)
getBattingRankings()                     // Top 5 rankings for batting categories
getPitchingRankings()                    // Top 5 rankings for pitching categories
getAttendedGamesCount()                  // Count of attended games

// User & team data
getHomeTeam()                            // Hanshin team info
getAttendanceStats()                     // User's win/loss/draw counts
getStadiumStats()                        // Attendance grouped by stadium
getUserMemo(gameId: string)              // User's memo for game
```

### Server Actions (`app/actions.ts`)

```typescript
checkInGame(gameId: string)           // Mark game as attended
checkOutGame(gameId: string)          // Remove attendance
updateMemo(gameId: string, memo: string)  // Save game memo
```

## Important Constraints & Context

### Current Authentication
- **User ID is hardcoded** as `00000000-0000-0000-0000-000000000000`
- No Supabase Auth or RLS implemented
- All users share the same data

### Known Limitations
- No image upload for memos
- Japanese language content throughout the app
- Scoreboard requires manual data entry in `game_stats` table

### Component Architecture
- **Client Components** marked with `"use client"`:
  - `bottom-nav.tsx` - Navigation with active state
  - `game-card.tsx` - Optimistic UI for check-in/out
  - `memo-editor.tsx` - Editable textarea
- **Server Components** - Everything else (default)

### shadcn/ui Components
When adding new UI components, use:
```bash
npx shadcn@latest add <component-name>
```
Components are installed to `components/ui/`
