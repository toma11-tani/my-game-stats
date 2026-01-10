import { Suspense } from 'react'
import { getAllGamesWithAttendance, getHomeTeam } from '@/lib/api'
import { GameCard } from '@/components/game-card'
import { Calendar } from 'lucide-react'

interface GroupedGames {
  [key: string]: any[]
}

function groupGamesByMonth(games: any[]): GroupedGames {
  const grouped: GroupedGames = {}

  games.forEach((game) => {
    const date = new Date(game.date)
    const monthKey = `${date.getFullYear()}年${date.getMonth() + 1}月`

    if (!grouped[monthKey]) {
      grouped[monthKey] = []
    }
    grouped[monthKey].push(game)
  })

  return grouped
}

async function GamesContent() {
  const [games, homeTeam] = await Promise.all([
    getAllGamesWithAttendance(),
    getHomeTeam(),
  ])

  const groupedGames = groupGamesByMonth(games)
  const monthKeys = Object.keys(groupedGames)

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white px-6 pt-8 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-6 h-6" />
          <h1 className="text-2xl font-bold">試合一覧</h1>
        </div>
        <p className="text-slate-300 text-sm">
          全{games.length}試合 • 観戦済み{' '}
          {games.filter((g) => g.isAttended).length}試合
        </p>
      </div>

      {/* Games List */}
      <div className="px-4 py-6">
        {monthKeys.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            試合データがありません
          </div>
        ) : (
          <div className="space-y-8">
            {monthKeys.map((monthKey) => (
              <div key={monthKey}>
                {/* Month Header */}
                <div className="mb-3">
                  <h2 className="text-lg font-bold text-slate-900">
                    {monthKey}
                  </h2>
                  <div className="h-0.5 bg-slate-200 mt-2" />
                </div>

                {/* Games in this month */}
                <div className="space-y-3">
                  {groupedGames[monthKey].map((game) => (
                    <GameCard
                      key={game.id}
                      game={{
                        id: game.id,
                        date: game.date,
                        homeTeam: homeTeam,
                        opponentTeam: game.teams,
                        result_type: game.result_type,
                        home_score: game.home_score,
                        away_score: game.away_score,
                        stadium: game.stadium,
                        isAttended: game.isAttended,
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function GamesLoadingSkeleton() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white px-6 pt-8 pb-6">
        <div className="h-8 w-32 bg-slate-700 rounded mb-2" />
        <div className="h-4 w-48 bg-slate-700 rounded" />
      </div>
      <div className="px-4 py-6 space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-6 w-24 bg-slate-200 rounded" />
            {[1, 2, 3].map((j) => (
              <div
                key={j}
                className="h-32 bg-slate-100 rounded-lg border-l-4 border-l-slate-200"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function GamesPage() {
  return (
    <Suspense fallback={<GamesLoadingSkeleton />}>
      <GamesContent />
    </Suspense>
  )
}
