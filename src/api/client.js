const API_URL = import.meta.env.VITE_API_URL

export async function apiFetch(path, options = {}) {
  const token = JSON.parse(localStorage.getItem('reddot_user') || 'null')?.token

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || res.statusText)
  }

  const text = await res.text()
  return text ? JSON.parse(text) : null
}