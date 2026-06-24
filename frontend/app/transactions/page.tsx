'use client'
import { useState, useEffect } from 'react'
import { api, downloadExport } from '@/lib/api'
import { StockTransaction, PaginatedResult } from '@/types'
import TransactionTable from '@/components/transactions/transaction-table'
import { TableSkeleton } from '@/components/ui/skeleton'
import Pagination from '@/components/ui/pagination'

export default function TransactionsPage() {
  const [data, setData] = useState<PaginatedResult<StockTransaction>>({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ type: '', startDate: '', endDate: '' })

  useEffect(() => { load() }, [page, filters])

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.append('page', String(page))
    if (filters.type) params.append('type', filters.type)
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    api.get<PaginatedResult<StockTransaction>>(`/transactions?${params}`).then(setData).catch(() => {}).finally(() => setLoading(false))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="space-x-2">
          <button onClick={() => downloadExport('transactions/csv', 'transactions.csv')} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">Export CSV</button>
          <button onClick={load} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Refresh</button>
        </div>
      </div>
      <div className="flex gap-4 mb-4">
        <select value={filters.type} onChange={e => { setFilters({ ...filters, type: e.target.value }); setPage(1) }} className="px-3 py-2 border rounded-lg">
          <option value="">All Types</option>
          <option value="IN">Stock In</option>
          <option value="OUT">Stock Out</option>
        </select>
        <input type="date" value={filters.startDate} onChange={e => { setFilters({ ...filters, startDate: e.target.value }); setPage(1) }} className="px-3 py-2 border rounded-lg" />
        <input type="date" value={filters.endDate} onChange={e => { setFilters({ ...filters, endDate: e.target.value }); setPage(1) }} className="px-3 py-2 border rounded-lg" />
      </div>
      {loading ? (
        <div className="bg-white rounded-lg shadow">
          <TableSkeleton rows={5} cols={5} />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <TransactionTable transactions={data.data} />
          <div className="p-4 border-t">
            <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  )
}
