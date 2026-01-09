import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import {
  getGameDetail,
  getGameBatterStats,
  getGamePitcherStats,
  getUserMemo,
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

async function GameDetailContent({ gameId }: { gameId: string }) {
  const [game, batterStats, pitcherStats, userMemo] = await Promise.all([
    getGameDetail(gameId),
    getGameBatterStats(gameId),
    getGamePitcherStats(gameId),
    getUserMemo(gameId),
  ])

  if (!game) {
    notFound()
  }

  const opponent = game.teams
  const resultLabel = getResultLabel(game.result_type)

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white px-4 pt-6 pb-4">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          試合一覧に戻る
        </Link>

        <div className="text-sm text-slate-400 mb-2">
          {new Date(game.date).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short',
          })}
        </div>
        <div className="text-xs text-slate-500">{game.stadium}</div>
      </div>

      {/* Scoreboard */}
      <div className="px-4 py-4 bg-slate-900">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            {/* Teams & Scores */}
            <div className="space-y-3 mb-4">
              {/* Home Team (阪神) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {resultLabel && (
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        game.result_type === 'win'
                          ? 'bg-[#F6D32D] text-slate-900'
                          : game.result_type === 'loss'
                          ? 'bg-slate-600 text-white'
                          : 'bg-slate-500 text-white'
                      }`}
                    >
                      {resultLabel}
                    </span>
                  )}
                  <span className="text-white font-bold text-lg">阪神</span>
                </div>
                <span className="text-3xl font-bold text-white">
                  {game.home_score ?? '-'}
                </span>
              </div>

              {/* Away Team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2 py-1 rounded bg-transparent w-8"></span>
                  <span className="text-slate-300 font-bold text-lg">
                    {opponent?.name || '相手チーム'}
                  </span>
                </div>
                <span className="text-3xl font-bold text-slate-300">
                  {game.away_score ?? '-'}
                </span>
              </div>
            </div>

            {/* Inning Scoreboard (Placeholder) */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700">
                    <th className="px-2 py-2 font-medium"></th>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((inning) => (
                      <th key={inning} className="px-2 py-2 font-medium">
                        {inning}
                      </th>
                    ))}
                    <th className="px-2 py-2 font-medium border-l border-slate-700">
                      計
                    </th>
                    <th className="px-2 py-2 font-medium">安</th>
                    <th className="px-2 py-2 font-medium">失</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  <tr className="border-b border-slate-700">
                    <td className="px-2 py-2 text-left font-medium">阪神</td>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((inning) => (
                      <td key={inning} className="px-2 py-2">
                        -
                      </td>
                    ))}
                    <td className="px-2 py-2 border-l border-slate-700 font-bold">
                      {game.home_score ?? '-'}
                    </td>
                    <td className="px-2 py-2">-</td>
                    <td className="px-2 py-2">-</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 text-left font-medium text-slate-300">
                      {opponent?.name || '相手'}
                    </td>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((inning) => (
                      <td key={inning} className="px-2 py-2 text-slate-300">
                        -
                      </td>
                    ))}
                    <td className="px-2 py-2 border-l border-slate-700 font-bold text-slate-300">
                      {game.away_score ?? '-'}
                    </td>
                    <td className="px-2 py-2 text-slate-300">-</td>
                    <td className="px-2 py-2 text-slate-300">-</td>
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
          <TabsList className="w-full bg-slate-800 border-slate-700">
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
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-700">
                        <th className="px-3 py-2 text-left font-medium sticky left-0 bg-slate-800">
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
                            className="border-b border-slate-700/50 hover:bg-slate-700/30"
                          >
                            <td className="px-3 py-3 text-white sticky left-0 bg-slate-800">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 text-xs">
                                  {stat.players?.number}
                                </span>
                                <span className="font-medium">
                                  {stat.players?.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-center text-white">
                              {stat.at_bats}
                            </td>
                            <td className="px-3 py-3 text-center text-white">
                              {stat.hits}
                            </td>
                            <td className="px-3 py-3 text-center text-white">
                              {stat.rbi}
                            </td>
                            <td className="px-3 py-3 text-center text-[#F6D32D] font-semibold">
                              {stat.homeruns > 0 ? stat.homeruns : '-'}
                            </td>
                            <td className="px-3 py-3 text-center text-white">
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
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-700">
                        <th className="px-3 py-2 text-left font-medium sticky left-0 bg-slate-800">
                          選手名
                        </th>
                        <th className="px-3 py-2 text-center font-medium">
                          勝敗
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
                        pitcherStats.map((stat: any) => (
                          <tr
                            key={stat.player_id}
                            className="border-b border-slate-700/50 hover:bg-slate-700/30"
                          >
                            <td className="px-3 py-3 text-white sticky left-0 bg-slate-800">
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
                              {stat.result ? (
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                                    stat.result === '勝'
                                      ? 'bg-[#F6D32D] text-slate-900'
                                      : stat.result === '負'
                                      ? 'bg-red-500 text-white'
                                      : 'bg-slate-600 text-white'
                                  }`}
                                >
                                  {stat.result}
                                </span>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-center text-white">
                              {stat.innings ?? '-'}
                            </td>
                            <td className="px-3 py-3 text-center text-white">
                              {stat.balls ?? '-'}
                            </td>
                            <td className="px-3 py-3 text-center text-white">
                              {stat.hits ?? '-'}
                            </td>
                            <td className="px-3 py-3 text-center text-white">
                              {stat.strikeouts ?? '-'}
                            </td>
                            <td className="px-3 py-3 text-center text-white">
                              {stat.walks ?? '-'}
                            </td>
                            <td className="px-3 py-3 text-center text-white">
                              {stat.runs ?? '-'}
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
        </Tabs>
      </div>

      {/* Memo Section */}
      <div className="px-4 py-4 pb-24">
        <MemoEditor gameId={gameId} initialMemo={userMemo?.memo || ''} />
      </div>
    </div>
  )
}

function GameDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 px-4 py-6">
        <div className="h-4 w-32 bg-slate-700 rounded mb-4" />
        <div className="h-6 w-48 bg-slate-700 rounded mb-2" />
        <div className="h-4 w-32 bg-slate-700 rounded" />
      </div>
      <div className="px-4 py-4 space-y-4">
        <div className="h-64 bg-slate-800 rounded-lg" />
        <div className="h-96 bg-slate-800 rounded-lg" />
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
