'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

/**
 * 試合に観戦チェックインする
 */
export async function checkInGame(gameId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'ログインが必要です' }
    }

    const { error } = await supabase
      .from('user_attendance')
      .insert({
        user_id: user.id,
        game_id: gameId,
      })

    if (error) {
      console.error('Error checking in:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/games')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error checking in:', error)
    return { success: false, error: 'チェックインに失敗しました' }
  }
}

/**
 * 試合の観戦チェックアウトする（削除）
 */
export async function checkOutGame(gameId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'ログインが必要です' }
    }

    const { error } = await supabase
      .from('user_attendance')
      .delete()
      .eq('user_id', user.id)
      .eq('game_id', gameId)

    if (error) {
      console.error('Error checking out:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/games')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error checking out:', error)
    return { success: false, error: 'チェックアウトに失敗しました' }
  }
}

/**
 * 観戦メモを更新
 */
export async function updateMemo(gameId: string, memo: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'ログインが必要です' }
    }

    // まず既存のレコードを確認
    const { data: existing } = await supabase
      .from('user_attendance')
      .select('id')
      .eq('user_id', user.id)
      .eq('game_id', gameId)
      .single()

    if (existing) {
      // 更新
      const { error } = await supabase
        .from('user_attendance')
        .update({ memo })
        .eq('user_id', user.id)
        .eq('game_id', gameId)

      if (error) {
        console.error('Error updating memo:', error)
        return { success: false, error: error.message }
      }
    } else {
      // 新規作成
      const { error } = await supabase
        .from('user_attendance')
        .insert({
          user_id: user.id,
          game_id: gameId,
          memo,
        })

      if (error) {
        console.error('Error creating memo:', error)
        return { success: false, error: error.message }
      }
    }

    revalidatePath(`/games/${gameId}`)
    revalidatePath('/games')
    revalidatePath('/profile')
    return { success: true }
  } catch (error) {
    console.error('Error updating memo:', error)
    return { success: false, error: 'メモの更新に失敗しました' }
  }
}
