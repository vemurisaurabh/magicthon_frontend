import { useRef, useCallback, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Navigate } from 'react-router-dom'
import { Toast } from 'primereact/toast'
import { CanvasEditor } from '../components/CanvasEditor.jsx'
import { EditorToolbar } from '../components/EditorToolbar.jsx'
import { selectTemplate, selectLayers, undo, redo, clearEditor } from '../store/editorSlice.js'
import { selectUploadFile, clearFile } from '../store/uploadSlice.js'
import { clearSuggestions } from '../store/suggestSlice.js'
import { getTemplateById } from '../constants/templates.js'
import { saveDraft } from '../services/draftService.js'
import { shareMeme } from '../services/shareService.js'
import './EditorPage.css'

export default function EditorPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const suggestion = useSelector(selectTemplate)
  const layers = useSelector(selectLayers)
  const userPhoto = useSelector(selectUploadFile)
  const toastRef = useRef(null)
  const stageRef = useRef(null)
  const [saving, setSaving] = useState(false)

  const template = suggestion ? getTemplateById(suggestion.templateId) : null

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        dispatch(redo())
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        dispatch(undo())
      } else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dispatch, suggestion, layers])

  const handleBack = useCallback(() => {
    dispatch(clearEditor())
    navigate('/suggestions')
  }, [dispatch, navigate])

  const handleStartOver = useCallback(() => {
    dispatch(clearFile())
    dispatch(clearSuggestions())
    dispatch(clearEditor())
    navigate('/')
  }, [dispatch, navigate])

  const handleSave = useCallback(async () => {
    if (!suggestion || saving) return
    setSaving(true)
    try {
      await saveDraft({
        templateId: suggestion.templateId,
        layers,
      })
      toastRef.current?.show({ severity: 'success', summary: 'Progress saved', life: 2000 })
    } catch {
      toastRef.current?.show({ severity: 'error', summary: 'Failed to save', life: 3000 })
    } finally {
      setSaving(false)
    }
  }, [suggestion, layers, saving])

  const handleDownload = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return
    const dataUrl = stage.toDataURL({ pixelRatio: 2 })
    const link = document.createElement('a')
    link.download = 'chintu-meme.png'
    link.href = dataUrl
    link.click()
    toastRef.current?.show({ severity: 'success', summary: 'Downloaded', life: 2000 })
  }, [])

  const handleCopy = useCallback(async () => {
    const stage = stageRef.current
    if (!stage) return
    try {
      const blob = await new Promise((resolve) => {
        stage.toCanvas({ pixelRatio: 2 }).toBlob(resolve)
      })
      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })])
        toastRef.current?.show({ severity: 'success', summary: 'Copied to clipboard', life: 2000 })
      }
    } catch {
      toastRef.current?.show({ severity: 'warn', summary: 'Clipboard not supported', life: 3000 })
    }
  }, [])

  const [sharing, setSharing] = useState(false)

  const handleShare = useCallback(async () => {
    const stage = stageRef.current
    if (!stage || sharing) return
    setSharing(true)
    try {
      const dataUrl = stage.toDataURL({ pixelRatio: 2 })
      const result = await shareMeme(dataUrl, suggestion?.templateId, {})
      const url = result.shareUrl

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        toastRef.current?.show({ severity: 'success', summary: 'Shareable link copied!', detail: url, life: 4000 })
      } else {
        toastRef.current?.show({ severity: 'info', summary: 'Shareable link', detail: url, life: 6000 })
      }
    } catch (err) {
      toastRef.current?.show({ severity: 'error', summary: err.message || 'Failed to generate link', life: 3000 })
    } finally {
      setSharing(false)
    }
  }, [suggestion, sharing])

  if (!template || !suggestion) return <Navigate to="/" replace />

  return (
    <div className="editor-page">
      <Toast ref={toastRef} />
      <EditorToolbar
        templateName={template.name}
        onBack={handleBack}
        onLogoClick={handleStartOver}
      />
      <div className="editor-page__body">
        <CanvasEditor
          template={template}
          userPhoto={userPhoto}
          stageRef={stageRef}
          onSave={handleSave}
          onDownload={handleDownload}
          onCopy={handleCopy}
          onShare={handleShare}
          saving={saving}
          sharing={sharing}
        />
      </div>
    </div>
  )
}
