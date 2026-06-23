'use client'
import { Product } from '@/types'

export default function ProductTable({
  products,
  onDelete,
}: {
  products: Product[]
  onDelete?: (id: number) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">SKU</th>
            <th className="text-left py-3 px-4">Name</th>
            <th className="text-left py-3 px-4">Category</th>
            <th className="text-left py-3 px-4">Price</th>
            <th className="text-left py-3 px-4">Min Stock</th>
            <th className="text-left py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4 font-mono">{p.sku}</td>
              <td className="py-3 px-4">{p.name}</td>
              <td className="py-3 px-4">{p.category}</td>
              <td className="py-3 px-4">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(p.price)}
              </td>
              <td className="py-3 px-4">{p.minStock}</td>
              <td className="py-3 px-4 space-x-2">
                <a href={`/products/${p.id}/edit`} className="text-blue-600 hover:underline">Edit</a>
                {onDelete && (
                  <button onClick={() => onDelete(p.id)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
