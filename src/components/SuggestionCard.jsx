import { motion } from 'framer-motion'
import { getTemplateById } from '../constants/templates.js'
import './SuggestionCard.css'

const cardVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.03, borderColor: 'var(--color-accent)' },
  tap: { scale: 0.98 },
}

export function SuggestionCard({ suggestion, onClick, previewUrl }) {
  const template = getTemplateById(suggestion.templateId)
  const name = template?.name || suggestion.templateId

  return (
    <motion.div
      className="suggestion-card"
      variants={cardVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      onClick={() => onClick(suggestion)}
    >
      <span className="suggestion-card__label">{name}</span>
      <div className="suggestion-card__preview">
        {previewUrl && <img src={previewUrl} alt="Meme preview" className="suggestion-card__img" />}
        <span className="suggestion-card__overlay-top">{suggestion.topText}</span>
        <span className="suggestion-card__overlay-bottom">{suggestion.bottomText}</span>
      </div>
      <p className="suggestion-card__reasoning">{suggestion.reasoning}</p>
    </motion.div>
  )
}
