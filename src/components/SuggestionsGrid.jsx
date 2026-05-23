import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { SuggestionCard } from './SuggestionCard.jsx'
import { selectPreviewUrl } from '../store/uploadSlice.js'
import './SuggestionsGrid.css'

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

const QUICK_ACTIONS = [
  { label: 'Funnier', icon: 'pi-face-smile' },
  { label: 'More savage', icon: 'pi-bolt' },
  { label: 'More relatable', icon: 'pi-heart' },
  { label: 'More absurd', icon: 'pi-sparkles' },
  { label: 'Edgier', icon: 'pi-exclamation-triangle' },
  { label: 'Different angle', icon: 'pi-refresh' },
]

export function SuggestionsGrid({ suggestions, onSelect, onStartOver, onNewPhoto, onRefine, refining }) {
  const previewUrl = useSelector(selectPreviewUrl)
  const [feedbackText, setFeedbackText] = useState('')

  const handleFileInput = (e) => {
    const file = e.target.files?.[0]
    if (file) onNewPhoto(file)
  }

  const handleQuickAction = useCallback((label) => {
    if (onRefine) onRefine(label)
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
    <div className="sg">
      <header className="sg__header">
        <h2 className="sg__title">The meme council has spoken</h2>
        <p className="sg__subtitle">{suggestions.length} format{suggestions.length !== 1 ? 's' : ''} generated &middot; click to edit</p>
      </header>

      <section className={`sg__refine ${refining ? 'sg__refine--loading' : ''}`}>
        <div className="sg__refine-label">
          <i className="pi pi-sync" />
          <span>Refine results</span>
        </div>
        <div className="sg__chips">
          {QUICK_ACTIONS.map(({ label, icon }) => (
            <button
              key={label}
              className="sg__chip"
              onClick={() => handleQuickAction(label)}
              disabled={refining}
            >
              <i className={`pi ${icon}`} />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <div className="sg__input-row">
          <input
            className="sg__input"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Or type your own instructions..."
            disabled={refining}
          />
          <button
            className="sg__send"
            onClick={handleCustomFeedback}
            disabled={refining || !feedbackText.trim()}
            aria-label="Send feedback"
          >
            {refining ? <i className="pi pi-spin pi-spinner" /> : <i className="pi pi-arrow-right" />}
          </button>
        </div>
        {refining && (
          <div className="sg__refine-indicator">
            <span className="sg__refine-dot" />
            <span>Chintu Memer is cooking...</span>
          </div>
        )}
      </section>

      <motion.div
        className="sg__grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={suggestions.map((s) => s.topText).join('|')}
      >
        {suggestions.map((s, i) => (
          <motion.div key={s.templateId || i} variants={itemVariants}>
            <SuggestionCard suggestion={s} onClick={onSelect} previewUrl={previewUrl} />
          </motion.div>
        ))}
      </motion.div>

      <footer className="sg__footer">
        <button className="sg__footer-btn" onClick={onStartOver}>
          <i className="pi pi-arrow-left" />
          <span>Start over</span>
        </button>
        <button className="sg__footer-btn" onClick={() => document.getElementById('new-photo-input').click()}>
          <i className="pi pi-camera" />
          <span>Try another photo</span>
        </button>
        <input
          id="new-photo-input"
          type="file"
          accept="image/*"
          className="sg__file-input"
          onChange={handleFileInput}
        />
      </footer>
    </div>
  )
}
