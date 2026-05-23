import { useRef, useCallback, useState } from 'react'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { shareMeme } from '../services/shareService.js'
import './ShareModal.css'

export function ShareModal({ visible, onHide, stageRef, templateId, layers }) {
  const toastRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState(null)
  const [linkLoading, setLinkLoading] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const getBlob = useCallback(() => {
    return new Promise((resolve) => {
      const stage = stageRef?.current
      if (!stage) return resolve(null)
      stage.toCanvas({ pixelRatio: 2 }).toBlob((blob) => resolve(blob))
    })
  }, [stageRef])

  const handleDownload = useCallback(() => {
    const stage = stageRef?.current
    if (!stage) return
    const dataUrl = stage.toDataURL({ pixelRatio: 2 })
    const link = document.createElement('a')
    link.download = 'chintu-meme.png'
    link.href = dataUrl
    link.click()
    toastRef.current?.show({ severity: 'success', summary: 'Downloaded!', life: 2000 })
  }, [stageRef])

  const handleCopyImage = useCallback(async () => {
    const blob = await getBlob()
    if (!blob) return
    try {
      await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })])
      setCopied(true)
      toastRef.current?.show({ severity: 'success', summary: 'Image copied to clipboard!', life: 2000 })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toastRef.current?.show({ severity: 'warn', summary: 'Clipboard not supported — use Download instead', life: 3000 })
    }
  }, [getBlob])

  const handleGetLink = useCallback(async () => {
    const stage = stageRef?.current
    if (!stage) return
    setLinkLoading(true)
    try {
      const dataUrl = stage.toDataURL({ pixelRatio: 2 })
      const texts = (layers || []).reduce((acc, l) => {
        if (l.text) acc[l.id] = l.text
        return acc
      }, {})
      const result = await shareMeme(dataUrl, templateId, texts)
      setShareUrl(result.shareUrl)
    } catch (err) {
      toastRef.current?.show({ severity: 'error', summary: err.message || 'Failed to generate link', life: 3000 })
    } finally {
      setLinkLoading(false)
    }
  }, [stageRef, templateId, layers])

  const handleCopyLink = useCallback(() => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setLinkCopied(true)
      toastRef.current?.show({ severity: 'success', summary: 'Link copied!', life: 2000 })
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }, [shareUrl])

  const handleNativeShare = useCallback(async () => {
    const blob = await getBlob()
    if (!blob) return
    const file = new File([blob], 'chintu-meme.png', { type: 'image/png' })
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Check out my meme!', text: 'Made with Chintu Memer' })
      } catch {
        // user cancelled
      }
    } else {
      toastRef.current?.show({ severity: 'info', summary: 'Native share not supported — use Copy or Download', life: 3000 })
    }
  }, [getBlob])

  const supportsNativeShare = typeof navigator !== 'undefined' && !!navigator.share

  return (
    <>
      <Toast ref={toastRef} />
      <Dialog
        visible={visible}
        onHide={() => { onHide(); setShareUrl(null) }}
        header="Share your meme"
        className="share-dialog"
        modal
        dismissableMask
      >
        <div className="share-modal">
          <p className="share-modal__desc">Your meme is ready! Choose how to share it:</p>
          <div className="share-modal__actions">
            <Button
              label="Download PNG"
              icon="pi pi-download"
              onClick={handleDownload}
              className="share-modal__btn"
            />
            <Button
              label={copied ? 'Copied!' : 'Copy image to clipboard'}
              icon="pi pi-copy"
              onClick={handleCopyImage}
              className="share-modal__btn"
              severity="info"
              outlined
            />
            {supportsNativeShare && (
              <Button
                label="Share..."
                icon="pi pi-share-alt"
                onClick={handleNativeShare}
                className="share-modal__btn"
                severity="help"
                outlined
              />
            )}
          </div>

          <div className="share-modal__link-section">
            <p className="share-modal__link-label">Shareable link</p>
            {!shareUrl ? (
              <Button
                label={linkLoading ? 'Generating...' : 'Generate shareable link'}
                icon="pi pi-link"
                onClick={handleGetLink}
                loading={linkLoading}
                className="share-modal__btn"
                severity="secondary"
                outlined
              />
            ) : (
              <div className="share-modal__url-row">
                <input
                  className="share-modal__url-input"
                  value={shareUrl}
                  readOnly
                  onClick={(e) => e.target.select()}
                />
                <Button
                  label={linkCopied ? 'Copied!' : 'Copy'}
                  icon="pi pi-copy"
                  onClick={handleCopyLink}
                  className="share-modal__copy-btn"
                  size="small"
                />
              </div>
            )}
          </div>

          <p className="share-modal__hint">
            Tip: "Copy image to clipboard" lets you paste directly into WhatsApp, Slack, Discord, etc.
          </p>
        </div>
      </Dialog>
    </>
  )
}
