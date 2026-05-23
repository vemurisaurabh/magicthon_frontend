import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useSelector } from 'react-redux'
import { SuggestionCard } from './SuggestionCard.jsx'
import { selectPreviewUrl } from '../store/uploadSlice.js'
import { selectRetrying } from '../store/suggestSlice.js'
import './SuggestionsGrid.css'

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] } },
}

function TypingText({ text, className, speed = 40 }) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)

  useEffect(() => {
    setDisplayed('')
    indexRef.current = 0
    const timer = setInterval(() => {
      indexRef.current++
      setDisplayed(text.slice(0, indexRef.current))
      if (indexRef.current >= text.length) clearInterval(timer)
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed])

  return (
    <span className={className}>
      {displayed}
      {displayed.length < text.length && <span className="sg__cursor">|</span>}
    </span>
  )
}

function CountUp({ target, duration = 800 }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (target <= 0) return
    const startTime = performance.now()
    let raf
    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return <>{value}</>
}

function ParallaxCard({ children }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-0.5, 0.5], [4, -4])
  const rotateY = useTransform(x, [-0.5, 0.5], [-4, 4])

  const handleMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }, [x, y])

  const handleLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  return (
    <motion.div
      style={{ rotateX, rotateY, transformPerspective: 600 }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </motion.div>
  )
}

const QUICK_ACTIONS = [
  { label: 'Funnier', icon: 'pi-face-smile' },
  { label: 'More savage', icon: 'pi-bolt' },
  { label: 'More relatable', icon: 'pi-heart' },
  { label: 'More absurd', icon: 'pi-sparkles' },
  { label: 'Edgier', icon: 'pi-exclamation-triangle' },
  { label: 'Different angle', icon: 'pi-refresh' },
]

export function SuggestionsGrid({ suggestions, generatedImages = {}, imageGenDone = false, onSelect, onRetryGenerate, onStartOver, onNewPhoto, onRefine, refining }) {
  const previewUrl = useSelector(selectPreviewUrl)
  const retrying = useSelector(selectRetrying)
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
      <motion.header
        className="sg__header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <h2 className="sg__title">
          <TypingText text="The meme council has spoken" speed={35} />
        </h2>
        <p className="sg__subtitle">
          <CountUp target={suggestions.length} /> format{suggestions.length !== 1 ? 's' : ''} generated &middot; click to edit
        </p>
      </motion.header>

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
            <ParallaxCard>
              <SuggestionCard
                suggestion={s}
                onClick={onSelect}
                onRetry={onRetryGenerate}
                previewUrl={previewUrl}
                aiImageUrl={generatedImages[s.templateId]}
                imageGenDone={imageGenDone}
                isRetrying={!!retrying[s.templateId]}
              />
            </ParallaxCard>
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
