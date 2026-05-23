import { useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Navigate } from 'react-router-dom'
import { SuggestionsGrid } from '../components/SuggestionsGrid.jsx'
import { setFile, clearFile, selectUploadFile } from '../store/uploadSlice.js'
import {
  analyzePhoto, refineSuggestions, generateMemeImages, clearSuggestions,
  selectSuggestions, selectSuggestStatus, selectRefineStatus,
  selectGeneratedImages, selectImageGenStatus, retryGenerateMemeImage,
} from '../store/suggestSlice.js'
import { setSelectedTemplate, clearEditor } from '../store/editorSlice.js'

export default function SuggestionsPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const suggestions = useSelector(selectSuggestions)
  const suggestStatus = useSelector(selectSuggestStatus)
  const refineStatus = useSelector(selectRefineStatus)
  const generatedImages = useSelector(selectGeneratedImages)
  const imageGenStatus = useSelector(selectImageGenStatus)
  const file = useSelector(selectUploadFile)

  useEffect(() => {
    if (
      suggestStatus === 'succeeded' &&
      suggestions.length > 0 &&
      file &&
      imageGenStatus === 'idle'
    ) {
      dispatch(generateMemeImages({ file, suggestions }))
    }
  }, [suggestStatus, suggestions.length, file, imageGenStatus, dispatch])

  const handleSelect = useCallback((suggestion, useAiImage) => {
    const payload = { ...suggestion }
    if (useAiImage && generatedImages[suggestion.templateId]) {
      payload._aiImageUrl = generatedImages[suggestion.templateId]
    }
    dispatch(setSelectedTemplate(payload))
    navigate('/editor')
  }, [dispatch, navigate, generatedImages])

  const handleRetryGenerate = useCallback((templateId) => {
    if (!file) return
    const suggestion = suggestions.find((s) => s.templateId === templateId)
    if (!suggestion) return
    dispatch(retryGenerateMemeImage({ file, suggestion }))
  }, [dispatch, file, suggestions])

  const handleStartOver = useCallback(() => {
    dispatch(clearFile())
    dispatch(clearSuggestions())
    dispatch(clearEditor())
    navigate('/')
  }, [dispatch, navigate])

  const handleNewPhoto = useCallback((f) => {
    const url = URL.createObjectURL(f)
    dispatch(setFile({ file: f, previewUrl: url }))
    dispatch(clearSuggestions())
    dispatch(analyzePhoto({ file: f }))
    navigate('/')
  }, [dispatch, navigate])

  const handleRefine = useCallback((feedback) => {
    if (!file || !suggestions.length || refineStatus === 'loading') return
    dispatch(refineSuggestions({
      file,
      previousSuggestions: suggestions,
      feedback,
    }))
  }, [dispatch, file, suggestions, refineStatus])

  if (suggestStatus !== 'succeeded' || suggestions.length === 0) {
    return <Navigate to="/" replace />
  }

  return (
    <SuggestionsGrid
      suggestions={suggestions}
      generatedImages={generatedImages}
      imageGenDone={imageGenStatus === 'done'}
      onSelect={handleSelect}
      onRetryGenerate={handleRetryGenerate}
      onStartOver={handleStartOver}
      onNewPhoto={handleNewPhoto}
      onRefine={handleRefine}
      refining={refineStatus === 'loading'}
    />
  )
}
