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

export function SuggestionsGrid({ suggestions, onSelect, onStartOver, onNewPhoto }) {
  const previewUrl = useSelector(selectPreviewUrl)

  const handleFileInput = (e) => {
    const file = e.target.files?.[0]
    if (file) onNewPhoto(file)
  }

  return (
    <div className="suggestions-grid-wrap">
      <h2 className="suggestions-grid__heading">The meme council has spoken</h2>
      <motion.div
        className="suggestions-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
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
