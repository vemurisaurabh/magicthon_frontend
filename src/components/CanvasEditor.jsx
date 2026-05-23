import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Stage, Layer, Image as KonvaImage, Text as KonvaText } from 'react-konva'
import { buildTextConfig, buildImageConfig } from '../lib/canvasHelpers.js'
import './CanvasEditor.css'

const COLOR_SWATCHES = ['#FFFFFF', '#000000', '#F5E642', '#FF4444', '#00DDFF', '#44FF44', '#FF69B4', '#FFA500']

export function CanvasEditor({ template, userPhoto, textValues, onTextChange, stageRef }) {
  const containerRef = useRef(null)
  const [stageSize, setStageSize] = useState(600)
  const [img, setImg] = useState(null)
  const [activeZone, setActiveZone] = useState(null)
  const [fontSize, setFontSize] = useState(48)
  const [fillColor, setFillColor] = useState('#FFFFFF')

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = Math.min(containerRef.current.offsetWidth, 600)
        setStageSize(w)
      }
    }
    updateSize()
    const observer = new ResizeObserver(updateSize)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!userPhoto) return
    const url = typeof userPhoto === 'string' ? userPhoto : URL.createObjectURL(userPhoto)
    const image = new window.Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => setImg(image)
    image.src = url
    return () => {
      if (typeof userPhoto !== 'string') URL.revokeObjectURL(url)
    }
  }, [userPhoto])

  const imgConfig = useMemo(() => {
    if (!img) return null
    return buildImageConfig(img, stageSize, stageSize)
  }, [img, stageSize])

  const textConfigs = useMemo(() => {
    if (!template?.textZones) return []
    return template.textZones.map((zone) =>
      buildTextConfig(zone.id, textValues[zone.id] || '', stageSize, stageSize, {
        fontSize: activeZone === zone.id ? fontSize : 48,
        fill: activeZone === zone.id ? fillColor : '#FFFFFF',
      })
    )
  }, [template, textValues, stageSize, activeZone, fontSize, fillColor])

  const handleTextClick = useCallback((zoneId) => {
    setActiveZone(zoneId)
  }, [])

  const handleInputChange = useCallback((zoneId, value) => {
    onTextChange(zoneId, value)
  }, [onTextChange])

  return (
    <div className="canvas-editor" ref={containerRef}>
      <Stage width={stageSize} height={stageSize} ref={stageRef} className="canvas-editor__stage">
        <Layer>
          {imgConfig && <KonvaImage {...imgConfig} />}
          {template?.textZones?.map((zone, i) => (
            <KonvaText
              key={zone.id}
              {...textConfigs[i]}
              onClick={() => handleTextClick(zone.id)}
              onTap={() => handleTextClick(zone.id)}
            />
          ))}
        </Layer>
      </Stage>

      {activeZone && (
        <div className="canvas-editor__panel">
          <label className="canvas-editor__panel-label">
            {template?.textZones?.find((z) => z.id === activeZone)?.label || activeZone}
          </label>
          <textarea
            className="canvas-editor__textarea"
            value={textValues[activeZone] || ''}
            onChange={(e) => handleInputChange(activeZone, e.target.value)}
            rows={2}
          />
          <div className="canvas-editor__controls">
            <div className="canvas-editor__slider-wrap">
              <span className="canvas-editor__slider-label">Size</span>
              <input
                type="range"
                min={20}
                max={100}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="canvas-editor__slider"
              />
            </div>
            <div className="canvas-editor__swatches">
              {COLOR_SWATCHES.map((c) => (
                <button
                  key={c}
                  className={`canvas-editor__swatch ${fillColor === c ? 'canvas-editor__swatch--active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setFillColor(c)}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
