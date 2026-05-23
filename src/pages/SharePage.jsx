import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getMemeData } from '../services/shareService.js'
import { useReactions } from '../hooks/useReactions.js'
import './SharePage.css'

const REACTION_EMOJIS = ['😂', '🔥', '💀', '👏', '🤌']

function ReactionButton({ emoji, count, onReact }) {
  const prevCount = useRef(count)
  const [bumping, setBumping] = useState(false)

  useEffect(() => {
    if (count !== prevCount.current) {
      setBumping(true)
      prevCount.current = count
      const t = setTimeout(() => setBumping(false), 400)
      return () => clearTimeout(t)
    }
  }, [count])

  return (
    <motion.button
      className={`share-page__reaction-btn ${bumping ? 'share-page__reaction-btn--bump' : ''}`}
      whileTap={{ scale: 0.88 }}
      onClick={onReact}
    >
      <span className="share-page__reaction-emoji">{emoji}</span>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={count}
          className="share-page__reaction-count"
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 12, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

export default function SharePage() {
  const { memeId } = useParams()
  const [meme, setMeme] = useState(null)
  const [error, setError] = useState(null)
  const { reactions, addReaction } = useReactions(memeId)

  useEffect(() => {
    if (!memeId) return
    getMemeData(memeId)
      .then(setMeme)
      .catch((err) => setError(err.message))
  }, [memeId])

  if (error) {
    return (
      <div className="share-page">
        <p className="share-page__error">{error}</p>
      </div>
    )
  }

  if (!meme) {
    return (
      <div className="share-page">
        <p className="share-page__loading">Loading meme...</p>
      </div>
    )
  }

  const totalReactions = REACTION_EMOJIS.reduce((sum, e) => sum + (reactions[e] || 0), 0)

  return (
    <div className="share-page">
      <div className="share-page__card">
        <img src={meme.image_url} alt="Shared meme" className="share-page__image" />
      </div>

      <div className="share-page__reaction-bar">
        <span className="share-page__live-dot" />
        <span className="share-page__live-label">
          {totalReactions} reaction{totalReactions !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="share-page__reactions">
        {REACTION_EMOJIS.map((emoji) => (
          <ReactionButton
            key={emoji}
            emoji={emoji}
            count={reactions[emoji] || 0}
            onReact={() => addReaction(emoji)}
          />
        ))}
      </div>
    </div>
  )
}
