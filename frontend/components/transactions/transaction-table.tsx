'use client'
import { StockTransaction } from '@/types'

export default function TransactionTable({ transactions }: { transactions: StockTransaction[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Date</th>
            <th className="text-left py-3 px-4">Type</th>
            <th className="text-left py-3 px-4">Product</th>
            <th className="text-left py-3 px-4">Warehouse</th>
            <th className="text-left py-3 px-4">Qty</th>
            <th className="text-left py-3 px-4">Reference</th>
            <th className="text-left py-3 px-4">User</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">{new Date(t.createdAt).toLocaleDateString('id-ID')}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded text-xs font-bold ${t.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {t.type}
                </span>
              </td>
              <td className="py-3 px-4">{t.product?.name}</td>
              <td className="py-3 px-4">{t.warehouse?.name}</td>
              <td className="py-3 px-4 font-bold">{t.quantity}</td>
              <td className="py-3 px-4">{t.referenceType === 'ADJUST' ? 'Adjustment' : `${t.referenceType} #${t.referenceId}`}</td>
              <td className="py-3 px-4">{t.user?.name || '-'}</td>
            </tr>
          ))}
          {transactions.length === 0 && <tr><td colSpan={7} className="py-4 text-center text-gray-500">No transactions</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
