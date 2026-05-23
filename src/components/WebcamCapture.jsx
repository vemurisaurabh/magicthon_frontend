import { useRef, useEffect, useState, useCallback } from 'react'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { motion, AnimatePresence } from 'framer-motion'
import './WebcamCapture.css'

const fadeVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export function WebcamCapture({ visible, onHide, onCapture }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [ready, setReady] = useState(false)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setReady(true)
      }
    } catch {
      setReady(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setReady(false)
  }, [])

  useEffect(() => {
    if (visible) startCamera()
    else stopCamera()
    return stopCamera
  }, [visible, startCamera, stopCamera])

  const handleCapture = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'webcam-capture.jpg', { type: 'image/jpeg' })
        onCapture(file)
        onHide()
      }
    }, 'image/jpeg', 0.9)
  }, [onCapture, onHide])

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Take a photo"
      className="webcam-dialog"
      modal
      dismissableMask
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            className="webcam-capture"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="webcam-capture__video"
            />
            <Button
              icon="pi pi-camera"
              rounded
              severity="warning"
              className="webcam-capture__btn"
              onClick={handleCapture}
              disabled={!ready}
              aria-label="Capture photo"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  )
}
