import { Card, CardContent } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

interface PlayerStatCardProps {
  player: {
    name: string
    number: number | null
    position: string
  }
  stats: {
    games: number
    atBats: number
    hits: number
    homeruns: number
    rbi: number
    stolenBases: number
    avg: number
  }
  rank: number
}

export function PlayerStatCard({ player, stats, rank }: PlayerStatCardProps) {
  // 打率を3桁表示（例: .333）
  const avgDisplay = stats.avg.toFixed(3)

  // ランクの色
  const rankColor =
    rank === 1
      ? 'bg-[#F6D32D] text-slate-900'
      : rank === 2
      ? 'bg-slate-300 text-slate-900'
      : rank === 3
      ? 'bg-amber-600 text-white'
      : 'bg-slate-100 text-slate-600'

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-0">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Rank Badge */}
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full ${rankColor} flex items-center justify-center font-bold text-lg`}
          >
            {rank <= 3 && rank === 1 ? (
              <Trophy className="w-5 h-5" />
            ) : (
              rank
            )}
          </div>

          {/* Player Info & Stats */}
          <div className="flex-1 min-w-0">
            {/* Player Name & Number */}
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-lg font-bold text-slate-900">
                {player.name}
              </h3>
              {player.number && (
                <span className="text-sm text-slate-500">
                  #{player.number}
                </span>
              )}
              <span className="text-xs text-slate-500 px-2 py-0.5 bg-slate-100 rounded">
                {player.position}
              </span>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Batting Average - Featured */}
              <div className="col-span-2 bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1">打率</div>
                <div className="text-3xl font-bold text-[#F6D32D]">
                  {avgDisplay}
                </div>
              </div>

              {/* Other Stats */}
              <div>
                <div className="text-xs text-slate-500 mb-1">試合数</div>
                <div className="text-xl font-semibold text-slate-900">
                  {stats.games}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">打数</div>
                <div className="text-xl font-semibold text-slate-900">
                  {stats.atBats}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">安打</div>
                <div className="text-xl font-semibold text-slate-900">
                  {stats.hits}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">本塁打</div>
                <div className="text-xl font-semibold text-red-600">
                  {stats.homeruns}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">打点</div>
                <div className="text-xl font-semibold text-blue-600">
                  {stats.rbi}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">盗塁</div>
                <div className="text-xl font-semibold text-green-600">
                  {stats.stolenBases}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
