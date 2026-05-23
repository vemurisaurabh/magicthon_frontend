import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from 'primereact/button'
import { motion } from 'framer-motion'
import { getMemeData } from '../services/shareService.js'
import { useReactions } from '../hooks/useReactions.js'
import './SharePage.css'

const REACTION_EMOJIS = ['😂', '🔥', '💀', '👏', '🤌']

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

  return (
    <div className="share-page">
      <div className="share-page__card">
        <img src={meme.image_url} alt="Shared meme" className="share-page__image" />
      </div>
      <div className="share-page__reactions">
        {REACTION_EMOJIS.map((emoji) => (
          <motion.div key={emoji} whileTap={{ scale: 0.9 }}>
            <Button
              className="reaction-btn"
              label={`${emoji} ${reactions[emoji] || 0}`}
              onClick={() => addReaction(emoji)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
