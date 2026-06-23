'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Supplier } from '@/types'

interface Props { supplier?: Supplier }

export default function SupplierForm({ supplier }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: supplier?.name || '',
    contact: supplier?.contact || '',
    phone: supplier?.phone || '',
    email: supplier?.email || '',
    address: supplier?.address || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (supplier) {
      await api.put(`/suppliers/${supplier.id}`, form)
    } else {
      await api.post('/suppliers', form)
    }
    router.push('/suppliers')
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div><label className="block text-sm font-medium mb-1">Name</label>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required /></div>
      <div><label className="block text-sm font-medium mb-1">Contact Person</label>
        <input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Phone</label>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
        <div><label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
      </div>
      <div><label className="block text-sm font-medium mb-1">Address</label>
        <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={3} /></div>
      <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
        {supplier ? 'Update' : 'Create'} Supplier
      </button>
    </form>
  )
}
