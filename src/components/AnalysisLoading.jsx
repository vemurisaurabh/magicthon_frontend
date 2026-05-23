import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './AnalysisLoading.css'

const PHRASES = [
  'Consulting the meme council...',
  'Analysing your chaotic energy...',
  'Cross-referencing 47 subreddits...',
  'Calibrating the absurdity dial...',
  'Almost there — picking the sharpest format...',
]

const phraseVariants = {
  enter: { opacity: 0, y: 20, filter: 'blur(4px)' },
  center: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, filter: 'blur(4px)', transition: { duration: 0.3 } },
}

function SkeletonCard({ delay }) {
  return (
    <motion.div
      className="al__card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="al__card-header">
        <div className="al__bar al__bar--sm" />
        <div className="al__bar al__bar--xs" />
      </div>
      <div className="al__card-body">
        <div className="al__shimmer-block" />
      </div>
      <div className="al__card-footer">
        <div className="al__bar al__bar--md" />
      </div>
    </motion.div>
  )
}

export function AnalysisLoading() {
  const [index, setIndex] = useState(0)
  const [visibleCards, setVisibleCards] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % PHRASES.length)
    }, 1500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (visibleCards >= 6) return
    const timer = setTimeout(() => {
      setVisibleCards((prev) => prev + 1)
    }, 250 + visibleCards * 300)
    return () => clearTimeout(timer)
  }, [visibleCards])

  return (
    <div className="analysis-loading">
      <motion.div
        className="al__progress-ring"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <svg viewBox="0 0 60 60" className="al__ring-svg">
          <circle cx="30" cy="30" r="26" className="al__ring-track" />
          <circle cx="30" cy="30" r="26" className="al__ring-fill" />
        </svg>
        <span className="al__ring-icon">
          <i className="pi pi-sparkles" />
        </span>
      </motion.div>

      <div className="analysis-loading__phrase-wrap">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            className="analysis-loading__phrase"
            variants={phraseVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {PHRASES[index]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="analysis-loading__skeletons">
        {Array.from({ length: 6 }).map((_, i) =>
          i < visibleCards ? (
            <SkeletonCard key={i} delay={0} />
          ) : (
            <div key={i} className="al__card al__card--empty" />
          )
        )}
      </div>
    </div>
  )
}
