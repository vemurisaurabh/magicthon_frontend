import { useState, useEffect, useCallback, useMemo } from 'react'
import { socket } from '../lib/socket.js'
import { getReactions as fetchReactions, addReaction as postReaction } from '../services/shareService.js'

const MAX_REACTIONS_PER_EMOJI = 1
const STORAGE_KEY = 'chintu_reactions'

function getLocalCounts(memeId) {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return data[memeId] || {}
  } catch {
    return {}
  }
}

function incrementLocalCount(memeId, emoji) {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    if (!data[memeId]) data[memeId] = {}
    data[memeId][emoji] = (data[memeId][emoji] || 0) + 1
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return data[memeId][emoji]
  } catch {
    return MAX_REACTIONS_PER_EMOJI
  }
}

export function useReactions(memeId) {
  const [reactions, setReactions] = useState({})
  const [localCounts, setLocalCounts] = useState({})

  useEffect(() => {
    if (!memeId) return
    fetchReactions(memeId).then(setReactions).catch(() => {})
    setLocalCounts(getLocalCounts(memeId))
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

  const remaining = useMemo(() => {
    const r = {}
    for (const emoji of Object.keys(localCounts)) {
      r[emoji] = Math.max(0, MAX_REACTIONS_PER_EMOJI - (localCounts[emoji] || 0))
    }
    return r
  }, [localCounts])

  const addReaction = useCallback(async (emoji) => {
    const used = localCounts[emoji] || 0
    if (used >= MAX_REACTIONS_PER_EMOJI) return

    setReactions((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }))
    const newCount = incrementLocalCount(memeId, emoji)
    setLocalCounts((prev) => ({ ...prev, [emoji]: newCount }))

    try {
      const counts = await postReaction(memeId, emoji)
      setReactions(counts)
    } catch {
      setReactions((prev) => ({
        ...prev,
        [emoji]: Math.max((prev[emoji] || 1) - 1, 0),
      }))
    }
  }, [memeId, localCounts])

  const canReact = useCallback((emoji) => {
    return (localCounts[emoji] || 0) < MAX_REACTIONS_PER_EMOJI
  }, [localCounts])

  return { reactions, addReaction, canReact, remaining, maxPerEmoji: MAX_REACTIONS_PER_EMOJI }
}
