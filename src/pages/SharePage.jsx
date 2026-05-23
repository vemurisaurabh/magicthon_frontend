import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getMemeData } from '../services/shareService.js'
import { useReactions } from '../hooks/useReactions.js'
import './SharePage.css'

const REACTION_EMOJIS = ['😂', '🔥', '💀', '👏', '🤌']

let burstId = 0

function spawnBurst() {
  const PARTICLE_COUNT = 6
  const particles = []
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = -30 - (120 / (PARTICLE_COUNT - 1)) * i
    const rad = (angle * Math.PI) / 180
    const distance = 60 + Math.random() * 50
    particles.push({
      id: ++burstId,
      x: Math.cos(rad) * distance,
      y: Math.sin(rad) * distance,
      scale: 0.8 + Math.random() * 0.7,
      duration: 0.6 + Math.random() * 0.5,
      delay: Math.random() * 0.08,
    })
  }
  return particles
}

function ReactionButton({ emoji, count, onReact, disabled }) {
  const prevCount = useRef(count)
  const [bumping, setBumping] = useState(false)
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (count !== prevCount.current) {
      setBumping(true)
      prevCount.current = count

      const burst = spawnBurst()
      setParticles((prev) => [...prev, ...burst])

      const t = setTimeout(() => setBumping(false), 400)
      const ids = burst.map((p) => p.id)
      const cleanup = setTimeout(() => {
        setParticles((prev) => prev.filter((p) => !ids.includes(p.id)))
      }, 1200)

      return () => { clearTimeout(t); clearTimeout(cleanup) }
    }
  }, [count])

  const handleClick = useCallback(() => {
    if (!disabled && onReact) onReact()
  }, [disabled, onReact])

  return (
    <motion.button
      className={`share-page__reaction-btn ${bumping ? 'share-page__reaction-btn--bump' : ''} ${disabled ? 'share-page__reaction-btn--maxed' : ''}`}
      whileTap={disabled ? {} : { scale: 0.88 }}
      onClick={handleClick}
      disabled={disabled}
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

      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="share-page__burst-emoji"
            initial={{ opacity: 1, x: 0, y: 0, scale: 0.4 }}
            animate={{ opacity: 0, x: p.x, y: p.y, scale: p.scale }}
            exit={{ opacity: 0 }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.2, 0.8, 0.3, 1],
            }}
          >
            {emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </motion.button>
  )
}

export default function SharePage() {
  const { memeId } = useParams()
  const [meme, setMeme] = useState(null)
  const [error, setError] = useState(null)
  const { reactions, addReaction, canReact } = useReactions(memeId)

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
            disabled={!canReact(emoji)}
          />
        ))}
      </div>
    </div>
  )
}
