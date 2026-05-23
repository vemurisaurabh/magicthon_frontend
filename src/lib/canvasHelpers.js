export function buildTextConfig(zoneId, value, stageWidth, stageHeight, options = {}) {
  const fontSize = options.fontSize || 48
  const fontFamily = options.fontFamily || 'Impact, Anton, sans-serif'
  const fill = options.fill || '#FFFFFF'
  const stroke = options.stroke ?? '#000000'
  const strokeWidth = options.strokeWidth ?? 2
  const shadowEnabled = options.shadowEnabled ?? true
  const shadowBlur = options.shadowBlur ?? 4
  const isTop = zoneId === 'top'

  const defaultX = stageWidth * 0.05
  const defaultY = isTop ? stageHeight * 0.05 : stageHeight * 0.75
  const x = options.x != null ? options.x : defaultX
  const y = options.y != null ? options.y : defaultY

  return {
    text: value || '',
    fontSize,
    fontFamily,
    fill,
    stroke,
    strokeWidth,
    align: 'center',
    width: stageWidth * 0.9,
    x,
    y,
    draggable: true,
    wrap: 'word',
    shadowColor: '#000000',
    shadowBlur: shadowEnabled ? shadowBlur : 0,
    shadowOffset: { x: 2, y: 2 },
    shadowOpacity: shadowEnabled ? 0.6 : 0,
  }
}

export function buildImageConfig(imgElement, stageWidth, stageHeight) {
  const imgRatio = imgElement.width / imgElement.height
  const stageRatio = stageWidth / stageHeight
  let width, height, x, y

  if (imgRatio > stageRatio) {
    height = stageHeight
    width = height * imgRatio
    x = (stageWidth - width) / 2
    y = 0
  } else {
    width = stageWidth
    height = width / imgRatio
    x = 0
    y = (stageHeight - height) / 2
  }

  return { image: imgElement, x, y, width, height }
}
