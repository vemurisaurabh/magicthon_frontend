import { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Button } from 'primereact/button'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadZone } from './components/UploadZone.jsx'
import { WebcamCapture } from './components/WebcamCapture.jsx'
import { AnalysisLoading } from './components/AnalysisLoading.jsx'
import { SuggestionsGrid } from './components/SuggestionsGrid.jsx'
import EditorPage from './pages/EditorPage.jsx'
import SharePage from './pages/SharePage.jsx'
import { setFile, clearFile, selectUploadFile, selectPreviewUrl } from './store/uploadSlice.js'
import { analyzePhoto, clearSuggestions, selectSuggestStatus, selectSuggestions, selectSuggestError } from './store/suggestSlice.js'
import { setSelectedTemplate, clearEditor, selectTemplate } from './store/editorSlice.js'
import './App.css'

const pageVariants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
}

const pressVariants = {
  idle: { scale: 1 },
  tap: { scale: 0.97 },
}

function getView(file, suggestStatus, selectedTemplate) {
  if (selectedTemplate) return 'editor'
  if (suggestStatus === 'loading') return 'loading'
  if (suggestStatus === 'succeeded') return 'suggestions'
  return 'upload'
}

function MainApp() {
  const dispatch = useDispatch()
  const file = useSelector(selectUploadFile)
  const previewUrl = useSelector(selectPreviewUrl)
  const suggestStatus = useSelector(selectSuggestStatus)
  const suggestions = useSelector(selectSuggestions)
  const suggestError = useSelector(selectSuggestError)
  const selectedTemplate = useSelector(selectTemplate)
  const [webcamOpen, setWebcamOpen] = useState(false)
  const luckyRef = useRef(false)

  useEffect(() => {
    if (luckyRef.current && suggestStatus === 'succeeded' && suggestions.length > 0) {
      luckyRef.current = false
      dispatch(setSelectedTemplate(suggestions[0]))
    }
  }, [suggestStatus, suggestions, dispatch])

  const handleLucky = useCallback(() => {
    if (file) {
      luckyRef.current = true
      dispatch(analyzePhoto(file))
    }
  }, [dispatch, file])

  const view = useMemo(
    () => getView(file, suggestStatus, selectedTemplate),
    [file, suggestStatus, selectedTemplate]
  )

  const handleFileSelect = useCallback((f) => {
    const url = URL.createObjectURL(f)
    dispatch(setFile({ file: f, previewUrl: url }))
  }, [dispatch])

  const handleAnalyze = useCallback(() => {
    if (file) dispatch(analyzePhoto(file))
  }, [dispatch, file])

  const handleSelectSuggestion = useCallback((suggestion) => {
    dispatch(setSelectedTemplate(suggestion))
  }, [dispatch])

  const handleStartOver = useCallback(() => {
    dispatch(clearFile())
    dispatch(clearSuggestions())
    dispatch(clearEditor())
  }, [dispatch])

  const handleBack = useCallback(() => {
    if (selectedTemplate) {
      dispatch(clearEditor())
    } else if (suggestStatus === 'succeeded') {
      dispatch(clearSuggestions())
    }
  }, [dispatch, selectedTemplate, suggestStatus])

  const handleNewPhoto = useCallback((f) => {
    const url = URL.createObjectURL(f)
    dispatch(setFile({ file: f, previewUrl: url }))
    dispatch(clearSuggestions())
    dispatch(analyzePhoto(f))
  }, [dispatch])

  const showBack = view !== 'upload'

  return (
    <>
      <nav className="app__nav">
        {showBack && (
          <button className="app__back-btn" onClick={handleBack} aria-label="Go back">
            <i className="pi pi-arrow-left" />
          </button>
        )}
        <span className="app__logo" onClick={handleStartOver} role="button" tabIndex={0}>
          Chintu Memer
        </span>
      </nav>

      <main className="app__content">
        <AnimatePresence mode="wait">
          {view === 'upload' && (
            <motion.div key="upload" className="app__view" variants={pageVariants} initial="enter" animate="center" exit="exit">
              <UploadZone
                onFileSelect={handleFileSelect}
                previewUrl={previewUrl}
                onWebcamClick={() => setWebcamOpen(true)}
              />
              <div className="app__buttons">
                <motion.div className="app__cta-wrap" variants={pressVariants} initial="idle" whileTap="tap">
                  <Button label="Analyse this chaos →" size="large" className="analyze-cta" disabled={!file} onClick={handleAnalyze} />
                </motion.div>
                <motion.div variants={pressVariants} initial="idle" whileTap="tap">
                  <Button label="🎰 Surprise me" size="large" outlined className="lucky-cta" disabled={!file} onClick={handleLucky} />
                </motion.div>
              </div>
              {suggestError && <p className="app__error">{suggestError}</p>}
            </motion.div>
          )}

          {view === 'loading' && (
            <motion.div key="loading" className="app__view" variants={pageVariants} initial="enter" animate="center" exit="exit">
              <AnalysisLoading />
            </motion.div>
          )}

          {view === 'suggestions' && (
            <motion.div key="suggestions" className="app__view" variants={pageVariants} initial="enter" animate="center" exit="exit">
              <SuggestionsGrid
                suggestions={suggestions}
                onSelect={handleSelectSuggestion}
                onStartOver={handleStartOver}
                onNewPhoto={handleNewPhoto}
              />
            </motion.div>
          )}

          {view === 'editor' && (
            <motion.div key="editor" className="app__view" variants={pageVariants} initial="enter" animate="center" exit="exit">
              <EditorPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <WebcamCapture
        visible={webcamOpen}
        onHide={() => setWebcamOpen(false)}
        onCapture={handleFileSelect}
      />
    </>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/m/:memeId" element={<SharePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
