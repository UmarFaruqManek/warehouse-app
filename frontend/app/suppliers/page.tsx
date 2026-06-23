'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Supplier } from '@/types'
import SupplierTable from '@/components/suppliers/supplier-table'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])
  const load = async () => { const data = await api.get<Supplier[]>('/suppliers'); setSuppliers(data) }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this supplier?')) return
    await api.delete(`/suppliers/${id}`)
    load()
  }

  const filtered = suppliers.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <a href="/suppliers/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ New Supplier</a>
      </div>
      <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full px-3 py-2 border rounded-lg mb-4" />
      <div className="bg-white rounded-lg shadow"><SupplierTable suppliers={filtered} onDelete={handleDelete} /></div>
    </div>
  )
}
