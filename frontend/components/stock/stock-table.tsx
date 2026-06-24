'use client'
import { StockItem } from '@/types'

export default function StockTable({ stock }: { stock: StockItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b dark:border-gray-700">
            <th className="text-left py-3 px-4">Product</th>
            <th className="text-left py-3 px-4">SKU</th>
            <th className="text-left py-3 px-4">Warehouse</th>
            <th className="text-left py-3 px-4">Zone</th>
            <th className="text-left py-3 px-4">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {stock.map(s => (
            <tr key={s.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="py-3 px-4">{s.product?.name}</td>
              <td className="py-3 px-4 font-mono">{s.product?.sku}</td>
              <td className="py-3 px-4">{s.warehouse?.name}</td>
              <td className="py-3 px-4">{s.zone?.name || '-'}</td>
              <td className="py-3 px-4 font-bold">{s.quantity}</td>
            </tr>
          ))}
          {stock.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-gray-500 dark:text-gray-400">No stock data</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
