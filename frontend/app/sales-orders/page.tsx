'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { SalesOrder } from '@/types'
import SOTable from '@/components/sales-orders/so-table'

export default function SOPage() {
  const [sos, setSos] = useState<SalesOrder[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  useEffect(() => { load() }, [statusFilter])
  const load = async () => {
    const params = statusFilter ? `?status=${statusFilter}` : ''
    api.get<SalesOrder[]>(`/sales-orders${params}`).then(setSos).catch(() => {})
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales Orders</h1>
        <a href="/sales-orders/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ New SO</a>
      </div>
      <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="mb-4 px-3 py-2 border rounded-lg">
        <option value="">All Status</option>
        <option value="DRAFT">Draft</option>
        <option value="CONFIRMED">Confirmed</option>
        <option value="SHIPPED">Shipped</option>
      </select>
      <div className="bg-white rounded-lg shadow"><SOTable sos={sos} /></div>
    </div>
  )
}
