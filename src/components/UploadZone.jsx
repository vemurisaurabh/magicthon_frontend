import { useRef, useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import './UploadZone.css'

const hoverVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.01 },
}

export function UploadZone({ onFileSelect, previewUrl, onWebcamClick }) {
  const inputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFiles = useCallback((files) => {
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        onFileSelect(file)
      }
    }
  }, [onFileSelect])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleInputChange = useCallback((e) => {
    handleFiles(e.target.files)
  }, [handleFiles])

  const handlePasteClick = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read()
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith('image/'))
        if (imageType) {
          const blob = await item.getType(imageType)
          const file = new File([blob], 'pasted-image.png', { type: imageType })
          onFileSelect(file)
          return
        }
      }
      // No image in clipboard -- fall through silently
    } catch {
      // Clipboard API not available or denied -- fall through
    }
  }, [onFileSelect])

  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) onFileSelect(file)
        }
      }
    }
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [onFileSelect])

  return (
    <div className="upload-zone">
      <motion.div
        className={`upload-zone__droparea ${isDragOver ? 'upload-zone__droparea--active' : ''}`}
        variants={hoverVariants}
        initial="idle"
        whileHover="hover"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="upload-zone__input"
          onChange={handleInputChange}
        />
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="upload-zone__preview" />
        ) : (
          <div className="upload-zone__placeholder">
            <i className="pi pi-image upload-zone__icon" />
            <p className="upload-zone__title">Drop your photo here</p>
            <div className="upload-zone__options">
              <button
                className="upload-zone__option"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
              >
                <i className="pi pi-upload" />
                <span>Browse files</span>
              </button>
              <button
                className="upload-zone__option"
                onClick={(e) => { e.stopPropagation(); handlePasteClick() }}
              >
                <i className="pi pi-clipboard" />
                <span>Paste from clipboard</span>
              </button>
              <button
                className="upload-zone__option"
                onClick={(e) => { e.stopPropagation(); onWebcamClick() }}
              >
                <i className="pi pi-camera" />
                <span>Webcam</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
