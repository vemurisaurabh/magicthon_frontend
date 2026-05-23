export function buildTextConfig(layer, stageWidth, stageHeight) {
  const x = layer.x * stageWidth
  const y = layer.y * stageHeight

  return {
    text: layer.text || '',
    fontSize: layer.fontSize || 48,
    fontFamily: layer.fontFamily || 'Impact, Anton, sans-serif',
    fill: layer.fill || '#F5E642',
    stroke: layer.stroke ?? '#000000',
    strokeWidth: layer.strokeWidth ?? 2,
    fillAfterStrokeEnabled: true,
    lineHeight: 1.2,
    align: 'center',
    width: stageWidth * 0.9,
    x,
    y,
    draggable: true,
    wrap: 'word',
    shadowColor: '#000000',
    shadowBlur: layer.shadowEnabled ? (layer.shadowBlur ?? 4) : 0,
    shadowOffset: { x: 2, y: 2 },
    shadowOpacity: layer.shadowEnabled ? 0.6 : 0,
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
