import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { getReactions as fetchReactions, addReaction as postReaction } from '../services/shareService.js'

export function useReactions(memeId) {
  const [reactions, setReactions] = useState({})

  useEffect(() => {
    if (!memeId) return
    fetchReactions(memeId).then(setReactions).catch(() => {})
  }, [memeId])

  useEffect(() => {
    if (!memeId || !supabase) return

    const channel = supabase
      .channel(`reactions-${memeId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reactions', filter: `meme_id=eq.${memeId}` },
        (payload) => {
          const emoji = payload.new?.emoji
          if (emoji) {
            setReactions((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [memeId])

  const addReaction = useCallback(async (emoji) => {
    setReactions((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }))
    try {
      await postReaction(memeId, emoji)
    } catch {
      setReactions((prev) => ({
        ...prev,
        [emoji]: Math.max((prev[emoji] || 1) - 1, 0),
      }))
    }
  }, [memeId])

  return { reactions, addReaction }
}
