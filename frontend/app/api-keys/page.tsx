'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

interface ApiKey {
  id: number
  name: string
  key: string
  active: boolean
  lastUsed: string | null
  createdAt: string
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [showNew, setShowNew] = useState(false)
  const [name, setName] = useState('')
  const [newKey, setNewKey] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    api.get<ApiKey[]>('/api-keys').then(setKeys).catch(() => {})
  }

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await api.post<ApiKey>('/api-keys', { name })
      setNewKey(res.key)
      setName('')
      load()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const toggle = async (id: number) => {
    try {
      await api.put(`/api-keys/${id}/toggle`, {})
      load()
      toast.success('Toggled')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this API key?')) return
    try {
      await api.delete(`/api-keys/${id}`)
      load()
      toast.success('Deleted')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">API Keys</h1>
        <button onClick={() => setShowNew(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ New Key</button>
      </div>

      {newKey && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4">
          <p className="font-bold text-sm mb-1">API Key Created — Copy it now!</p>
          <code className="block bg-white dark:bg-gray-800 p-2 rounded text-sm font-mono break-all">{newKey}</code>
          <p className="text-xs mt-1 text-gray-500">You won&apos;t be able to see this again.</p>
        </div>
      )}

      {showNew && !newKey && (
        <form onSubmit={create} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Key name" className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded-lg mb-2" required />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Generate</button>
            <button type="button" onClick={() => setShowNew(false)} className="px-4 py-2 border dark:border-gray-600 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Key</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Last Used</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map(k => (
              <tr key={k.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="py-3 px-4">{k.name}</td>
                <td className="py-3 px-4 font-mono text-xs">{k.key.substring(0, 16)}...</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${k.active ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                    {k.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4">{k.lastUsed ? new Date(k.lastUsed).toLocaleDateString('id-ID') : 'Never'}</td>
                <td className="py-3 px-4 space-x-2">
                  <button onClick={() => toggle(k.id)} className="text-blue-600 dark:text-blue-400 hover:underline text-xs">
                    {k.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => remove(k.id)} className="text-red-600 dark:text-red-400 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
            {keys.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-gray-500">No API keys</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
