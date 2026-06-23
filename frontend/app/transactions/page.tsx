'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { StockTransaction } from '@/types'
import TransactionTable from '@/components/transactions/transaction-table'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
  const [filters, setFilters] = useState({ type: '', startDate: '', endDate: '' })

  useEffect(() => { load() }, [])
  const load = async () => {
    const params = new URLSearchParams()
    if (filters.type) params.append('type', filters.type)
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    const data = await api.get<StockTransaction[]>(`/transactions?${params}`)
    setTransactions(data)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <button onClick={load} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Refresh</button>
      </div>
      <div className="flex gap-4 mb-4">
        <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })} className="px-3 py-2 border rounded-lg">
          <option value="">All Types</option>
          <option value="IN">Stock In</option>
          <option value="OUT">Stock Out</option>
        </select>
        <input type="date" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} className="px-3 py-2 border rounded-lg" />
        <input type="date" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} className="px-3 py-2 border rounded-lg" />
      </div>
      <div className="bg-white rounded-lg shadow"><TransactionTable transactions={transactions} /></div>
    </div>
  )
}
