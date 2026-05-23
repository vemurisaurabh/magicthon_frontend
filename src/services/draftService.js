const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export async function saveDraft({ templateId, layers }) {
  const res = await fetch(`${API_URL}/api/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ templateId, layers }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Failed to save draft')
  }
  return res.json()
}

export async function loadLatestDraft() {
  const res = await fetch(`${API_URL}/api/drafts/latest`)
  if (!res.ok) throw new Error('Failed to load draft')
  const data = await res.json()
  return data.draft
}

export async function deleteDraft(id) {
  await fetch(`${API_URL}/api/drafts/${id}`, { method: 'DELETE' })
}
