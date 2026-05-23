const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export async function analyzeMeme(file, prompt, preferredTemplates) {
  const formData = new FormData()
  formData.append('image', file)
  if (prompt) formData.append('prompt', prompt)
  if (preferredTemplates?.length) formData.append('preferredTemplates', JSON.stringify(preferredTemplates))

  const res = await fetch(`${API_URL}/api/analyze`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Analysis failed (${res.status})`)
  }

  const data = await res.json()
  return data.suggestions
}

export async function refineMemes(file, previousSuggestions, feedback) {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('previousSuggestions', JSON.stringify(previousSuggestions))
  formData.append('feedback', feedback)

  const res = await fetch(`${API_URL}/api/refine`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Refinement failed (${res.status})`)
  }

  const data = await res.json()
  return data.suggestions
}

export async function generateMemeImage(file, { templateId, topText, bottomText }) {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('templateId', templateId)
  formData.append('topText', topText)
  formData.append('bottomText', bottomText || '')

  const res = await fetch(`${API_URL}/api/generate-meme-image`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Image generation failed (${res.status})`)
  }

  return (await res.json()).imageUrl
}
