'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export default function DashboardPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [stats, setStats] = useState({ products: 0, warehouses: 0, lowStock: 0 })

  useEffect(() => {
    api.get<any[]>('/stock/alerts').then(setAlerts).catch(() => {})
    api.get<any[]>('/products').then(d => setStats(s => ({ ...s, products: d.length }))).catch(() => {})
    api.get<any[]>('/warehouses').then(d => setStats(s => ({ ...s, warehouses: d.length }))).catch(() => {})
  }, [])

  useEffect(() => {
    setStats(s => ({ ...s, lowStock: alerts.length }))
  }, [alerts])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 dark:text-gray-200 p-6 rounded-lg shadow">
          <p className="text-gray-500 dark:text-gray-400">Products</p>
          <p className="text-3xl font-bold">{stats.products}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 dark:text-gray-200 p-6 rounded-lg shadow">
          <p className="text-gray-500 dark:text-gray-400">Warehouses</p>
          <p className="text-3xl font-bold">{stats.warehouses}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 dark:text-gray-200 p-6 rounded-lg shadow">
          <p className="text-gray-500 dark:text-gray-400">Low Stock</p>
          <p className={`text-3xl font-bold ${stats.lowStock > 0 ? 'text-red-600' : ''}`}>{stats.lowStock}</p>
        </div>
      </div>
      {alerts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 dark:text-gray-200 rounded-lg shadow p-6">
          <h2 className="font-bold mb-4">Stock Alerts</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2">SKU</th>
                <th className="text-left py-2">Product</th>
                <th className="text-left py-2">Stock</th>
                <th className="text-left py-2">Min</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a: any) => (
                <tr key={a.id} className="border-b dark:border-gray-700">
                  <td className="py-2 font-mono">{a.sku}</td>
                  <td>{a.name}</td>
                  <td className="text-red-600 font-bold">{a.totalStock}</td>
                  <td>{a.minStock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
