'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { TableSkeleton } from '@/components/ui/skeleton'

export default function ReportsPage() {
  const [tab, setTab] = useState<'stock-value' | 'movement' | 'slow-moving'>('stock-value')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  useEffect(() => { fetchData() }, [tab])

  const fetchData = async () => {
    setLoading(true)
    try {
      let url = `/reports/${tab}`
      if (tab === 'movement') {
        const params = new URLSearchParams()
        if (dateRange.start) params.append('startDate', dateRange.start)
        if (dateRange.end) params.append('endDate', dateRange.end)
        if (params.toString()) url += `?${params}`
      }
      const res = await api.get<any[]>(url)
      setData(res)
    } catch { setData([]) }
    setLoading(false)
  }

  const tabs = [
    { key: 'stock-value' as const, label: 'Stock Value' },
    { key: 'movement' as const, label: 'Stock Movement' },
    { key: 'slow-moving' as const, label: 'Slow Moving' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm ${tab === t.key ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'movement' && (
        <div className="flex gap-4 mb-4">
          <input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} className="px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
          <input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} className="px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
          <button onClick={fetchData} className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg">Filter</button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 dark:text-gray-200 rounded-lg shadow overflow-x-auto">
        {loading ? <TableSkeleton rows={5} cols={5} /> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700">
                {tab === 'stock-value' && (<><th className="text-left py-3 px-4">SKU</th><th className="text-left py-3 px-4">Product</th><th className="text-left py-3 px-4">Price</th><th className="text-left py-3 px-4">Stock</th><th className="text-left py-3 px-4">Total Value</th></>)}
                {tab === 'movement' && (<><th className="text-left py-3 px-4">Date</th><th className="text-left py-3 px-4">Product</th><th className="text-left py-3 px-4">Type</th><th className="text-left py-3 px-4">Qty</th><th className="text-left py-3 px-4">Warehouse</th></>)}
                {tab === 'slow-moving' && (<><th className="text-left py-3 px-4">Product</th><th className="text-left py-3 px-4">SKU</th><th className="text-left py-3 px-4">Stock</th><th className="text-left py-3 px-4">Movements (3mo)</th></>)}
              </tr>
            </thead>
            <tbody>
              {data.map((row: any, i: number) => (
                <tr key={i} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  {tab === 'stock-value' && (<><td className="py-3 px-4 font-mono">{row.sku}</td><td className="py-3 px-4">{row.name}</td><td className="py-3 px-4">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(row.price)}</td><td className="py-3 px-4">{row.totalStock}</td><td className="py-3 px-4 font-bold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(row.totalValue)}</td></>)}
                  {tab === 'movement' && (<><td className="py-3 px-4">{new Date(row.createdAt).toLocaleDateString('id-ID')}</td><td className="py-3 px-4">{row.product?.name || '-'}</td><td className="py-3 px-4"><span className={`px-2 py-1 rounded text-xs font-bold ${row.type === 'IN' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>{row.type}</span></td><td className="py-3 px-4">{row.quantity}</td><td className="py-3 px-4">{row.warehouse?.name || '-'}</td></>)}
                  {tab === 'slow-moving' && (<><td className="py-3 px-4">{row.name}</td><td className="py-3 px-4 font-mono">{row.sku}</td><td className="py-3 px-4">{row.totalStock}</td><td className="py-3 px-4">{row.movementCount}</td></>)}
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-gray-500 dark:text-gray-400">No data</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
