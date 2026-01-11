import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp } from "lucide-react";
import { getAttendanceStats, getAttendedGames } from "@/lib/api";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getResultLabel(resultType: string) {
  switch (resultType) {
    case 'win':
      return '勝ち';
    case 'loss':
      return '負け';
    case 'draw':
      return '引分';
    default:
      return resultType;
  }
}

async function DashboardContent() {
  const [stats, attendedGamesData] = await Promise.all([
    getAttendanceStats(),
    getAttendedGames(),
  ]);

  const recentGames = attendedGamesData.slice(0, 10).map((attendance: any) => {
    const game = attendance.games;
    const opponent = game?.teams;

    return {
      id: game?.id || '',
      date: formatDate(game?.date || ''),
      opponent: opponent?.name || '未設定',
      result: getResultLabel(game?.result_type || ''),
      score: `${game?.home_score || 0}-${game?.away_score || 0}`,
      stadium: game?.stadium || '',
      resultType: game?.result_type || '',
    };
  });

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold mb-2">My Game Stats</h1>
        <p className="text-slate-300 text-sm">阪神タイガース観戦記録</p>
      </div>

      {/* Stats Cards */}
      <div className="px-4 -mt-4 mb-6">
        <Card className="bg-white shadow-md border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              観戦成績
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-slate-900">
                {stats.winRate}
              </span>
              <span className="text-xl text-slate-600">%</span>
            </div>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-semibold text-slate-900">
                  {stats.totalGames}
                </div>
                <div className="text-xs text-slate-500 mt-1">試合</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-green-600">
                  {stats.wins}
                </div>
                <div className="text-xs text-slate-500 mt-1">勝ち</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-red-600">
                  {stats.losses}
                </div>
                <div className="text-xs text-slate-500 mt-1">負け</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-slate-400">
                  {stats.draws}
                </div>
                <div className="text-xs text-slate-500 mt-1">引分</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Games */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            最近の試合
          </h2>
        </div>

        {recentGames.length === 0 ? (
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-8 text-center">
              <p className="text-slate-500">まだ観戦記録がありません</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentGames.map((game) => (
              <Card
                key={game.id}
                className="bg-white shadow-sm hover:shadow-md transition-shadow border-0"
              >
                <CardContent className="p-4">
                  <Link href={`/games/${game.id}`} className="block group">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center justify-center w-12 h-6 rounded-full text-xs font-semibold ${
                          game.resultType === "win"
                            ? "bg-green-100 text-green-700"
                            : game.resultType === "loss"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {game.result}
                      </span>
                      <span className="text-sm font-medium text-slate-900">
                        {game.score}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-slate-900 mb-1">
                      vs {game.opponent}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{game.date}</span>
                      <span>•</span>
                      <span>{game.stadium}</span>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
