import { createClient } from '@/utils/supabase/server'
import { Game, Team, GameStats, Player } from './types'

/**
 * ユーザーが観戦した試合一覧を取得
 */
export async function getAttendedGames() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

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
          abbreviation,
          color_primary,
          color_secondary
        )
      )
    `)
    .eq('user_id', user.id)
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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
    }
  }

  const { data, error } = await supabase
    .from('user_attendance')
    .select(`
      games (
        result_type
      )
    `)
    .eq('user_id', user.id)

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
 * すべての試合を取得（観戦済みステータス付き）
 */
export async function getAllGamesWithAttendance() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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
        abbreviation,
        color_primary,
        color_secondary
      )
    `)
    .order('date', { ascending: false })

  if (gamesError) {
    console.error('Error fetching games:', gamesError)
    return []
  }

  if (!user) {
    // ログインしていない場合はすべて未観戦扱い
    return (games || []).map((game) => ({
      ...game,
      isAttended: false,
    }))
  }

  // ユーザーが観戦した試合のIDリストを取得
  const { data: attendedGames, error: attendanceError } = await supabase
    .from('user_attendance')
    .select('game_id')
    .eq('user_id', user.id)

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

/**
 * ユーザーの観戦履歴を詳細に取得（プロフィールページ用）
 */
export async function getAttendanceHistory() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('user_attendance')
    .select(`
      id,
      game_id,
      memo,
      created_at,
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
          abbreviation,
          color_primary,
          color_secondary
        )
      )
    `)
    .eq('user_id', user.id)
    .order('games(date)', { ascending: false })

  if (error) {
    console.error('Error fetching attendance history:', error)
    return []
  }

  return data || []
}

/**
 * 球場別の観戦統計を取得
 */
export async function getStadiumStats() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('user_attendance')
    .select(`
      games (
        stadium,
        result_type
      )
    `)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching stadium stats:', error)
    return []
  }

  // 球場ごとに集計
  const stadiumMap = new Map()

  data?.forEach((attendance: any) => {
    const game = attendance.games
    const stadium = game?.stadium || '不明'

    if (!stadiumMap.has(stadium)) {
      stadiumMap.set(stadium, {
        stadium,
        total: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      })
    }

    const stats = stadiumMap.get(stadium)
    stats.total += 1

    if (game?.result_type === 'win') stats.wins += 1
    else if (game?.result_type === 'loss') stats.losses += 1
    else if (game?.result_type === 'draw') stats.draws += 1
  })

  return Array.from(stadiumMap.values()).sort((a, b) => b.total - a.total)
}

/**
 * 試合詳細情報を取得
 */
export async function getGameDetail(gameId: string) {
  const supabase = await createClient()

  // UUIDバリデーション
  if (!gameId || gameId === 'undefined' || gameId === 'null') {
    console.error('Invalid game ID:', gameId)
    return null
  }

  const { data, error } = await supabase
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
        abbreviation,
        color_primary,
        color_secondary
      )
    `)
    .eq('id', gameId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching game detail:', error)
    return null
  }

  return data
}

/**
 * 試合の打者成績を取得
 */
export async function getGameBatterStats(gameId: string) {
  const supabase = await createClient()

  // UUIDバリデーション
  if (!gameId || gameId === 'undefined' || gameId === 'null') {
    console.error('Invalid game ID for batter stats:', gameId)
    return []
  }

  const { data, error } = await supabase
    .from('game_player_stats')
    .select(`
      player_id,
      at_bats,
      hits,
      homeruns,
      rbi,
      runs,
      stolen_bases,
      players (
        id,
        name,
        position,
        number
      )
    `)
    .eq('game_id', gameId)

  if (error) {
    console.error('Error fetching batter stats:', error)
    return []
  }

  return data || []
}

/**
 * 試合の投手成績を取得
 */
export async function getGamePitcherStats(gameId: string) {
  const supabase = await createClient()

  // UUIDバリデーション
  if (!gameId || gameId === 'undefined' || gameId === 'null') {
    console.error('Invalid game ID for pitcher stats:', gameId)
    return []
  }

  const { data, error } = await supabase
    .from('game_pitcher_stats')
    .select(`
      player_id,
      result,
      innings,
      balls,
      hits,
      strikeouts,
      walks,
      runs,
      players (
        id,
        name,
        position,
        number
      )
    `)
    .eq('game_id', gameId)

  if (error) {
    console.error('Error fetching pitcher stats:', error)
    return []
  }

  return data || []
}

/**
 * ユーザーの観戦メモを取得
 */
export async function getUserMemo(gameId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // UUIDバリデーション
  if (!gameId || gameId === 'undefined' || gameId === 'null') {
    console.error('Invalid game ID for user memo:', gameId)
    return null
  }

  const { data, error } = await supabase
    .from('user_attendance')
    .select('id, memo')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching user memo:', error)
    return null
  }

  return data
}

/**
 * ホームチーム（阪神タイガース）の情報を取得
 */
export async function getHomeTeam() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('teams')
    .select('id, name, abbreviation, color_primary, color_secondary')
    .eq('name', '阪神')
    .maybeSingle()

  if (error) {
    console.error('Error fetching home team:', error)
    return null
  }

  return data
}

/**
 * 試合のスコアボードデータを取得
 * @param gameId - games.id と同じUUID
 */
export async function getGameScoreboardData(gameId: string) {
  const supabase = await createClient()

  // UUIDバリデーション
  if (!gameId || gameId === 'undefined' || gameId === 'null') {
    console.error('Invalid game ID for scoreboard data:', gameId)
    return null
  }

  const { data, error } = await supabase
    .from('game_stats')
    .select('*')
    .eq('game_id', gameId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching scoreboard data:', error)
    return null
  }

  return data
}

/**
 * 観戦試合数を取得
 */
export async function getAttendedGamesCount() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return 0
  }

  const { data, error } = await supabase
    .from('user_attendance')
    .select('game_id')
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching attended games count:', error)
    return 0
  }

  return data?.length || 0
}

/**
 * 打撃ランキングを取得
 */
export async function getBattingRankings() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 観戦試合数を取得
  const attendedGamesCount = await getAttendedGamesCount()
  const qualifyingAtBats = attendedGamesCount * 1 // 規定打席

  if (!user) {
    return {
      battingAverage: [],
      homeruns: [],
      rbi: [],
      stolenBases: [],
      qualifyingAtBats,
      attendedGamesCount,
    }
  }

  // ユーザーが観戦した試合のIDリストを取得
  const { data: attendedGames, error: gamesError } = await supabase
    .from('user_attendance')
    .select('game_id')
    .eq('user_id', user.id)

  if (gamesError || !attendedGames || attendedGames.length === 0) {
    return {
      battingAverage: [],
      homeruns: [],
      rbi: [],
      stolenBases: [],
      qualifyingAtBats,
      attendedGamesCount,
    }
  }

  const gameIds = attendedGames.map((g) => g.game_id)

  // 選手成績を取得
  const { data, error } = await supabase
    .from('game_player_stats')
    .select(`
      player_id,
      at_bats,
      hits,
      homeruns,
      rbi,
      stolen_bases,
      players (
        id,
        name,
        position,
        number
      )
    `)
    .in('game_id', gameIds)

  if (error) {
    console.error('Error fetching batting stats:', error)
    return {
      battingAverage: [],
      homeruns: [],
      rbi: [],
      stolenBases: [],
      qualifyingAtBats,
      attendedGamesCount,
    }
  }

  // 選手ごとに集計
  const playerStatsMap = new Map()

  data?.forEach((stat: any) => {
    const playerId = stat.player_id
    if (!playerStatsMap.has(playerId)) {
      playerStatsMap.set(playerId, {
        player: stat.players,
        atBats: 0,
        hits: 0,
        homeruns: 0,
        rbi: 0,
        stolenBases: 0,
      })
    }

    const playerStats = playerStatsMap.get(playerId)
    playerStats.atBats += stat.at_bats || 0
    playerStats.hits += stat.hits || 0
    playerStats.homeruns += stat.homeruns || 0
    playerStats.rbi += stat.rbi || 0
    playerStats.stolenBases += stat.stolen_bases || 0
  })

  const allPlayers = Array.from(playerStatsMap.values())

  // 打率ランキング（規定打席以上、打率順）
  const battingAverage = allPlayers
    .filter((p) => p.atBats >= qualifyingAtBats)
    .map((p) => ({
      ...p,
      avg: p.atBats > 0 ? p.hits / p.atBats : 0,
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5)

  // 本塁打ランキング（0本除外、本塁打順）
  const homeruns = allPlayers
    .filter((p) => p.homeruns > 0)
    .sort((a, b) => b.homeruns - a.homeruns)
    .slice(0, 5)

  // 打点ランキング（0打点除外、打点順）
  const rbi = allPlayers
    .filter((p) => p.rbi > 0)
    .sort((a, b) => b.rbi - a.rbi)
    .slice(0, 5)

  // 盗塁ランキング（0盗塁除外、盗塁順）
  const stolenBases = allPlayers
    .filter((p) => p.stolenBases > 0)
    .sort((a, b) => b.stolenBases - a.stolenBases)
    .slice(0, 5)

  return {
    battingAverage,
    homeruns,
    rbi,
    stolenBases,
    qualifyingAtBats,
    attendedGamesCount,
  }
}

/**
 * 投手ランキングを取得
 */
export async function getPitchingRankings() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 観戦試合数を取得
  const attendedGamesCount = await getAttendedGamesCount()
  const qualifyingInnings = attendedGamesCount * 0.5 // 規定投球回

  if (!user) {
    return {
      earnedRunAverage: [],
      wins: [],
      innings: [],
      strikeouts: [],
      qualifyingInnings,
      attendedGamesCount,
    }
  }

  // ユーザーが観戦した試合のIDリストを取得
  const { data: attendedGames, error: gamesError } = await supabase
    .from('user_attendance')
    .select('game_id')
    .eq('user_id', user.id)

  if (gamesError || !attendedGames || attendedGames.length === 0) {
    return {
      earnedRunAverage: [],
      wins: [],
      innings: [],
      strikeouts: [],
      qualifyingInnings,
      attendedGamesCount,
    }
  }

  const gameIds = attendedGames.map((g) => g.game_id)

  // 投手成績を取得
  const { data, error } = await supabase
    .from('game_pitcher_stats')
    .select(`
      player_id,
      result,
      innings,
      balls,
      hits,
      strikeouts,
      walks,
      runs,
      players (
        id,
        name,
        position,
        number
      )
    `)
    .in('game_id', gameIds)

  if (error) {
    console.error('Error fetching pitching stats:', error)
    return {
      earnedRunAverage: [],
      wins: [],
      innings: [],
      strikeouts: [],
      qualifyingInnings,
      attendedGamesCount,
    }
  }

  // 選手ごとに集計
  const playerStatsMap = new Map()

  data?.forEach((stat: any) => {
    const playerId = stat.player_id
    if (!playerStatsMap.has(playerId)) {
      playerStatsMap.set(playerId, {
        player: stat.players,
        wins: 0,
        innings: 0,
        strikeouts: 0,
        runs: 0,
      })
    }

    const playerStats = playerStatsMap.get(playerId)

    // 勝利数のカウント（resultが'勝'または'win'の場合）
    if (stat.result === '勝' || stat.result === 'win') {
      playerStats.wins += 1
    }

    playerStats.innings += stat.innings || 0
    playerStats.strikeouts += stat.strikeouts || 0
    playerStats.runs += stat.runs || 0
  })

  const allPitchers = Array.from(playerStatsMap.values())

  // 失点率ランキング（規定投球回以上、失点率順・低い順）
  const earnedRunAverage = allPitchers
    .filter((p) => p.innings >= qualifyingInnings)
    .map((p) => ({
      ...p,
      era: p.innings > 0 ? (p.runs * 9) / p.innings : 0,
    }))
    .sort((a, b) => a.era - b.era) // 低い順
    .slice(0, 5)

  // 勝利数ランキング（0勝除外、勝利数順）
  const wins = allPitchers
    .filter((p) => p.wins > 0)
    .sort((a, b) => b.wins - a.wins)
    .slice(0, 5)

  // 投球回ランキング（投球回順）
  const innings = allPitchers
    .filter((p) => p.innings > 0)
    .sort((a, b) => b.innings - a.innings)
    .slice(0, 5)

  // 奪三振ランキング（0奪三振除外、奪三振順）
  const strikeouts = allPitchers
    .filter((p) => p.strikeouts > 0)
    .sort((a, b) => b.strikeouts - a.strikeouts)
    .slice(0, 5)

  return {
    earnedRunAverage,
    wins,
    innings,
    strikeouts,
    qualifyingInnings,
    attendedGamesCount,
  }
}
