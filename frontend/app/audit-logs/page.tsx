'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { AuditLog } from '@/types'
import AuditLogTable from '@/components/audit-logs/audit-log-table'

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filters, setFilters] = useState({ entityType: '', action: '', dateFrom: '', dateTo: '' })

  useEffect(() => { load() }, [filters])

  const load = async () => {
    const params = new URLSearchParams()
    if (filters.entityType) params.append('entityType', filters.entityType)
    if (filters.action) params.append('action', filters.action)
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.append('dateTo', filters.dateTo)
    api.get<AuditLog[]>(`/audit-logs?${params}`).then(setLogs).catch(() => {})
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>
      <div className="flex gap-4 mb-4">
        <select value={filters.entityType} onChange={e => setFilters({ ...filters, entityType: e.target.value })} className="px-3 py-2 border rounded-lg">
          <option value="">All Entities</option>
          <option value="Product">Product</option>
          <option value="Supplier">Supplier</option>
          <option value="Warehouse">Warehouse</option>
        </select>
        <select value={filters.action} onChange={e => setFilters({ ...filters, action: e.target.value })} className="px-3 py-2 border rounded-lg">
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
        </select>
        <input type="date" value={filters.dateFrom} onChange={e => setFilters({ ...filters, dateFrom: e.target.value })} className="px-3 py-2 border rounded-lg" />
        <input type="date" value={filters.dateTo} onChange={e => setFilters({ ...filters, dateTo: e.target.value })} className="px-3 py-2 border rounded-lg" />
      </div>
      <div className="bg-white rounded-lg shadow"><AuditLogTable logs={logs} /></div>
    </div>
  )
}
