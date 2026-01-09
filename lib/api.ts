import { supabase } from './supabase'
import { Game, Team, GameStats, Player } from './types'

// ユーザーIDは仮で固定（将来的には認証から取得）
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000'

/**
 * ユーザーが観戦した試合一覧を取得
 */
export async function getAttendedGames() {
  const { data, error } = await supabase
    .from('user_attendance')
    .select(`
      game_id,
      memo,
      games (
        id,
        date,
        opponent_team_id,
        stadium,
        home_score,
        away_score,
        result_type,
        teams:opponent_team_id (
          id,
          name,
          color_primary
        )
      )
    `)
    .eq('user_id', TEMP_USER_ID)
    .order('games(date)', { ascending: false })

  if (error) {
    console.error('Error fetching attended games:', error)
    return []
  }

  return data || []
}

/**
 * 観戦成績を計算
 */
export async function getAttendanceStats() {
  const { data, error } = await supabase
    .from('user_attendance')
    .select(`
      games (
        result_type
      )
    `)
    .eq('user_id', TEMP_USER_ID)

  if (error) {
    console.error('Error fetching attendance stats:', error)
    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
    }
  }

  const games = data || []
  const totalGames = games.length
  const wins = games.filter((g: any) => g.games?.result_type === 'win').length
  const losses = games.filter((g: any) => g.games?.result_type === 'loss').length
  const draws = games.filter((g: any) => g.games?.result_type === 'draw').length
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 1000) / 10 : 0

  return {
    totalGames,
    wins,
    losses,
    draws,
    winRate,
  }
}

/**
 * 特定の試合の選手成績を取得
 */
export async function getGameStats(gameId: string) {
  const { data, error } = await supabase
    .from('game_stats')
    .select(`
      *,
      players (
        id,
        name,
        position,
        number
      )
    `)
    .eq('game_id', gameId)
    .order('players(number)', { ascending: true })

  if (error) {
    console.error('Error fetching game stats:', error)
    return []
  }

  return data || []
}

/**
 * 選手ごとの観戦時通算成績を取得
 */
export async function getPlayerAttendanceStats() {
  // ユーザーが観戦した試合のIDリストを取得
  const { data: attendedGames, error: gamesError } = await supabase
    .from('user_attendance')
    .select('game_id')
    .eq('user_id', TEMP_USER_ID)

  if (gamesError || !attendedGames) {
    console.error('Error fetching attended games:', gamesError)
    return []
  }

  const gameIds = attendedGames.map((g) => g.game_id)

  // それらの試合の選手成績を取得
  const { data, error } = await supabase
    .from('game_stats')
    .select(`
      *,
      players (
        id,
        name,
        position,
        number
      )
    `)
    .in('game_id', gameIds)

  if (error) {
    console.error('Error fetching player stats:', error)
    return []
  }

  // 選手ごとに集計
  const playerStatsMap = new Map()

  data?.forEach((stat: any) => {
    const playerId = stat.player_id
    if (!playerStatsMap.has(playerId)) {
      playerStatsMap.set(playerId, {
        player: stat.players,
        games: 0,
        ab: 0,
        h: 0,
        hr: 0,
        rbi: 0,
        sb: 0,
        avg: 0,
      })
    }

    const playerStats = playerStatsMap.get(playerId)
    playerStats.games += 1
    playerStats.ab += stat.ab || 0
    playerStats.h += stat.h || 0
    playerStats.hr += stat.hr || 0
    playerStats.rbi += stat.rbi || 0
    playerStats.sb += stat.sb || 0
    playerStats.avg = playerStats.ab > 0
      ? Math.round((playerStats.h / playerStats.ab) * 1000) / 1000
      : 0
  })

  return Array.from(playerStatsMap.values())
    .sort((a, b) => b.avg - a.avg)
}

/**
 * すべての試合を取得（観戦済みステータス付き）
 */
export async function getAllGamesWithAttendance() {
  // すべての試合を取得
  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select(`
      id,
      date,
      opponent_team_id,
      stadium,
      home_score,
      away_score,
      result_type,
      teams:opponent_team_id (
        id,
        name,
        color_primary
      )
    `)
    .order('date', { ascending: false })

  if (gamesError) {
    console.error('Error fetching games:', gamesError)
    return []
  }

  // ユーザーが観戦した試合のIDリストを取得
  const { data: attendedGames, error: attendanceError } = await supabase
    .from('user_attendance')
    .select('game_id')
    .eq('user_id', TEMP_USER_ID)

  if (attendanceError) {
    console.error('Error fetching attendance:', attendanceError)
  }

  const attendedGameIds = new Set(
    attendedGames?.map((a) => a.game_id) || []
  )

  // 観戦済みフラグを追加
  return (games || []).map((game) => ({
    ...game,
    isAttended: attendedGameIds.has(game.id),
  }))
}
