'use client'
import { Supplier } from '@/types'

export default function SupplierTable({
  suppliers,
  onDelete,
}: {
  suppliers: Supplier[]
  onDelete?: (id: number) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Name</th>
            <th className="text-left py-3 px-4">Contact</th>
            <th className="text-left py-3 px-4">Phone</th>
            <th className="text-left py-3 px-4">Email</th>
            <th className="text-left py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map(s => (
            <tr key={s.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4 font-medium">{s.name}</td>
              <td className="py-3 px-4">{s.contact}</td>
              <td className="py-3 px-4">{s.phone}</td>
              <td className="py-3 px-4">{s.email}</td>
              <td className="py-3 px-4 space-x-2">
                <a href={`/suppliers/${s.id}`} className="text-blue-600 hover:underline">View</a>
                {onDelete && <button onClick={() => onDelete(s.id)} className="text-red-600 hover:underline">Delete</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
