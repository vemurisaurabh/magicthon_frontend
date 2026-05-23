import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getTemplateById } from '../constants/templates.js'
import './SuggestionCard.css'

function ShimmerPlaceholder() {
  return (
    <div className="sc__shimmer">
      <div className="sc__shimmer-inner">
        <div className="sc__shimmer-icon">
          <i className="pi pi-sparkles" />
        </div>
        <span className="sc__shimmer-label">AI is generating...</span>
      </div>
    </div>
  )
}

function FailedPlaceholder({ onRetry, isRetrying }) {
  return (
    <div className="sc__failed">
      <div className="sc__failed-inner">
        <i className="pi pi-exclamation-circle" />
        <span className="sc__failed-label">Generation failed</span>
        <button
          className="sc__retry-btn"
          onClick={(e) => { e.stopPropagation(); onRetry?.() }}
          disabled={isRetrying}
        >
          {isRetrying ? (
            <><i className="pi pi-spin pi-spinner" /> Retrying...</>
          ) : (
            <><i className="pi pi-refresh" /> Retry with AI</>
          )}
        </button>
      </div>
    </div>
  )
}

export function SuggestionCard({ suggestion, onClick, onRetry, previewUrl, aiImageUrl, imageGenDone = false, isRetrying = false }) {
  const [activeTab, setActiveTab] = useState('photo')
  const template = getTemplateById(suggestion.templateId)
  const name = template?.name || suggestion.templateId
  const hasAiImage = !!aiImageUrl
  const isGenerating = !hasAiImage && !imageGenDone && !isRetrying
  const hasFailed = !hasAiImage && imageGenDone && !isRetrying

  const handleClick = useCallback(() => {
    if (activeTab === 'ai' && hasAiImage) {
      onClick(suggestion, true)
    } else {
      onClick(suggestion, false)
    }
  }, [activeTab, hasAiImage, onClick, suggestion])

  const handleRetry = useCallback(() => {
    onRetry?.(suggestion.templateId)
  }, [onRetry, suggestion.templateId])

  return (
    <motion.div
      className="sc"
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      <div className="sc__head">
        <span className="sc__format">{name}</span>
        <div className="sc__tabs">
          <button
            className={`sc__tab ${activeTab === 'photo' ? 'sc__tab--active' : ''}`}
            onClick={(e) => { e.stopPropagation(); setActiveTab('photo') }}
          >
            <i className="pi pi-image" />
            <span>Your Photo</span>
          </button>
          <button
            className={`sc__tab ${activeTab === 'ai' ? 'sc__tab--active' : ''}`}
            onClick={(e) => { e.stopPropagation(); setActiveTab('ai') }}
          >
            <i className="pi pi-sparkles" />
            <span>AI Meme</span>
            {(isGenerating || isRetrying) && <span className="sc__tab-dot" />}
            {hasAiImage && <i className="pi pi-check sc__tab-check" />}
          </button>
        </div>
      </div>

      <div className="sc__preview" onClick={handleClick}>
        <AnimatePresence mode="wait">
          {activeTab === 'photo' ? (
            <motion.div
              key="photo"
              className="sc__preview-inner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {previewUrl && <img src={previewUrl} alt="" className="sc__img" loading="lazy" />}
              <span className="sc__text sc__text--top">{suggestion.topText}</span>
              <span className="sc__text sc__text--bottom">{suggestion.bottomText}</span>
            </motion.div>
          ) : (
            <motion.div
              key="ai"
              className="sc__preview-inner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {hasAiImage ? (
                <img src={aiImageUrl} alt="AI generated meme" className="sc__img sc__img--ai" />
              ) : hasFailed ? (
                <FailedPlaceholder onRetry={handleRetry} isRetrying={isRetrying} />
              ) : (
                <ShimmerPlaceholder />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="sc__reasoning">
        <i className="pi pi-info-circle" />
        {suggestion.reasoning}
      </p>

      <div className="sc__cta" onClick={handleClick}>
        <span>{activeTab === 'ai' && hasAiImage ? 'Edit with AI scene' : 'Edit this meme'}</span>
        <i className="pi pi-arrow-right" />
      </div>
    </motion.div>
  )
}
