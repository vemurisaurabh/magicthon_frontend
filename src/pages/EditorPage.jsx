import { useRef, useCallback, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Toast } from 'primereact/toast'
import { CanvasEditor } from '../components/CanvasEditor.jsx'
import { EditorToolbar } from '../components/EditorToolbar.jsx'
import { ShareModal } from '../components/ShareModal.jsx'
import { selectTemplate, selectTextValues, updateText, undo, redo, clearEditor } from '../store/editorSlice.js'
import { selectUploadFile } from '../store/uploadSlice.js'
import { getTemplateById } from '../constants/templates.js'
import './EditorPage.css'

export default function EditorPage() {
  const dispatch = useDispatch()
  const suggestion = useSelector(selectTemplate)
  const textValues = useSelector(selectTextValues)
  const userPhoto = useSelector(selectUploadFile)
  const toastRef = useRef(null)
  const stageRef = useRef(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)

  const template = suggestion ? getTemplateById(suggestion.templateId) : null
  // #region agent log
  fetch('http://127.0.0.1:7464/ingest/3c64f30f-cc3c-43c5-a146-0267a694554f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b6fd39'},body:JSON.stringify({sessionId:'b6fd39',location:'EditorPage.jsx:render',message:'EditorPage render',data:{hasSuggestion:!!suggestion,templateId:suggestion?.templateId,hasTemplate:!!template,templateName:template?.name,hasUserPhoto:!!userPhoto},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        dispatch(redo())
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        dispatch(undo())
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dispatch])

  const handleTextChange = useCallback((zoneId, value) => {
    dispatch(updateText({ zoneId, value }))
  }, [dispatch])

  const handleBack = useCallback(() => {
    dispatch(clearEditor())
  }, [dispatch])

  const handleExport = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return
    const dataUrl = stage.toDataURL({ pixelRatio: 2 })
    const link = document.createElement('a')
    link.download = 'chintu-meme.png'
    link.href = dataUrl
    link.click()

    if (navigator.clipboard && window.ClipboardItem) {
      stage.toCanvas({ pixelRatio: 2 }).toBlob((blob) => {
        if (blob) {
          navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })])
          toastRef.current?.show({ severity: 'success', summary: 'Copied to clipboard', life: 2000 })
        }
      })
    }
  }, [])

  const handleShare = useCallback(() => {
    setShareModalOpen(true)
  }, [])

  if (!template || !suggestion) return null

  return (
    <div className="editor-page">
      <Toast ref={toastRef} />
      <EditorToolbar
        templateName={template.name}
        onBack={handleBack}
        onExport={handleExport}
        onShare={handleShare}
      />
      <CanvasEditor
        template={template}
        userPhoto={userPhoto}
        textValues={textValues}
        onTextChange={handleTextChange}
        stageRef={stageRef}
      />
      <ShareModal
        visible={shareModalOpen}
        onHide={() => setShareModalOpen(false)}
        stageRef={stageRef}
        templateId={suggestion?.templateId}
        textValues={textValues}
      />
    </div>
  )
}
