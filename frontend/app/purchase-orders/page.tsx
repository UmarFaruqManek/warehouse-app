'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { PurchaseOrder, PaginatedResult } from '@/types'
import POTable from '@/components/purchase-orders/po-table'
import { TableSkeleton } from '@/components/ui/skeleton'
import Pagination from '@/components/ui/pagination'

export default function POPage() {
  const [data, setData] = useState<PaginatedResult<PurchaseOrder>>({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => { load() }, [page, statusFilter])

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.append('page', String(page))
    if (statusFilter) params.append('status', statusFilter)
    api.get<PaginatedResult<PurchaseOrder>>(`/purchase-orders?${params}`).then(setData).catch(() => {}).finally(() => setLoading(false))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <a href="/purchase-orders/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ New PO</a>
      </div>
      <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="mb-4 px-3 py-2 border rounded-lg">
        <option value="">All Status</option>
        <option value="DRAFT">Draft</option>
        <option value="ORDERED">Ordered</option>
        <option value="RECEIVED">Received</option>
      </select>
      {loading ? (
        <div className="bg-white rounded-lg shadow">
          <TableSkeleton rows={5} cols={5} />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <POTable pos={data.data} />
          <div className="p-4 border-t">
            <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  )
}
