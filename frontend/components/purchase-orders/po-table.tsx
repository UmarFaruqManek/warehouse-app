'use client'
import { PurchaseOrder } from '@/types'

export default function POTable({ pos }: { pos: PurchaseOrder[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">PO #</th>
            <th className="text-left py-3 px-4">Supplier</th>
            <th className="text-left py-3 px-4">Date</th>
            <th className="text-left py-3 px-4">Items</th>
            <th className="text-left py-3 px-4">Total</th>
            <th className="text-left py-3 px-4">Status</th>
            <th className="text-left py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pos.map(po => (
            <tr key={po.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4 font-mono">{po.poNumber}</td>
              <td className="py-3 px-4">{po.supplier?.name}</td>
              <td className="py-3 px-4">{new Date(po.orderDate).toLocaleDateString('id-ID')}</td>
              <td className="py-3 px-4">{po.items?.length || 0}</td>
              <td className="py-3 px-4">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(po.totalAmount)}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  po.status === 'RECEIVED' ? 'bg-green-100 text-green-800' :
                  po.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>{po.status}</span>
              </td>
              <td className="py-3 px-4"><a href={`/purchase-orders/${po.id}`} className="text-blue-600 hover:underline">View</a></td>
            </tr>
          ))}
          {pos.length === 0 && <tr><td colSpan={7} className="py-4 text-center text-gray-500">No purchase orders</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
