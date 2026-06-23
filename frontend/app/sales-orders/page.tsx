'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { SalesOrder, PaginatedResult } from '@/types'
import SOTable from '@/components/sales-orders/so-table'
import Pagination from '@/components/ui/pagination'

export default function SOPage() {
  const [data, setData] = useState<PaginatedResult<SalesOrder>>({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 })
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => { load() }, [page, statusFilter])

  const load = async () => {
    const params = new URLSearchParams()
    params.append('page', String(page))
    if (statusFilter) params.append('status', statusFilter)
    api.get<PaginatedResult<SalesOrder>>(`/sales-orders?${params}`).then(setData).catch(() => {})
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales Orders</h1>
        <a href="/sales-orders/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ New SO</a>
      </div>
      <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="mb-4 px-3 py-2 border rounded-lg">
        <option value="">All Status</option>
        <option value="DRAFT">Draft</option>
        <option value="CONFIRMED">Confirmed</option>
        <option value="SHIPPED">Shipped</option>
      </select>
      <div className="bg-white rounded-lg shadow">
        <SOTable sos={data.data} />
        <div className="p-4 border-t">
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  )
}
