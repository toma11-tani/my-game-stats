import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import {
  getGameDetail,
  getGameBatterStats,
  getGamePitcherStats,
  getUserMemo,
  getHomeTeam,
  getGameScoreboardData,
} from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { MemoEditor } from '@/components/memo-editor'

function getResultLabel(resultType: string | null) {
  if (!resultType) return null
  switch (resultType) {
    case 'win':
      return '勝'
    case 'loss':
      return '負'
    case 'draw':
      return '引'
    default:
      return null
  }
}

function getPitcherResultLabel(result: string | null) {
  if (!result) return '-'
  switch (result) {
    case 'win':
    case '勝':
      return '勝'
    case 'save':
    case 'S':
      return 'S'
    case 'hold':
    case 'H':
      return 'H'
    case 'lose':
    case 'loss':
    case '負':
      return '負'
    case 'none':
    case '-':
      return '-'
    default:
      return result
  }
}

async function GameDetailContent({ gameId }: { gameId: string }) {
  // 試合詳細とスコアボードデータを並行取得
  const [game, batterStats, pitcherStats, userMemo, homeTeam, scoreboardData] = await Promise.all([
    getGameDetail(gameId),
    getGameBatterStats(gameId),
    getGamePitcherStats(gameId),
    getUserMemo(gameId),
    getHomeTeam(),
    getGameScoreboardData(gameId), // game_stats.game_id は games.id と同じUUID
  ])

  if (!game) {
    notFound()
  }

  const opponent = game.teams
  const resultLabel = getResultLabel(game.result_type)

  // スコアボードデータを処理（配列形式）
  const homeInnings = scoreboardData?.home_innings || Array(9).fill('-')
  const awayInnings = scoreboardData?.away_innings || Array(9).fill('-')
  const homeHits = scoreboardData?.home_hits ?? '-'
  const homeErrors = scoreboardData?.home_errors ?? '-'
  const awayHits = scoreboardData?.away_hits ?? '-'
  const awayErrors = scoreboardData?.away_errors ?? '-'

  // イニング配列が9未満の場合は'-'で埋める
  const paddedHomeInnings = [...homeInnings]
  const paddedAwayInnings = [...awayInnings]
  while (paddedHomeInnings.length < 9) paddedHomeInnings.push('-')
  while (paddedAwayInnings.length < 9) paddedAwayInnings.push('-')

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white px-4 pt-6 pb-4">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            試合一覧に戻る
          </Link>

          <div className="text-sm text-slate-300 mb-2">
            {new Date(game.date).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'short',
            })}
          </div>
          <div className="text-xs text-slate-400">{game.stadium}</div>
        </div>

        {/* Scoreboard */}
        <div className="px-4 py-4 bg-slate-50">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-3">
              {/* Inning Scoreboard */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center">
                  <thead>
                    <tr className="text-slate-600 border-b border-slate-200 bg-slate-50">
                      <th className="px-2 py-2 font-medium"></th>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((inning) => (
                        <th key={inning} className="px-2 py-2 font-medium">
                          {inning}
                        </th>
                      ))}
                      <th className="px-2 py-2 font-medium border-l border-slate-200">
                        計
                      </th>
                      <th className="px-2 py-2 font-medium">安</th>
                      <th className="px-2 py-2 font-medium">失</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-900">
                    <tr className="border-b border-slate-200">
                      <td
                        className="px-2 py-2 text-center font-bold"
                        style={{
                          color: homeTeam?.color_primary || '#F6D32D',
                        }}
                      >
                        {homeTeam?.abbreviation || '神'}
                      </td>
                      {paddedHomeInnings.map((score, index) => (
                        <td key={index} className="px-2 py-2">
                          {score}
                        </td>
                      ))}
                      <td className="px-2 py-2 border-l border-slate-200 font-bold">
                        {scoreboardData?.home_score ?? game.home_score ?? '-'}
                      </td>
                      <td className="px-2 py-2">{homeHits}</td>
                      <td className="px-2 py-2">{homeErrors}</td>
                    </tr>
                    <tr>
                      <td
                        className="px-2 py-2 text-center font-bold"
                        style={{
                          color: opponent?.color_primary || '#64748b',
                        }}
                      >
                        {opponent?.abbreviation || '-'}
                      </td>
                      {paddedAwayInnings.map((score, index) => (
                        <td key={index} className="px-2 py-2 text-slate-700">
                          {score}
                        </td>
                      ))}
                      <td className="px-2 py-2 border-l border-slate-200 font-bold text-slate-700">
                        {scoreboardData?.away_score ?? game.away_score ?? '-'}
                      </td>
                      <td className="px-2 py-2 text-slate-700">{awayHits}</td>
                      <td className="px-2 py-2 text-slate-700">{awayErrors}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Tabs */}
        <div className="px-4 py-4">
          <Tabs defaultValue="batters" className="w-full">
            <TabsList className="w-full bg-slate-200">
              <TabsTrigger
                value="batters"
                className="flex-1 data-[state=active]:bg-[#F6D32D] data-[state=active]:text-slate-900"
              >
                打者成績
              </TabsTrigger>
              <TabsTrigger
                value="pitchers"
                className="flex-1 data-[state=active]:bg-[#F6D32D] data-[state=active]:text-slate-900"
              >
                投手成績
              </TabsTrigger>
            </TabsList>

            {/* Batters Tab */}
            <TabsContent value="batters" className="mt-4">
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-slate-600 border-b border-slate-200 bg-slate-50">
                          <th className="px-3 py-2 text-left font-medium sticky left-0 bg-slate-50">
                            選手名
                          </th>
                          <th className="px-3 py-2 text-center font-medium">
                            打数
                          </th>
                          <th className="px-3 py-2 text-center font-medium">
                            安打
                          </th>
                          <th className="px-3 py-2 text-center font-medium">
                            打点
                          </th>
                          <th className="px-3 py-2 text-center font-medium">
                            本塁打
                          </th>
                          <th className="px-3 py-2 text-center font-medium">
                            盗塁
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {batterStats.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-3 py-8 text-center text-slate-500"
                            >
                              打者成績データがありません
                            </td>
                          </tr>
                        ) : (
                          batterStats.map((stat: any) => (
                            <tr
                              key={stat.player_id}
                              className="border-b border-slate-100 hover:bg-slate-50"
                            >
                              <td className="px-3 py-3 text-slate-900 sticky left-0 bg-white">
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-500 text-xs">
                                    {stat.players?.number}
                                  </span>
                                  <span className="font-medium">
                                    {stat.players?.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-center text-slate-900">
                                {stat.at_bats}
                              </td>
                              <td className="px-3 py-3 text-center text-slate-900">
                                {stat.hits}
                              </td>
                              <td className="px-3 py-3 text-center text-slate-900">
                                {stat.rbi}
                              </td>
                              <td className="px-3 py-3 text-center text-red-600 font-semibold">
                                {stat.homeruns > 0 ? stat.homeruns : '-'}
                              </td>
                              <td className="px-3 py-3 text-center text-slate-900">
                                {stat.stolen_bases > 0 ? stat.stolen_bases : '-'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pitchers Tab */}
            <TabsContent value="pitchers" className="mt-4">
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-slate-600 border-b border-slate-200 bg-slate-50">
                          <th className="px-3 py-2 text-left font-medium sticky left-0 bg-slate-50">
                            選手名
                          </th>
                          <th className="px-3 py-2 text-center font-medium">
                            {/* 空欄 */}
                          </th>
                          <th className="px-3 py-2 text-center font-medium">
                            回
                          </th>
                          <th className="px-3 py-2 text-center font-medium">
                            球数
                          </th>
                          <th className="px-3 py-2 text-center font-medium">
                            被安打
                          </th>
                          <th className="px-3 py-2 text-center font-medium">
                            奪三振
                          </th>
                          <th className="px-3 py-2 text-center font-medium">
                            与四球
                          </th>
                          <th className="px-3 py-2 text-center font-medium">
                            失点
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pitcherStats.length === 0 ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="px-3 py-8 text-center text-slate-500"
                            >
                              投手成績データがありません
                            </td>
                          </tr>
                        ) : (
                          pitcherStats.map((stat: any) => {
                            const resultLabel = getPitcherResultLabel(stat.result)
                            return (
                              <tr
                                key={stat.player_id}
                                className="border-b border-slate-100 hover:bg-slate-50"
                              >
                                <td className="px-3 py-3 text-slate-900 sticky left-0 bg-white">
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-500 text-xs">
                                      {stat.players?.number}
                                    </span>
                                    <span className="font-medium">
                                      {stat.players?.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-3 py-3 text-center">
                                  {resultLabel !== '-' ? (
                                    <span
                                      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                                        resultLabel === '勝'
                                          ? 'bg-[#F6D32D] text-slate-900'
                                          : resultLabel === '負'
                                          ? 'bg-red-500 text-white'
                                          : resultLabel === 'S'
                                          ? 'bg-blue-500 text-white'
                                          : resultLabel === 'H'
                                          ? 'bg-green-500 text-white'
                                          : 'bg-slate-300 text-slate-700'
                                      }`}
                                    >
                                      {resultLabel}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </td>
                                <td className="px-3 py-3 text-center text-slate-900">
                                  {stat.innings ?? '-'}
                                </td>
                                <td className="px-3 py-3 text-center text-slate-900">
                                  {stat.balls ?? '-'}
                                </td>
                                <td className="px-3 py-3 text-center text-slate-900">
                                  {stat.hits ?? '-'}
                                </td>
                                <td className="px-3 py-3 text-center text-slate-900">
                                  {stat.strikeouts ?? '-'}
                                </td>
                                <td className="px-3 py-3 text-center text-slate-900">
                                  {stat.walks ?? '-'}
                                </td>
                                <td className="px-3 py-3 text-center text-slate-900">
                                  {stat.runs ?? '-'}
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Memo Section */}
        <div className="px-4 py-4 pb-24">
          <MemoEditor gameId={gameId} initialMemo={userMemo?.memo || ''} />
        </div>
      </div>
    </div>
  )
}

function GameDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto">
        <div className="bg-slate-800 px-4 py-6">
          <div className="h-4 w-32 bg-slate-700 rounded mb-4" />
          <div className="h-6 w-48 bg-slate-700 rounded mb-2" />
          <div className="h-4 w-32 bg-slate-700 rounded" />
        </div>
        <div className="px-4 py-4 space-y-4">
          <div className="h-64 bg-slate-200 rounded-lg" />
          <div className="h-96 bg-slate-200 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  // Next.js 15対応：paramsが非同期の場合とそうでない場合の両方に対応
  const resolvedParams = await Promise.resolve(params)

  return (
    <Suspense fallback={<GameDetailLoading />}>
      <GameDetailContent gameId={resolvedParams.id} />
    </Suspense>
  )
}
