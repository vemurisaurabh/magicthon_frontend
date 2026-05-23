import { useCallback, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Navigate } from 'react-router-dom'
import { SuggestionsGrid } from '../components/SuggestionsGrid.jsx'
import { setFile, clearFile, selectUploadFile } from '../store/uploadSlice.js'
import { analyzePhoto, refineSuggestions, clearSuggestions, selectSuggestions, selectSuggestStatus, selectRefineStatus } from '../store/suggestSlice.js'
import { setSelectedTemplate, clearEditor } from '../store/editorSlice.js'

export default function SuggestionsPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const suggestions = useSelector(selectSuggestions)
  const suggestStatus = useSelector(selectSuggestStatus)
  const refineStatus = useSelector(selectRefineStatus)
  const file = useSelector(selectUploadFile)

  const handleSelect = useCallback((suggestion) => {
    dispatch(setSelectedTemplate(suggestion))
    navigate('/editor')
  }, [dispatch, navigate])

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
      onSelect={handleSelect}
      onStartOver={handleStartOver}
      onNewPhoto={handleNewPhoto}
      onRefine={handleRefine}
      refining={refineStatus === 'loading'}
    />
  )
}
