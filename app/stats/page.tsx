import { Suspense } from 'react'
import { getPlayerStatsForAttendedGames } from '@/lib/api'
import { PlayerStatCard } from '@/components/player-stat-card'
import { BarChart3, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

async function StatsContent() {
  const playerStats = await getPlayerStatsForAttendedGames()

  // 全体の統計を計算
  const totalAtBats = playerStats.reduce((sum, p) => sum + p.atBats, 0)
  const totalHits = playerStats.reduce((sum, p) => sum + p.hits, 0)
  const totalHomeruns = playerStats.reduce((sum, p) => sum + p.homeruns, 0)
  const totalRbi = playerStats.reduce((sum, p) => sum + p.rbi, 0)
  const overallAvg = totalAtBats > 0
    ? (totalHits / totalAtBats).toFixed(3)
    : '.000'

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white px-6 pt-8 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-6 h-6" />
          <h1 className="text-2xl font-bold">選手成績</h1>
        </div>
        <p className="text-slate-300 text-sm">観戦時の打撃成績</p>
      </div>

      {/* Overall Stats */}
      <div className="px-4 -mt-4 mb-6">
        <Card className="bg-white shadow-md border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-slate-700">
                チーム通算（観戦時）
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-[#F6D32D]">
                  {overallAvg}
                </div>
                <div className="text-xs text-slate-500 mt-1">打率</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {totalHits}
                </div>
                <div className="text-xs text-slate-500 mt-1">安打</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {totalHomeruns}
                </div>
                <div className="text-xs text-slate-500 mt-1">本塁打</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {totalRbi}
                </div>
                <div className="text-xs text-slate-500 mt-1">打点</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Player Stats List */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-3">
          打率ランキング
        </h2>

        {playerStats.length === 0 ? (
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-8 text-center">
              <p className="text-slate-500">
                まだ選手成績データがありません
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {playerStats.map((playerStat, index) => (
              <PlayerStatCard
                key={playerStat.player.id}
                player={playerStat.player}
                stats={playerStat}
                rank={index + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatsLoadingSkeleton() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white px-6 pt-8 pb-6">
        <div className="h-8 w-32 bg-slate-700 rounded mb-2" />
        <div className="h-4 w-48 bg-slate-700 rounded" />
      </div>
      <div className="px-4 py-6 space-y-6">
        <div className="h-32 bg-slate-100 rounded-lg" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-48 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function StatsPage() {
  return (
    <Suspense fallback={<StatsLoadingSkeleton />}>
      <StatsContent />
    </Suspense>
  )
}
