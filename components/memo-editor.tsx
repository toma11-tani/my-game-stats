'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { MessageSquare, Save } from 'lucide-react'
import { updateMemo } from '@/app/actions'

interface MemoEditorProps {
  gameId: string
  initialMemo: string
}

export function MemoEditor({ gameId, initialMemo }: MemoEditorProps) {
  const [memo, setMemo] = useState(initialMemo)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateMemo(gameId, memo)

      if (result.success) {
        setMessage({ type: 'success', text: 'メモを保存しました' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'メモの保存に失敗しました',
        })
        setTimeout(() => setMessage(null), 3000)
      }
    })
  }

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#F6D32D]" />
          観戦メモ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="この試合の感想や思い出を記録しましょう..."
          className="min-h-[120px] bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#F6D32D]"
          disabled={isPending}
        />

        {message && (
          <div
            className={`text-sm p-3 rounded ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={isPending}
          className="w-full bg-[#F6D32D] hover:bg-[#E5C21D] text-slate-900 font-semibold"
        >
          <Save className="w-4 h-4 mr-2" />
          {isPending ? '保存中...' : 'メモを保存'}
        </Button>
      </CardContent>
    </Card>
  )
}
