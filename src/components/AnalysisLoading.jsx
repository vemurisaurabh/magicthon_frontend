import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from 'primereact/skeleton'
import './AnalysisLoading.css'

const PHRASES = [
  'Consulting the meme council...',
  'Analysing your chaotic energy...',
  'Cross-referencing 47 subreddits...',
  'Calibrating the absurdity dial...',
  'Almost there — picking the sharpest format...',
]

const phraseVariants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
}

export function AnalysisLoading() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % PHRASES.length)
    }, 1500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="analysis-loading">
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
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            key={i}
            width="100%"
            height="140px"
            borderRadius="var(--radius-md)"
            className="analysis-loading__skeleton"
          />
        ))}
      </div>
    </div>
  )
}
