import { Suspense } from 'react'
import { getBattingRankings, getPitchingRankings } from '@/lib/api'
import { BarChart3, Trophy } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface RankingItemProps {
  rank: number
  player: any
  value: string | number
  secondaryValue?: string
}

function RankingItem({ rank, player, value, secondaryValue }: RankingItemProps) {
  const getTrophyIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Trophy className="w-5 h-5 text-amber-600" />
    return null
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="w-8 text-center">
        {rank <= 3 ? (
          getTrophyIcon(rank)
        ) : (
          <span className="text-sm font-semibold text-slate-400">{rank}</span>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-slate-900">{player.name}</span>
          <span className="text-xs text-slate-500">#{player.number}</span>
        </div>
        {secondaryValue && (
          <span className="text-xs text-slate-500">{secondaryValue}</span>
        )}
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-slate-900">{value}</div>
      </div>
    </div>
  )
}

async function StatsContent() {
  const [battingRankings, pitchingRankings] = await Promise.all([
    getBattingRankings(),
    getPitchingRankings(),
  ])

  return (
    <div className="max-w-lg mx-auto pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white px-6 pt-8 pb-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-6 h-6" />
          <h1 className="text-2xl font-bold">成績ランキング</h1>
        </div>
        <p className="text-slate-300 text-sm">観戦時の選手成績トップ5</p>
      </div>

      <div className="px-4 space-y-6">
        {/* 打撃成績セクション */}
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-bold text-slate-900">打撃成績</h2>
          </div>

          <Accordion type="multiple" className="space-y-3">
            {/* 打率ランキング */}
            <AccordionItem
              value="batting-average"
              className="border rounded-lg bg-white shadow-sm"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <span className="text-base font-semibold text-slate-900">
                  打率
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2">
                {battingRankings.battingAverage.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">
                    データがありません
                  </p>
                ) : (
                  <>
                    {battingRankings.battingAverage.map((item: any, index: number) => (
                      <RankingItem
                        key={item.player.id}
                        rank={index + 1}
                        player={item.player}
                        value={item.avg.toFixed(3)}
                        secondaryValue={`${item.hits}/${item.atBats}`}
                      />
                    ))}
                    <p className="text-xs text-slate-500 mt-3 pt-3 border-t">
                      ※規定打数 = 観戦試合数 × 1
                    </p>
                  </>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* 本塁打ランキング */}
            <AccordionItem
              value="homeruns"
              className="border rounded-lg bg-white shadow-sm"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <span className="text-base font-semibold text-slate-900">
                  本塁打
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2">
                {battingRankings.homeruns.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">
                    データがありません
                  </p>
                ) : (
                  battingRankings.homeruns.map((item: any, index: number) => (
                    <RankingItem
                      key={item.player.id}
                      rank={index + 1}
                      player={item.player}
                      value={item.homeruns}
                    />
                  ))
                )}
              </AccordionContent>
            </AccordionItem>

            {/* 打点ランキング */}
            <AccordionItem
              value="rbi"
              className="border rounded-lg bg-white shadow-sm"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <span className="text-base font-semibold text-slate-900">
                  打点
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2">
                {battingRankings.rbi.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">
                    データがありません
                  </p>
                ) : (
                  battingRankings.rbi.map((item: any, index: number) => (
                    <RankingItem
                      key={item.player.id}
                      rank={index + 1}
                      player={item.player}
                      value={item.rbi}
                    />
                  ))
                )}
              </AccordionContent>
            </AccordionItem>

            {/* 盗塁ランキング */}
            <AccordionItem
              value="stolen-bases"
              className="border rounded-lg bg-white shadow-sm"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <span className="text-base font-semibold text-slate-900">
                  盗塁
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2">
                {battingRankings.stolenBases.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">
                    データがありません
                  </p>
                ) : (
                  battingRankings.stolenBases.map((item: any, index: number) => (
                    <RankingItem
                      key={item.player.id}
                      rank={index + 1}
                      player={item.player}
                      value={item.stolenBases}
                    />
                  ))
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* 投手成績セクション */}
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-bold text-slate-900">投手成績</h2>
          </div>

          <Accordion type="multiple" className="space-y-3">
            {/* 失点率ランキング */}
            <AccordionItem
              value="era"
              className="border rounded-lg bg-white shadow-sm"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <span className="text-base font-semibold text-slate-900">
                  失点率
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2">
                {pitchingRankings.earnedRunAverage.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">
                    データがありません
                  </p>
                ) : (
                  <>
                    {pitchingRankings.earnedRunAverage.map(
                      (item: any, index: number) => (
                        <RankingItem
                          key={item.player.id}
                          rank={index + 1}
                          player={item.player}
                          value={item.era.toFixed(2)}
                          secondaryValue={`${item.innings}回`}
                        />
                      )
                    )}
                    <p className="text-xs text-slate-500 mt-3 pt-3 border-t">
                      ※規定投球回 = 観戦試合数 × 0.5
                    </p>
                  </>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* 勝利数ランキング */}
            <AccordionItem
              value="wins"
              className="border rounded-lg bg-white shadow-sm"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <span className="text-base font-semibold text-slate-900">
                  勝利数
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2">
                {pitchingRankings.wins.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">
                    データがありません
                  </p>
                ) : (
                  pitchingRankings.wins.map((item: any, index: number) => (
                    <RankingItem
                      key={item.player.id}
                      rank={index + 1}
                      player={item.player}
                      value={`${item.wins}勝`}
                    />
                  ))
                )}
              </AccordionContent>
            </AccordionItem>

            {/* 投球回ランキング */}
            <AccordionItem
              value="innings"
              className="border rounded-lg bg-white shadow-sm"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <span className="text-base font-semibold text-slate-900">
                  投球回
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2">
                {pitchingRankings.innings.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">
                    データがありません
                  </p>
                ) : (
                  pitchingRankings.innings.map((item: any, index: number) => (
                    <RankingItem
                      key={item.player.id}
                      rank={index + 1}
                      player={item.player}
                      value={`${item.innings}回`}
                    />
                  ))
                )}
              </AccordionContent>
            </AccordionItem>

            {/* 奪三振ランキング */}
            <AccordionItem
              value="strikeouts"
              className="border rounded-lg bg-white shadow-sm"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <span className="text-base font-semibold text-slate-900">
                  奪三振
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2">
                {pitchingRankings.strikeouts.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">
                    データがありません
                  </p>
                ) : (
                  pitchingRankings.strikeouts.map((item: any, index: number) => (
                    <RankingItem
                      key={item.player.id}
                      rank={index + 1}
                      player={item.player}
                      value={item.strikeouts}
                    />
                  ))
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </div>
  )
}

function StatsLoadingSkeleton() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white px-6 pt-8 pb-6 mb-6">
        <div className="h-8 w-32 bg-slate-700 rounded mb-2" />
        <div className="h-4 w-48 bg-slate-700 rounded" />
      </div>
      <div className="px-4 space-y-6">
        {[1, 2].map((section) => (
          <div key={section} className="space-y-3">
            <div className="h-6 w-24 bg-slate-200 rounded" />
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-12 bg-slate-100 rounded-lg border"
              />
            ))}
          </div>
        ))}
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
