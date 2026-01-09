'use client'

import { useOptimistic, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { checkInGame, checkOutGame } from '@/app/actions'

interface GameCardProps {
  game: {
    id: string
    date: string
    opponent: string
    result_type: string | null
    home_score: number | null
    away_score: number | null
    stadium: string
    isAttended: boolean
  }
}

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

export function GameCard({ game }: GameCardProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticAttended, setOptimisticAttended] = useOptimistic(
    game.isAttended,
    (state, newState: boolean) => newState
  )

  const handleToggleAttendance = async () => {
    startTransition(async () => {
      setOptimisticAttended(!optimisticAttended)

      if (optimisticAttended) {
        await checkOutGame(game.id)
      } else {
        await checkInGame(game.id)
      }
    })
  }

  const isWin = game.result_type === 'win'
  const isLoss = game.result_type === 'loss'
  const isDraw = game.result_type === 'draw'
  const isFuture = !game.result_type

  const borderColor = isWin
    ? 'border-l-4 border-l-[#F6D32D]'
    : isLoss
    ? 'border-l-4 border-l-slate-300'
    : isDraw
    ? 'border-l-4 border-l-slate-400'
    : 'border-l-4 border-l-slate-200'

  const cardBg = isLoss ? 'bg-slate-50' : 'bg-white'

  return (
    <Card className={`${cardBg} ${borderColor} shadow-sm hover:shadow-md transition-shadow border-0`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* 日付 */}
            <div className="text-xs text-slate-500 mb-2">
              {new Date(game.date).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short',
              })}
            </div>

            {/* 対戦カード */}
            <div className="flex items-center gap-2 mb-2">
              <div className="text-sm font-medium text-slate-900">
                阪神 vs {game.opponent}
              </div>
            </div>

            {/* スコア */}
            {!isFuture && (
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-semibold ${
                    isWin
                      ? 'bg-green-100 text-green-700'
                      : isLoss
                      ? 'bg-red-100 text-red-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {getResultLabel(game.result_type)}
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {game.home_score} - {game.away_score}
                </span>
              </div>
            )}

            {/* 球場 */}
            <div className="text-xs text-slate-500">{game.stadium}</div>
          </div>

          {/* チェックインボタン */}
          <div className="flex-shrink-0">
            <Button
              onClick={handleToggleAttendance}
              disabled={isPending}
              size="sm"
              variant={optimisticAttended ? 'default' : 'outline'}
              className={
                optimisticAttended
                  ? 'bg-[#F6D32D] hover:bg-[#E5C21D] text-slate-900 font-semibold'
                  : ''
              }
            >
              {optimisticAttended ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  観戦済み
                </>
              ) : (
                '観戦した'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
