import { useRef, useCallback, useState } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
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
    <div className="saved">
      <Toast ref={toastRef} />

      <nav className="saved__toolbar">
        <button className="saved__toolbar-btn" onClick={() => navigate('/editor')}>
          <i className="pi pi-arrow-left" />
          <span>Back to editor</span>
        </button>
        <span className="saved__toolbar-logo" onClick={() => navigate('/')} role="button" tabIndex={0}>
          Chintu Memer
        </span>
        <button className="saved__toolbar-btn" onClick={() => navigate('/')}>
          <i className="pi pi-home" />
          <span>New meme</span>
        </button>
      </nav>

      <div className="saved__body">
        <div className="saved__preview">
          <img src={imageDataUrl} alt="Your meme" className="saved__image" />
        </div>

        <div className="saved__sidebar">
          <div className="saved__hero">
            <div className="saved__hero-badge">
              <i className="pi pi-check" />
              <span>Ready</span>
            </div>
            <h2 className="saved__hero-title">Your meme is ready</h2>
          </div>

          <div className="saved__actions">
            <button className="saved__action saved__action--primary" onClick={handleDownload}>
              <i className="pi pi-download" />
              <span>Download</span>
            </button>
            <button className="saved__action" onClick={handleCopyImage}>
              <i className="pi pi-copy" />
              <span>Copy image</span>
            </button>
            {supportsNativeShare && (
              <button className="saved__action" onClick={handleNativeShare}>
                <i className="pi pi-share-alt" />
                <span>Share</span>
              </button>
            )}
          </div>

          <div className="saved__link-section">
            <div className="saved__link-header">
              <i className="pi pi-globe" />
              <span>Share with the world</span>
            </div>
            {!shareUrl ? (
              <button
                className="saved__action saved__action--link"
                onClick={handleGetLink}
                disabled={linkLoading}
              >
                <i className={linkLoading ? 'pi pi-spin pi-spinner' : 'pi pi-link'} />
                <span>{linkLoading ? 'Generating...' : 'Generate link'}</span>
              </button>
            ) : (
              <div className="saved__url-row">
                <input
                  className="saved__url-input"
                  value={shareUrl}
                  readOnly
                  onClick={(e) => e.target.select()}
                />
                <button className="saved__action saved__action--copy" onClick={handleCopyLink}>
                  <i className="pi pi-copy" />
                  <span>{linkCopied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
