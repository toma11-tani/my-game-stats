import { Suspense } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAttendanceStats, getAttendanceHistory, getStadiumStats, getHomeTeam } from '@/lib/api'
import { logout } from '@/app/login/actions'
import { User, Trophy, MapPin, Calendar, MessageSquare, LogOut } from 'lucide-react'

function getResultLabel(resultType: string | null) {
  if (!resultType) return null
  switch (resultType) {
    case 'win':
      return '勝ち'
    case 'loss':
      return '負け'
    case 'draw':
      return '引分'
    default:
      return null
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

async function ProfileContent() {
  const [stats, history, stadiumStats, homeTeam] = await Promise.all([
    getAttendanceStats(),
    getAttendanceHistory(),
    getStadiumStats(),
    getHomeTeam(),
  ])

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white px-6 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-[#F6D32D] rounded-full flex items-center justify-center">
            <User className="w-7 h-7 text-slate-900" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">マイページ</h1>
            <p className="text-slate-300 text-sm">観戦記録</p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="px-4 -mt-4 mb-6">
        <Card className="bg-white shadow-md border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              通算成績
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">
                  {stats.totalGames}
                </div>
                <div className="text-sm text-slate-500 mt-1">観戦試合数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#F6D32D]">
                  {stats.winRate}%
                </div>
                <div className="text-sm text-slate-500 mt-1">勝率</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
              <div className="text-center">
                <div className="text-xl font-semibold text-green-600">
                  {stats.wins}
                </div>
                <div className="text-xs text-slate-500 mt-1">勝ち</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-red-600">
                  {stats.losses}
                </div>
                <div className="text-xs text-slate-500 mt-1">負け</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-slate-400">
                  {stats.draws}
                </div>
                <div className="text-xs text-slate-500 mt-1">引分</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stadium Stats */}
      {stadiumStats.length > 0 && (
        <div className="px-4 mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            球場別成績
          </h2>
          <div className="space-y-2">
            {stadiumStats.map((stadium) => (
              <Card key={stadium.stadium} className="bg-white shadow-sm border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900">
                        {stadium.stadium}
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        {stadium.wins}勝 {stadium.losses}敗{' '}
                        {stadium.draws > 0 && `${stadium.draws}分`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">
                        {stadium.total}
                      </div>
                      <div className="text-xs text-slate-500">試合</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Attendance History */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          観戦履歴
        </h2>

        {history.length === 0 ? (
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-8 text-center">
              <p className="text-slate-500">まだ観戦記録がありません</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {history.map((attendance: any) => {
              const game = attendance.games
              const opponent = game?.teams
              const resultType = game?.result_type

              return (
                <Link key={attendance.id} href={`/games/${game?.id}`}>
                  <Card
                    className={`shadow-sm hover:shadow-md transition-shadow border-0 cursor-pointer ${
                      resultType === 'win'
                        ? 'border-l-4 border-l-[#F6D32D] bg-white'
                        : resultType === 'loss'
                        ? 'border-l-4 border-l-slate-300 bg-slate-50'
                        : 'border-l-4 border-l-slate-400 bg-white'
                    }`}
                  >
                    <CardContent className="p-4">
                      {/* Date */}
                      <div className="text-xs text-slate-500 mb-2">
                        {formatDate(game?.date || '')}
                      </div>

                      {/* Match Info */}
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-semibold ${
                            resultType === 'win'
                              ? 'bg-green-100 text-green-700'
                              : resultType === 'loss'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {getResultLabel(resultType)}
                        </span>
                        <span className="text-sm font-medium text-slate-900">
                          {game?.home_score} - {game?.away_score}
                        </span>
                      </div>

                      {/* Opponent & Stadium */}
                      <div className="text-sm font-medium text-slate-900 mb-1">
                        <span style={{ color: homeTeam?.color_primary || '#1e293b' }}>
                          {homeTeam?.name || '阪神'}
                        </span>
                        {' vs '}
                        <span style={{ color: opponent?.color_primary || '#1e293b' }}>
                          {opponent?.name || '未設定'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mb-2">
                        {game?.stadium}
                      </div>

                      {/* Memo */}
                      {attendance.memo && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-slate-700 leading-relaxed">
                              {attendance.memo}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Logout Button */}
      <div className="px-4 pb-24 mb-6">
        <form action={logout}>
          <Button
            type="submit"
            variant="outline"
            className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            ログアウト
          </Button>
        </form>
      </div>
    </div>
  )
}

function ProfileLoadingSkeleton() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white px-6 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-slate-700 rounded-full" />
          <div>
            <div className="h-8 w-32 bg-slate-700 rounded mb-2" />
            <div className="h-4 w-24 bg-slate-700 rounded" />
          </div>
        </div>
      </div>
      <div className="px-4 py-6 space-y-6">
        <div className="h-40 bg-slate-100 rounded-lg" />
        <div className="h-32 bg-slate-100 rounded-lg" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileLoadingSkeleton />}>
      <ProfileContent />
    </Suspense>
  )
}
