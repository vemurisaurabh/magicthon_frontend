const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export async function shareMeme(canvasDataUrl, templateId, texts) {
  const blob = await (await fetch(canvasDataUrl)).blob()
  const formData = new FormData()
  formData.append('image', blob, 'meme.png')
  formData.append('metadata', JSON.stringify({ templateId, texts }))

  const res = await fetch(`${API_URL}/api/share`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Share failed (${res.status})`)
  }

  return res.json()
}

export async function getMemeData(memeId) {
  const res = await fetch(`${API_URL}/api/share/${memeId}`)
  if (!res.ok) throw new Error('Meme not found')
  return res.json()
}

export async function getReactions(memeId) {
  const res = await fetch(`${API_URL}/api/react/${memeId}`)
  if (!res.ok) throw new Error('Failed to fetch reactions')
  return res.json()
}

export async function addReaction(memeId, emoji) {
  const res = await fetch(`${API_URL}/api/react/${memeId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emoji }),
  })
  if (!res.ok) throw new Error('Failed to add reaction')
  return res.json()
}
