export interface Team {
  id: string
  name: string
  color_primary: string
  color_secondary: string | null
  created_at: string
}

export interface Player {
  id: string
  team_id: string
  name: string
  position: string
  number: number | null
  created_at: string
}

export interface Game {
  id: string
  date: string
  opponent_team_id: string | null
  stadium: string
  home_score: number | null
  away_score: number | null
  result_type: 'win' | 'loss' | 'draw'
  created_at: string
}

export interface GameStats {
  id: string
  game_id: string
  player_id: string
  // Batting stats
  ab: number
  h: number
  rbi: number
  hr: number
  sb: number
  // Pitching stats
  ip: number
  np: number
  h_allowed: number
  so: number
  bb: number
  er: number
  created_at: string
}

export interface UserAttendance {
  id: string
  user_id: string
  game_id: string
  memo: string | null
  created_at: string
}
