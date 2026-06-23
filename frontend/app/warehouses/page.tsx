'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Warehouse } from '@/types'
import WarehouseTable from '@/components/warehouses/warehouse-table'

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  useEffect(() => { api.get<Warehouse[]>('/warehouses').then(setWarehouses).catch(() => {}) }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this warehouse?')) return
    await api.delete(`/warehouses/${id}`)
    setWarehouses(prev => prev.filter(w => w.id !== id))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Warehouses</h1>
        <a href="/warehouses/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ New Warehouse</a>
      </div>
      <div className="bg-white rounded-lg shadow"><WarehouseTable warehouses={warehouses} onDelete={handleDelete} /></div>
    </div>
  )
}
