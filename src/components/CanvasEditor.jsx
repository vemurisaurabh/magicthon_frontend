import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer } from 'react-konva'
import { buildTextConfig, buildImageConfig } from '../lib/canvasHelpers.js'
import {
  selectLayers,
  selectActiveLayerId,
  selectActiveLayer,
  addLayer,
  removeLayer,
  setActiveLayer,
  updateLayerText,
  updateLayerStyle,
  updateLayerPosition,
} from '../store/editorSlice.js'
import './CanvasEditor.css'

const COLOR_SWATCHES = ['#FFFFFF', '#000000', '#F5E642', '#FF4444', '#00DDFF', '#44FF44', '#FF69B4', '#FFA500']

const FONT_FAMILIES = [
  { label: 'Impact', value: 'Impact, Anton, sans-serif' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Comic Sans', value: '"Comic Sans MS", cursive' },
  { label: 'Bebas Neue', value: '"Bebas Neue", sans-serif' },
]

export function CanvasEditor({ template, userPhoto, stageRef, onSave, onDownload, onCopy, onShare, saving }) {
  const dispatch = useDispatch()
  const layers = useSelector(selectLayers)
  const activeLayerId = useSelector(selectActiveLayerId)
  const activeLayer = useSelector(selectActiveLayer)
  const containerRef = useRef(null)
  const textRefs = useRef({})
  const transformerRef = useRef(null)
  const [stageSize, setStageSize] = useState(400)
  const [img, setImg] = useState(null)

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const isMobile = window.innerWidth <= 559
        const maxCap = isMobile ? rect.width - 16 : 600
        const maxSide = Math.min(rect.width, rect.height, maxCap)
        setStageSize(Math.max(240, maxSide))
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
    if (activeLayerId && textRefs.current[activeLayerId]) {
      tr.nodes([textRefs.current[activeLayerId]])
      tr.getLayer().batchDraw()
    } else {
      tr.nodes([])
      tr.getLayer()?.batchDraw()
    }
  }, [activeLayerId, layers])

  const imgConfig = useMemo(() => {
    if (!img) return null
    return buildImageConfig(img, stageSize, stageSize)
  }, [img, stageSize])

  const textConfigs = useMemo(() => {
    return layers.map((layer) => buildTextConfig(layer, stageSize, stageSize))
  }, [layers, stageSize])

  const handleStageClick = useCallback((e) => {
    if (e.target === e.target.getStage() || e.target.getClassName() === 'Image') {
      dispatch(setActiveLayer(null))
    }
  }, [dispatch])

  const handleStageDblClick = useCallback((e) => {
    const stage = e.target.getStage()
    if (e.target !== stage && e.target.getClassName() !== 'Image') return
    const pointer = stage.getPointerPosition()
    if (!pointer) return
    dispatch(addLayer({
      x: pointer.x / stageSize,
      y: pointer.y / stageSize,
    }))
  }, [dispatch, stageSize])

  const handleTextClick = useCallback((layerId) => {
    dispatch(setActiveLayer(layerId))
  }, [dispatch])

  const handleDragEnd = useCallback((layerId, e) => {
    dispatch(updateLayerPosition({
      id: layerId,
      x: e.target.x() / stageSize,
      y: e.target.y() / stageSize,
    }))
  }, [dispatch, stageSize])

  const handleTransformEnd = useCallback((layerId, e) => {
    const node = e.target
    const scaleX = node.scaleX()
    const layer = layers.find((l) => l.id === layerId)
    if (!layer) return
    const newFontSize = Math.round(layer.fontSize * scaleX)
    node.scaleX(1)
    node.scaleY(1)
    dispatch(updateLayerStyle({
      id: layerId,
      styleProps: { fontSize: Math.max(12, Math.min(200, newFontSize)) },
    }))
    dispatch(updateLayerPosition({
      id: layerId,
      x: node.x() / stageSize,
      y: node.y() / stageSize,
    }))
  }, [dispatch, layers, stageSize])

  const handleStyleChange = useCallback((prop, value) => {
    if (!activeLayerId) return
    dispatch(updateLayerStyle({ id: activeLayerId, styleProps: { [prop]: value } }))
  }, [dispatch, activeLayerId])

  const handleDeleteLayer = useCallback(() => {
    if (activeLayerId) dispatch(removeLayer(activeLayerId))
  }, [dispatch, activeLayerId])

  return (
    <div className="canvas-editor">
      <div className="canvas-editor__canvas-area" ref={containerRef}>
        <Stage
          width={stageSize}
          height={stageSize}
          ref={stageRef}
          className="canvas-editor__stage"
          onClick={handleStageClick}
          onTap={handleStageClick}
          onDblClick={handleStageDblClick}
          onDblTap={handleStageDblClick}
        >
          <Layer>
            {imgConfig && <KonvaImage {...imgConfig} />}
            {layers.map((layer, i) => (
              <KonvaText
                key={layer.id}
                ref={(node) => { textRefs.current[layer.id] = node }}
                {...textConfigs[i]}
                onClick={() => handleTextClick(layer.id)}
                onTap={() => handleTextClick(layer.id)}
                onDragEnd={(e) => handleDragEnd(layer.id, e)}
                onTransformEnd={(e) => handleTransformEnd(layer.id, e)}
                onMouseEnter={(e) => {
                  e.target.getStage().container().style.cursor = 'move'
                }}
                onMouseLeave={(e) => {
                  e.target.getStage().container().style.cursor = 'crosshair'
                }}
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
        <p className="canvas-editor__hint">Double-click on the image to add text</p>
        <div className="canvas-editor__actions">
          <button className="canvas-editor__action canvas-editor__action--save" onClick={onSave} disabled={saving}>
            <i className={saving ? 'pi pi-spin pi-spinner' : 'pi pi-save'} />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
          <button className="canvas-editor__action" onClick={onDownload}>
            <i className="pi pi-download" />
            <span>Download</span>
          </button>
          <button className="canvas-editor__action" onClick={onCopy}>
            <i className="pi pi-copy" />
            <span>Copy</span>
          </button>
          <button className="canvas-editor__action" onClick={onShare}>
            <i className="pi pi-link" />
            <span>Share</span>
          </button>
        </div>
      </div>

      <div className="canvas-editor__sidebar">
        <div className="canvas-editor__layers-header">
          <span className="canvas-editor__group-title">Text Layers</span>
          <button
            className="canvas-editor__add-btn"
            onClick={() => dispatch(addLayer({ x: 0.05, y: 0.1 + layers.length * 0.15 }))}
            title="Add text layer"
          >
            <i className="pi pi-plus" />
          </button>
        </div>

        <div className="canvas-editor__layer-list">
          {layers.map((layer) => (
            <button
              key={layer.id}
              className={`canvas-editor__layer-item ${activeLayerId === layer.id ? 'canvas-editor__layer-item--active' : ''}`}
              onClick={() => dispatch(setActiveLayer(layer.id))}
            >
              <span className="canvas-editor__layer-preview">
                {layer.text || 'Empty text'}
              </span>
              <i
                className="pi pi-trash canvas-editor__layer-delete"
                onClick={(e) => {
                  e.stopPropagation()
                  dispatch(removeLayer(layer.id))
                }}
              />
            </button>
          ))}
          {layers.length === 0 && (
            <p className="canvas-editor__empty-hint">
              Double-click on the canvas or press + to add text
            </p>
          )}
        </div>

        {activeLayer && (
          <>
            <textarea
              className="canvas-editor__textarea"
              value={activeLayer.text}
              onChange={(e) => dispatch(updateLayerText({ id: activeLayer.id, text: e.target.value }))}
              rows={2}
              placeholder="Type your meme text..."
            />

            <div className="canvas-editor__control-group">
              <span className="canvas-editor__group-title">Font</span>
              <div className="canvas-editor__font-row">
                <select
                  className="canvas-editor__font-select"
                  value={activeLayer.fontFamily}
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
                    value={activeLayer.fontSize}
                    onChange={(e) => handleStyleChange('fontSize', Number(e.target.value))}
                    className="canvas-editor__slider"
                  />
                  <span className="canvas-editor__slider-value">{activeLayer.fontSize}</span>
                </div>
              </div>
            </div>

            <div className="canvas-editor__control-group">
              <span className="canvas-editor__group-title">Fill Color</span>
              <div className="canvas-editor__swatches">
                {COLOR_SWATCHES.map((c) => (
                  <button
                    key={c}
                    className={`canvas-editor__swatch ${activeLayer.fill === c ? 'canvas-editor__swatch--active' : ''}`}
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
                      className={`canvas-editor__swatch canvas-editor__swatch--stroke ${activeLayer.stroke === c ? 'canvas-editor__swatch--active' : ''}`}
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
                    value={activeLayer.strokeWidth}
                    onChange={(e) => handleStyleChange('strokeWidth', Number(e.target.value))}
                    className="canvas-editor__slider"
                  />
                  <span className="canvas-editor__slider-value">{activeLayer.strokeWidth}</span>
                </div>
              </div>
            </div>

            <div className="canvas-editor__control-group">
              <span className="canvas-editor__group-title">Shadow</span>
              <div className="canvas-editor__shadow-row">
                <label className="canvas-editor__toggle">
                  <input
                    type="checkbox"
                    checked={activeLayer.shadowEnabled}
                    onChange={(e) => handleStyleChange('shadowEnabled', e.target.checked)}
                  />
                  <span className="canvas-editor__toggle-label">Enabled</span>
                </label>
                {activeLayer.shadowEnabled && (
                  <div className="canvas-editor__slider-wrap">
                    <span className="canvas-editor__slider-label">Blur</span>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={activeLayer.shadowBlur}
                      onChange={(e) => handleStyleChange('shadowBlur', Number(e.target.value))}
                      className="canvas-editor__slider"
                    />
                    <span className="canvas-editor__slider-value">{activeLayer.shadowBlur}</span>
                  </div>
                )}
              </div>
            </div>

            <button className="canvas-editor__delete-layer" onClick={handleDeleteLayer}>
              <i className="pi pi-trash" /> Delete this layer
            </button>
          </>
        )}
      </div>
    </div>
  )
}
