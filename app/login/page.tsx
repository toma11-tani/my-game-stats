'use client'

import { useState } from 'react'
import { login, signup } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function handleLogin(formData: FormData) {
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    const result = await login(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
    // Success case will redirect, so no need to setIsLoading(false)
  }

  async function handleSignup(formData: FormData) {
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    const result = await signup(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else if (result?.success) {
      setSuccessMessage(result.message || '確認メールを送信しました')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            My Game Stats
          </CardTitle>
          <CardDescription className="text-center">
            阪神タイガース観戦記録アプリ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@example.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded text-sm">
                {successMessage}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 bg-[#F6D32D] text-slate-900 hover:bg-[#E5C21D]"
                disabled={isLoading}
              >
                {isLoading ? 'ログイン中...' : 'ログイン'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={isLoading}
                onClick={(e) => {
                  const form = e.currentTarget.closest('form')
                  if (form) {
                    const formData = new FormData(form)
                    handleSignup(formData)
                  }
                }}
              >
                {isLoading ? '登録中...' : '新規登録'}
              </Button>
            </div>
          </form>

          <p className="text-xs text-slate-500 text-center mt-4">
            新規登録すると、確認メールが送信されます。<br />
            メール内のリンクをクリックして登録を完了してください。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
