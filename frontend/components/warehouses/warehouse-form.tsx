'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface Props { onSuccess?: () => void }

export default function WarehouseForm({ onSuccess }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', location: '', code: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.post('/warehouses', form)
    if (onSuccess) onSuccess()
    else router.push('/warehouses')
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div><label className="block text-sm font-medium mb-1">Code</label>
        <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required /></div>
      <div><label className="block text-sm font-medium mb-1">Name</label>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required /></div>
      <div><label className="block text-sm font-medium mb-1">Location</label>
        <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
      <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Create Warehouse</button>
    </form>
  )
}
