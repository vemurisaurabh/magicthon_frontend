import { useCallback, useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import { motion } from 'framer-motion'
import { UploadZone } from '../components/UploadZone.jsx'
import { WebcamCapture } from '../components/WebcamCapture.jsx'
import { AnalysisLoading } from '../components/AnalysisLoading.jsx'
import { TEMPLATES } from '../constants/templates.js'
import { setFile, selectUploadFile, selectPreviewUrl } from '../store/uploadSlice.js'
import { analyzePhoto, selectSuggestStatus, selectSuggestions, selectSuggestError } from '../store/suggestSlice.js'
import { setSelectedTemplate } from '../store/editorSlice.js'
import './HomePage.css'

const pressVariants = {
  idle: { scale: 1 },
  tap: { scale: 0.97 },
}

const MAX_TEMPLATES = 6

export default function HomePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const file = useSelector(selectUploadFile)
  const previewUrl = useSelector(selectPreviewUrl)
  const suggestStatus = useSelector(selectSuggestStatus)
  const suggestions = useSelector(selectSuggestions)
  const suggestError = useSelector(selectSuggestError)
  const [webcamOpen, setWebcamOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [selectedTemplates, setSelectedTemplates] = useState([])
  const luckyRef = useRef(false)

  useEffect(() => {
    if (suggestStatus === 'succeeded' && suggestions.length > 0) {
      if (luckyRef.current) {
        luckyRef.current = false
        dispatch(setSelectedTemplate(suggestions[0]))
        navigate('/editor')
      } else {
        navigate('/suggestions')
      }
    }
  }, [suggestStatus, suggestions, dispatch, navigate])

  const handleFileSelect = useCallback((f) => {
    const url = URL.createObjectURL(f)
    dispatch(setFile({ file: f, previewUrl: url }))
  }, [dispatch])

  const handleToggleTemplate = useCallback((templateId) => {
    setSelectedTemplates((prev) => {
      if (prev.includes(templateId)) {
        return prev.filter((id) => id !== templateId)
      }
      if (prev.length >= MAX_TEMPLATES) return prev
      return [...prev, templateId]
    })
  }, [])

  const handleAnalyze = useCallback(() => {
    if (file) {
      dispatch(analyzePhoto({
        file,
        prompt: prompt.trim() || undefined,
        preferredTemplates: selectedTemplates.length > 0 ? selectedTemplates : undefined,
      }))
    }
  }, [dispatch, file, prompt, selectedTemplates])

  const handleLucky = useCallback(() => {
    if (file) {
      luckyRef.current = true
      dispatch(analyzePhoto({
        file,
        prompt: prompt.trim() || undefined,
        preferredTemplates: selectedTemplates.length > 0 ? selectedTemplates : undefined,
      }))
    }
  }, [dispatch, file, prompt, selectedTemplates])

  const isLoading = suggestStatus === 'loading'

  if (isLoading) {
    return <AnalysisLoading />
  }

  if (!file) {
    return (
      <>
        <UploadZone
          onFileSelect={handleFileSelect}
          previewUrl={previewUrl}
          onWebcamClick={() => setWebcamOpen(true)}
        />
        <div className="app__buttons">
          <motion.div className="app__cta-wrap" variants={pressVariants} initial="idle" whileTap="tap">
            <Button
              label="Analyse this chaos →"
              size="large"
              className="analyze-cta"
              disabled
            />
          </motion.div>
        </div>
        <WebcamCapture
          visible={webcamOpen}
          onHide={() => setWebcamOpen(false)}
          onCapture={handleFileSelect}
        />
      </>
    )
  }

  return (
    <div className="home-split">
      <div className="home-split__left">
        <UploadZone
          onFileSelect={handleFileSelect}
          previewUrl={previewUrl}
          onWebcamClick={() => setWebcamOpen(true)}
        />
        <div className="app__buttons">
          <motion.div className="app__cta-wrap" variants={pressVariants} initial="idle" whileTap="tap">
            <Button
              label="Analyse this chaos →"
              size="large"
              className="analyze-cta"
              onClick={handleAnalyze}
            />
          </motion.div>
          <motion.div variants={pressVariants} initial="idle" whileTap="tap">
            <Button
              label="🎰 Surprise me"
              size="large"
              outlined
              className="lucky-cta"
              onClick={handleLucky}
            />
          </motion.div>
        </div>
        {suggestError && <p className="app__error">{suggestError}</p>}
      </div>

      <div className="home-split__right">
        <div className="home-context">
          <div className="home-context__prompt-wrap">
            <label className="home-context__label">What's the story?</label>
            <textarea
              className="home-context__textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g. "My friend fell asleep during the meeting, roast him"'
              rows={3}
            />
            <span className="home-context__label-hint">Leave empty and Chintu Memer will figure it out</span>
          </div>

          <div className="home-context__templates">
            <label className="home-context__label">
              Meme formats
              {selectedTemplates.length > 0 && (
                <span className="home-context__count">{selectedTemplates.length} selected</span>
              )}
            </label>
            <div className="home-context__chips">
              {TEMPLATES.map((t) => {
                const isSelected = selectedTemplates.includes(t.id)
                const isDisabled = !isSelected && selectedTemplates.length >= MAX_TEMPLATES
                return (
                  <button
                    key={t.id}
                    className={`home-context__chip ${isSelected ? 'home-context__chip--active' : ''}`}
                    onClick={() => handleToggleTemplate(t.id)}
                    disabled={isDisabled}
                  >
                    {t.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <WebcamCapture
        visible={webcamOpen}
        onHide={() => setWebcamOpen(false)}
        onCapture={handleFileSelect}
      />
    </div>
  )
}
