'use client'
import { SalesOrder } from '@/types'

export default function SOTable({ sos }: { sos: SalesOrder[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">SO #</th>
            <th className="text-left py-3 px-4">Customer</th>
            <th className="text-left py-3 px-4">Date</th>
            <th className="text-left py-3 px-4">Items</th>
            <th className="text-left py-3 px-4">Total</th>
            <th className="text-left py-3 px-4">Status</th>
            <th className="text-left py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sos.map(so => (
            <tr key={so.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4 font-mono">{so.soNumber}</td>
              <td className="py-3 px-4">{so.customerName}</td>
              <td className="py-3 px-4">{new Date(so.orderDate).toLocaleDateString('id-ID')}</td>
              <td className="py-3 px-4">{so.items?.length || 0}</td>
              <td className="py-3 px-4">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(so.totalAmount)}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  so.status === 'SHIPPED' ? 'bg-green-100 text-green-800' :
                  so.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                }`}>{so.status}</span>
              </td>
              <td className="py-3 px-4"><a href={`/sales-orders/${so.id}`} className="text-blue-600 hover:underline">View</a></td>
            </tr>
          ))}
          {sos.length === 0 && <tr><td colSpan={7} className="py-4 text-center text-gray-500">No sales orders</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
