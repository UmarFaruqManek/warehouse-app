'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { PurchaseOrder } from '@/types'
import POTable from '@/components/purchase-orders/po-table'

export default function POPage() {
  const [pos, setPos] = useState<PurchaseOrder[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  useEffect(() => { load() }, [statusFilter])
  const load = async () => {
    const params = statusFilter ? `?status=${statusFilter}` : ''
    api.get<PurchaseOrder[]>(`/purchase-orders${params}`).then(setPos).catch(() => {})
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <a href="/purchase-orders/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ New PO</a>
      </div>
      <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="mb-4 px-3 py-2 border rounded-lg">
        <option value="">All Status</option>
        <option value="DRAFT">Draft</option>
        <option value="ORDERED">Ordered</option>
        <option value="RECEIVED">Received</option>
      </select>
      <div className="bg-white rounded-lg shadow"><POTable pos={pos} /></div>
    </div>
  )
}
