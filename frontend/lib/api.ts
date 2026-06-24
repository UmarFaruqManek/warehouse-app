const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong')
  }

  return data.data ?? data
}

export function downloadExport(endpoint: string, filename: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  fetch(`${API_BASE}/export/${endpoint}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  })
    .then(res => res.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    })
}

export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint),
  post: <T>(endpoint: string, body: any) =>
    fetchApi<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any) =>
    fetchApi<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: 'DELETE' }),
}
