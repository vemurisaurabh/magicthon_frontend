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

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleInputChange = useCallback((e) => {
    handleFiles(e.target.files)
  }, [handleFiles])

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
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
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
            <i className="pi pi-cloud-upload upload-zone__icon" />
            <p className="upload-zone__title">Drop your most chaotic photo here</p>
            <p className="upload-zone__subtitle">or click to browse</p>
          </div>
        )}
      </motion.div>
      <div className="upload-zone__actions">
        <button className="upload-zone__paste-link" onClick={handleClick}>
          paste from clipboard
        </button>
        <button className="upload-zone__webcam-btn" onClick={onWebcamClick}>
          <i className="pi pi-camera" />
        </button>
      </div>
    </div>
  )
}
