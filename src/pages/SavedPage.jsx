import { useRef, useCallback, useState } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { shareMeme } from '../services/shareService.js'
import './SavedPage.css'

export default function SavedPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const toastRef = useRef(null)
  const { imageDataUrl, templateId } = location.state || {}
  const [linkLoading, setLinkLoading] = useState(false)
  const [shareUrl, setShareUrl] = useState(null)
  const [linkCopied, setLinkCopied] = useState(false)

  if (!imageDataUrl) return <Navigate to="/" replace />

  const handleDownload = useCallback(() => {
    const link = document.createElement('a')
    link.download = 'chintu-meme.png'
    link.href = imageDataUrl
    link.click()
    toastRef.current?.show({ severity: 'success', summary: 'Downloaded', life: 2000 })
  }, [imageDataUrl])

  const handleCopyImage = useCallback(async () => {
    try {
      const res = await fetch(imageDataUrl)
      const blob = await res.blob()
      await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })])
      toastRef.current?.show({ severity: 'success', summary: 'Copied to clipboard', life: 2000 })
    } catch {
      toastRef.current?.show({ severity: 'warn', summary: 'Clipboard not supported', life: 3000 })
    }
  }, [imageDataUrl])

  const handleGetLink = useCallback(async () => {
    setLinkLoading(true)
    try {
      const result = await shareMeme(imageDataUrl, templateId, {})
      setShareUrl(result.shareUrl)
    } catch (err) {
      toastRef.current?.show({ severity: 'error', summary: err.message || 'Failed to generate link', life: 3000 })
    } finally {
      setLinkLoading(false)
    }
  }, [imageDataUrl, templateId])

  const handleCopyLink = useCallback(() => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setLinkCopied(true)
      toastRef.current?.show({ severity: 'success', summary: 'Link copied', life: 2000 })
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }, [shareUrl])

  const handleNativeShare = useCallback(async () => {
    try {
      const res = await fetch(imageDataUrl)
      const blob = await res.blob()
      const file = new File([blob], 'chintu-meme.png', { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Check out my meme!', text: 'Made with Chintu Memer' })
      } else {
        toastRef.current?.show({ severity: 'info', summary: 'Use Copy or Download instead', life: 3000 })
      }
    } catch {
      /* user cancelled */
    }
  }, [imageDataUrl])

  const supportsNativeShare = typeof navigator !== 'undefined' && !!navigator.share

  return (
    <div className="saved-page">
      <Toast ref={toastRef} />

      <div className="saved-page__header">
        <h1 className="saved-page__title">Your meme is ready</h1>
        <p className="saved-page__subtitle">saved successfully</p>
      </div>

      <div className="saved-page__preview">
        <img src={imageDataUrl} alt="Your meme" className="saved-page__image" />
      </div>

      <div className="saved-page__actions">
        <Button
          icon="pi pi-download"
          label="Download"
          className="saved-page__btn saved-page__btn--primary"
          onClick={handleDownload}
        />
        <Button
          icon="pi pi-copy"
          label="Copy image"
          className="saved-page__btn"
          outlined
          onClick={handleCopyImage}
        />
        {supportsNativeShare && (
          <Button
            icon="pi pi-share-alt"
            label="Share"
            className="saved-page__btn"
            outlined
            onClick={handleNativeShare}
          />
        )}
      </div>

      <div className="saved-page__link-section">
        {!shareUrl ? (
          <Button
            icon="pi pi-link"
            label={linkLoading ? 'Generating...' : 'Generate shareable link'}
            className="saved-page__btn saved-page__btn--link"
            outlined
            onClick={handleGetLink}
            loading={linkLoading}
          />
        ) : (
          <div className="saved-page__url-row">
            <input
              className="saved-page__url-input"
              value={shareUrl}
              readOnly
              onClick={(e) => e.target.select()}
            />
            <Button
              icon="pi pi-copy"
              label={linkCopied ? 'Copied' : 'Copy'}
              className="saved-page__btn saved-page__btn--copy"
              size="small"
              onClick={handleCopyLink}
            />
          </div>
        )}
      </div>

      <div className="saved-page__footer">
        <Button
          label="← Back to editor"
          className="saved-page__btn saved-page__btn--back"
          text
          onClick={() => navigate('/editor')}
        />
        <Button
          label="Start over"
          className="saved-page__btn saved-page__btn--back"
          text
          onClick={() => navigate('/')}
        />
      </div>
    </div>
  )
}
