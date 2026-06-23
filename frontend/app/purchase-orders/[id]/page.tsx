'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { PurchaseOrder } from '@/types'

export default function PODetailPage() {
  const { id } = useParams()
  const [po, setPo] = useState<PurchaseOrder | null>(null)

  useEffect(() => { api.get<PurchaseOrder>(`/purchase-orders/${id}`).then(setPo).catch(() => {}) }, [id])

  const receivePO = async () => {
    if (!confirm('Receive this purchase order? This will add items to stock.')) return
    try {
      await api.put(`/purchase-orders/${id}/status`, { status: 'RECEIVED' })
      toast.success('Purchase order received')
      api.get<PurchaseOrder>(`/purchase-orders/${id}`).then(setPo).catch(() => {})
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    }
  }

  if (!po) return <div>Loading...</div>
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">PO {po.poNumber}</h1>
        <div className="space-x-2">
          <span className={`px-3 py-1 rounded text-sm font-bold ${
            po.status === 'RECEIVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>{po.status}</span>
          {po.status !== 'RECEIVED' && (
            <button onClick={receivePO} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Receive</button>
          )}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-gray-500 text-sm">Supplier</p><p className="font-medium">{po.supplier?.name}</p></div>
          <div><p className="text-gray-500 text-sm">Order Date</p><p>{new Date(po.orderDate).toLocaleDateString('id-ID')}</p></div>
          <div><p className="text-gray-500 text-sm">Total Amount</p><p className="font-bold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(po.totalAmount)}</p></div>
          {po.receivedDate && <div><p className="text-gray-500 text-sm">Received Date</p><p>{new Date(po.receivedDate).toLocaleDateString('id-ID')}</p></div>}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow">
        <table className="w-full text-sm">
          <thead><tr className="border-b"><th className="text-left py-3 px-4">Product</th><th className="text-left py-3 px-4">SKU</th><th className="text-left py-3 px-4">Qty</th><th className="text-left py-3 px-4">Unit Price</th><th className="text-left py-3 px-4">Subtotal</th></tr></thead>
          <tbody>{po.items?.map(item => (
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
