import { motion } from 'framer-motion'
import { getTemplateById } from '../constants/templates.js'
import './SuggestionCard.css'

export function SuggestionCard({ suggestion, onClick, previewUrl }) {
  const template = getTemplateById(suggestion.templateId)
  const name = template?.name || suggestion.templateId

  return (
    <motion.div
      className="sc"
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      onClick={() => onClick(suggestion)}
    >
      <div className="sc__head">
        <span className="sc__format">{name}</span>
      </div>

      <div className="sc__preview">
        {previewUrl && <img src={previewUrl} alt="" className="sc__img" loading="lazy" />}
        <span className="sc__text sc__text--top">{suggestion.topText}</span>
        <span className="sc__text sc__text--bottom">{suggestion.bottomText}</span>
      </div>

      <p className="sc__reasoning">
        <i className="pi pi-info-circle" />
        {suggestion.reasoning}
      </p>

      <div className="sc__cta">
        <span>Edit this meme</span>
        <i className="pi pi-arrow-right" />
      </div>
    </motion.div>
  )
}
