'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { SalesOrder } from '@/types'

export default function SODetailPage() {
  const { id } = useParams()
  const [so, setSo] = useState<SalesOrder | null>(null)

  useEffect(() => { api.get<SalesOrder>(`/sales-orders/${id}`).then(setSo).catch(() => {}) }, [id])

  const shipSO = async () => {
    if (!confirm('Ship this sales order? This will deduct from stock.')) return
    await api.put(`/sales-orders/${id}/status`, { status: 'SHIPPED' })
    api.get<SalesOrder>(`/sales-orders/${id}`).then(setSo).catch(() => {})
  }

  if (!so) return <div>Loading...</div>
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">SO {so.soNumber}</h1>
        <div className="space-x-2">
          <span className={`px-3 py-1 rounded text-sm font-bold ${
            so.status === 'SHIPPED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>{so.status}</span>
          {so.status !== 'SHIPPED' && (
            <button onClick={shipSO} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Ship</button>
          )}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-gray-500 text-sm">Customer</p><p className="font-medium">{so.customerName}</p></div>
          <div><p className="text-gray-500 text-sm">Order Date</p><p>{new Date(so.orderDate).toLocaleDateString('id-ID')}</p></div>
          <div><p className="text-gray-500 text-sm">Total Amount</p><p className="font-bold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(so.totalAmount)}</p></div>
          {so.shippedDate && <div><p className="text-gray-500 text-sm">Shipped Date</p><p>{new Date(so.shippedDate).toLocaleDateString('id-ID')}</p></div>}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow">
        <table className="w-full text-sm">
          <thead><tr className="border-b"><th className="text-left py-3 px-4">Product</th><th className="text-left py-3 px-4">SKU</th><th className="text-left py-3 px-4">Qty</th><th className="text-left py-3 px-4">Unit Price</th><th className="text-left py-3 px-4">Subtotal</th></tr></thead>
          <tbody>{so.items?.map(item => (
            <tr key={item.id} className="border-b">
              <td className="py-3 px-4">{item.product?.name}</td>
              <td className="py-3 px-4 font-mono">{item.product?.sku}</td>
              <td className="py-3 px-4">{item.quantity}</td>
              <td className="py-3 px-4">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.unitPrice)}</td>
              <td className="py-3 px-4">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.quantity * item.unitPrice)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}
