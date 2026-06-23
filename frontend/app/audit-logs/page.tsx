'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { AuditLog, PaginatedResult } from '@/types'
import AuditLogTable from '@/components/audit-logs/audit-log-table'
import Pagination from '@/components/ui/pagination'

export default function AuditLogsPage() {
  const [data, setData] = useState<PaginatedResult<AuditLog>>({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 })
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ entityType: '', action: '', dateFrom: '', dateTo: '' })

  useEffect(() => { load() }, [page, filters])

  const load = async () => {
    const params = new URLSearchParams()
    params.append('page', String(page))
    if (filters.entityType) params.append('entityType', filters.entityType)
    if (filters.action) params.append('action', filters.action)
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.append('dateTo', filters.dateTo)
    api.get<PaginatedResult<AuditLog>>(`/audit-logs?${params}`).then(setData).catch(() => {})
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>
      <div className="flex gap-4 mb-4">
        <select value={filters.entityType} onChange={e => { setFilters({ ...filters, entityType: e.target.value }); setPage(1) }} className="px-3 py-2 border rounded-lg">
          <option value="">All Entities</option>
          <option value="Product">Product</option>
          <option value="Supplier">Supplier</option>
          <option value="Warehouse">Warehouse</option>
        </select>
        <select value={filters.action} onChange={e => { setFilters({ ...filters, action: e.target.value }); setPage(1) }} className="px-3 py-2 border rounded-lg">
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
        </select>
        <input type="date" value={filters.dateFrom} onChange={e => { setFilters({ ...filters, dateFrom: e.target.value }); setPage(1) }} className="px-3 py-2 border rounded-lg" />
        <input type="date" value={filters.dateTo} onChange={e => { setFilters({ ...filters, dateTo: e.target.value }); setPage(1) }} className="px-3 py-2 border rounded-lg" />
      </div>
      <div className="bg-white rounded-lg shadow">
        <AuditLogTable logs={data.data} />
        <div className="p-4 border-t">
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  )
}
