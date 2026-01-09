'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'

// 仮のユーザーID（将来的には認証から取得）
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000'

/**
 * 試合に観戦チェックインする
 */
export async function checkInGame(gameId: string) {
  try {
    const { error } = await supabase
      .from('user_attendance')
      .insert({
        user_id: TEMP_USER_ID,
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
    const { error } = await supabase
      .from('user_attendance')
      .delete()
      .eq('user_id', TEMP_USER_ID)
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
