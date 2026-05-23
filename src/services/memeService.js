const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export async function analyzeMeme(file) {
  const formData = new FormData()
  formData.append('image', file)

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
