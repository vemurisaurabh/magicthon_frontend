import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { Button } from 'primereact/button'
import { SuggestionCard } from './SuggestionCard.jsx'
import { selectPreviewUrl } from '../store/uploadSlice.js'
import './SuggestionsGrid.css'

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const QUICK_ACTIONS = [
  'Make it funnier',
  'More savage',
  'More relatable',
  'More absurd',
  'Make it edgier',
  'Completely different angle',
]

export function SuggestionsGrid({ suggestions, onSelect, onStartOver, onNewPhoto, onRefine, refining }) {
  const previewUrl = useSelector(selectPreviewUrl)
  const [feedbackText, setFeedbackText] = useState('')

  const handleFileInput = (e) => {
    const file = e.target.files?.[0]
    if (file) onNewPhoto(file)
  }

  const handleQuickAction = useCallback((action) => {
    if (onRefine) onRefine(action)
  }, [onRefine])

  const handleCustomFeedback = useCallback(() => {
    const text = feedbackText.trim()
    if (text && onRefine) {
      onRefine(text)
      setFeedbackText('')
    }
  }, [feedbackText, onRefine])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCustomFeedback()
    }
  }, [handleCustomFeedback])

  return (
    <div className="suggestions-grid-wrap">
      <h2 className="suggestions-grid__heading">The meme council has spoken</h2>

      <div className={`suggestions-grid__refine ${refining ? 'suggestions-grid__refine--loading' : ''}`}>
        <div className="suggestions-grid__quick-actions">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              className="suggestions-grid__quick-btn"
              onClick={() => handleQuickAction(action)}
              disabled={refining}
            >
              {action}
            </button>
          ))}
        </div>
        <div className="suggestions-grid__feedback-row">
          <input
            className="suggestions-grid__feedback-input"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Or tell Chintu Memer what to change..."
            disabled={refining}
          />
          <button
            className="suggestions-grid__feedback-send"
            onClick={handleCustomFeedback}
            disabled={refining || !feedbackText.trim()}
          >
            {refining ? <i className="pi pi-spin pi-spinner" /> : <i className="pi pi-arrow-right" />}
          </button>
        </div>
        {refining && <p className="suggestions-grid__refine-status">Refining your memes...</p>}
      </div>

      <motion.div
        className="suggestions-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={suggestions.map((s) => s.topText).join('')}
      >
        {suggestions.map((s, i) => (
          <motion.div key={s.templateId || i} variants={itemVariants}>
            <SuggestionCard suggestion={s} onClick={onSelect} previewUrl={previewUrl} />
          </motion.div>
        ))}
      </motion.div>
      <div className="suggestions-grid__actions">
        <Button
          label="← Start over"
          severity="secondary"
          outlined
          onClick={onStartOver}
        />
        <label className="suggestions-grid__upload-btn">
          <Button
            label="Try another photo"
            icon="pi pi-camera"
            severity="info"
            outlined
            type="button"
            onClick={() => document.getElementById('new-photo-input').click()}
          />
        </label>
        <input
          id="new-photo-input"
          type="file"
          accept="image/*"
          className="suggestions-grid__file-input"
          onChange={handleFileInput}
        />
      </div>
    </div>
  )
}
