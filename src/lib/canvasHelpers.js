export function buildTextConfig(zoneId, value, stageWidth, stageHeight, options = {}) {
  const fontSize = options.fontSize || 48
  const fill = options.fill || '#FFFFFF'
  const isTop = zoneId === 'top'

  return {
    text: value || '',
    fontSize,
    fontFamily: 'Impact, Anton, sans-serif',
    fill,
    stroke: '#000000',
    strokeWidth: 2,
    align: 'center',
    width: stageWidth * 0.9,
    x: stageWidth * 0.05,
    y: isTop ? stageHeight * 0.05 : stageHeight * 0.75,
    draggable: true,
    wrap: 'word',
    shadowColor: '#000000',
    shadowBlur: 4,
    shadowOffset: { x: 2, y: 2 },
    shadowOpacity: 0.6,
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
