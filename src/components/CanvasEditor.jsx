import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer } from 'react-konva'
import { buildTextConfig, buildImageConfig } from '../lib/canvasHelpers.js'
import {
  selectZoneStyles,
  updateZoneStyle,
  updateZonePosition,
} from '../store/editorSlice.js'
import './CanvasEditor.css'

const COLOR_SWATCHES = ['#FFFFFF', '#000000', '#F5E642', '#FF4444', '#00DDFF', '#44FF44', '#FF69B4', '#FFA500']

const FONT_FAMILIES = [
  { label: 'Impact', value: 'Impact, Anton, sans-serif' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Comic Sans', value: '"Comic Sans MS", cursive' },
  { label: 'Bebas Neue', value: '"Bebas Neue", sans-serif' },
]

const DEFAULT_STYLE = {
  fontSize: 48,
  fontFamily: 'Impact, Anton, sans-serif',
  fill: '#FFFFFF',
  stroke: '#000000',
  strokeWidth: 2,
  shadowEnabled: true,
  shadowBlur: 4,
}

export function CanvasEditor({ template, userPhoto, textValues, onTextChange, stageRef }) {
  const dispatch = useDispatch()
  const zoneStyles = useSelector(selectZoneStyles)
  const containerRef = useRef(null)
  const textRefs = useRef({})
  const transformerRef = useRef(null)
  const [stageSize, setStageSize] = useState(600)
  const [img, setImg] = useState(null)
  const [activeZone, setActiveZone] = useState(null)

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

  useEffect(() => {
    const tr = transformerRef.current
    if (!tr) return
    if (activeZone && textRefs.current[activeZone]) {
      tr.nodes([textRefs.current[activeZone]])
      tr.getLayer().batchDraw()
    } else {
      tr.nodes([])
      tr.getLayer()?.batchDraw()
    }
  }, [activeZone, textValues, zoneStyles])

  const imgConfig = useMemo(() => {
    if (!img) return null
    return buildImageConfig(img, stageSize, stageSize)
  }, [img, stageSize])

  const getZoneStyle = useCallback((zoneId) => {
    return zoneStyles[zoneId] || DEFAULT_STYLE
  }, [zoneStyles])

  const textConfigs = useMemo(() => {
    if (!template?.textZones) return []
    return template.textZones.map((zone) => {
      const style = getZoneStyle(zone.id)
      return buildTextConfig(zone.id, textValues[zone.id] || '', stageSize, stageSize, style)
    })
  }, [template, textValues, stageSize, zoneStyles, getZoneStyle])

  const handleTextClick = useCallback((zoneId) => {
    setActiveZone(zoneId)
  }, [])

  const handleStageClick = useCallback((e) => {
    if (e.target === e.target.getStage() || e.target.getClassName() === 'Image') {
      setActiveZone(null)
    }
  }, [])

  const handleDragEnd = useCallback((zoneId, e) => {
    dispatch(updateZonePosition({
      zoneId,
      x: e.target.x(),
      y: e.target.y(),
    }))
  }, [dispatch])

  const handleTransformEnd = useCallback((zoneId, e) => {
    const node = e.target
    const scaleX = node.scaleX()
    const style = getZoneStyle(zoneId)
    const newFontSize = Math.round(style.fontSize * scaleX)
    node.scaleX(1)
    node.scaleY(1)
    dispatch(updateZoneStyle({
      zoneId,
      styleProps: { fontSize: Math.max(12, Math.min(200, newFontSize)) },
    }))
    dispatch(updateZonePosition({
      zoneId,
      x: node.x(),
      y: node.y(),
    }))
  }, [dispatch, getZoneStyle])

  const handleInputChange = useCallback((zoneId, value) => {
    onTextChange(zoneId, value)
  }, [onTextChange])

  const handleStyleChange = useCallback((prop, value) => {
    if (!activeZone) return
    dispatch(updateZoneStyle({ zoneId: activeZone, styleProps: { [prop]: value } }))
  }, [dispatch, activeZone])

  const activeStyle = activeZone ? getZoneStyle(activeZone) : DEFAULT_STYLE

  // #region agent log
  fetch('http://127.0.0.1:7464/ingest/3c64f30f-cc3c-43c5-a146-0267a694554f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b6fd39'},body:JSON.stringify({sessionId:'b6fd39',location:'CanvasEditor.jsx:render',message:'CanvasEditor render',data:{hasTemplate:!!template,textZoneCount:template?.textZones?.length,hasUserPhoto:!!userPhoto,hasImg:!!img,stageSize,zoneStyleKeys:Object.keys(zoneStyles||{}),textConfigCount:textConfigs?.length},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  return (
    <div className="canvas-editor" ref={containerRef}>
      <Stage
        width={stageSize}
        height={stageSize}
        ref={stageRef}
        className="canvas-editor__stage"
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        <Layer>
          {imgConfig && <KonvaImage {...imgConfig} />}
          {template?.textZones?.map((zone, i) => (
            <KonvaText
              key={zone.id}
              ref={(node) => { textRefs.current[zone.id] = node }}
              {...textConfigs[i]}
              onClick={() => handleTextClick(zone.id)}
              onTap={() => handleTextClick(zone.id)}
              onDragEnd={(e) => handleDragEnd(zone.id, e)}
              onTransformEnd={(e) => handleTransformEnd(zone.id, e)}
            />
          ))}
          <Transformer
            ref={transformerRef}
            rotateEnabled={false}
            enabledAnchors={['middle-left', 'middle-right']}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 30) return oldBox
              return newBox
            }}
          />
        </Layer>
      </Stage>

      {activeZone && (
        <div className="canvas-editor__panel">
          <div className="canvas-editor__panel-header">
            <label className="canvas-editor__panel-label">
              {template?.textZones?.find((z) => z.id === activeZone)?.label || activeZone}
            </label>
            <button
              className="canvas-editor__panel-close"
              onClick={() => setActiveZone(null)}
              aria-label="Close panel"
            >
              &times;
            </button>
          </div>

          <textarea
            className="canvas-editor__textarea"
            value={textValues[activeZone] || ''}
            onChange={(e) => handleInputChange(activeZone, e.target.value)}
            rows={2}
          />

          <div className="canvas-editor__control-group">
            <span className="canvas-editor__group-title">Font</span>
            <div className="canvas-editor__font-row">
              <select
                className="canvas-editor__font-select"
                value={activeStyle.fontFamily}
                onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <div className="canvas-editor__slider-wrap">
                <span className="canvas-editor__slider-label">Size</span>
                <input
                  type="range"
                  min={12}
                  max={120}
                  value={activeStyle.fontSize}
                  onChange={(e) => handleStyleChange('fontSize', Number(e.target.value))}
                  className="canvas-editor__slider"
                />
                <span className="canvas-editor__slider-value">{activeStyle.fontSize}</span>
              </div>
            </div>
          </div>

          <div className="canvas-editor__control-group">
            <span className="canvas-editor__group-title">Fill Color</span>
            <div className="canvas-editor__swatches">
              {COLOR_SWATCHES.map((c) => (
                <button
                  key={c}
                  className={`canvas-editor__swatch ${activeStyle.fill === c ? 'canvas-editor__swatch--active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => handleStyleChange('fill', c)}
                  aria-label={`Fill ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="canvas-editor__control-group">
            <span className="canvas-editor__group-title">Outline</span>
            <div className="canvas-editor__outline-row">
              <div className="canvas-editor__swatches">
                {COLOR_SWATCHES.map((c) => (
                  <button
                    key={c}
                    className={`canvas-editor__swatch canvas-editor__swatch--stroke ${activeStyle.stroke === c ? 'canvas-editor__swatch--active' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => handleStyleChange('stroke', c)}
                    aria-label={`Stroke ${c}`}
                  />
                ))}
              </div>
              <div className="canvas-editor__slider-wrap">
                <span className="canvas-editor__slider-label">Width</span>
                <input
                  type="range"
                  min={0}
                  max={8}
                  step={0.5}
                  value={activeStyle.strokeWidth}
                  onChange={(e) => handleStyleChange('strokeWidth', Number(e.target.value))}
                  className="canvas-editor__slider"
                />
                <span className="canvas-editor__slider-value">{activeStyle.strokeWidth}</span>
              </div>
            </div>
          </div>

          <div className="canvas-editor__control-group">
            <span className="canvas-editor__group-title">Shadow</span>
            <div className="canvas-editor__shadow-row">
              <label className="canvas-editor__toggle">
                <input
                  type="checkbox"
                  checked={activeStyle.shadowEnabled}
                  onChange={(e) => handleStyleChange('shadowEnabled', e.target.checked)}
                />
                <span className="canvas-editor__toggle-label">Enabled</span>
              </label>
              {activeStyle.shadowEnabled && (
                <div className="canvas-editor__slider-wrap">
                  <span className="canvas-editor__slider-label">Blur</span>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={activeStyle.shadowBlur}
                    onChange={(e) => handleStyleChange('shadowBlur', Number(e.target.value))}
                    className="canvas-editor__slider"
                  />
                  <span className="canvas-editor__slider-value">{activeStyle.shadowBlur}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
