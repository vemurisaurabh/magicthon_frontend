import { useState, useEffect, useCallback } from 'react'
import { socket } from '../lib/socket.js'
import { getReactions as fetchReactions, addReaction as postReaction } from '../services/shareService.js'

export function useReactions(memeId) {
  const [reactions, setReactions] = useState({})

  useEffect(() => {
    if (!memeId) return
    fetchReactions(memeId).then(setReactions).catch(() => {})
  }, [memeId])

  useEffect(() => {
    if (!memeId) return

    if (!socket.connected) socket.connect()

    socket.emit('join-meme', memeId)

    const handleReaction = (data) => {
      if (data.memeId === memeId && data.counts) {
        setReactions(data.counts)
      }
    }

    socket.on('reaction', handleReaction)

    return () => {
      socket.off('reaction', handleReaction)
      socket.emit('leave-meme', memeId)
    }
  }, [memeId])

  const addReaction = useCallback(async (emoji) => {
    setReactions((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }))
    try {
      const counts = await postReaction(memeId, emoji)
      setReactions(counts)
    } catch {
      setReactions((prev) => ({
        ...prev,
        [emoji]: Math.max((prev[emoji] || 1) - 1, 0),
      }))
    }
  }, [memeId])

  return { reactions, addReaction }
}
