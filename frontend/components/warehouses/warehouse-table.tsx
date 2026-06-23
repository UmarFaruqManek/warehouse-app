'use client'
import { Warehouse } from '@/types'

export default function WarehouseTable({
  warehouses,
  onDelete,
}: {
  warehouses: Warehouse[]
  onDelete?: (id: number) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Code</th>
            <th className="text-left py-3 px-4">Name</th>
            <th className="text-left py-3 px-4">Location</th>
            <th className="text-left py-3 px-4">Zones</th>
            <th className="text-left py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.map(w => (
            <tr key={w.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4 font-mono">{w.code}</td>
              <td className="py-3 px-4 font-medium">{w.name}</td>
              <td className="py-3 px-4">{w.location}</td>
              <td className="py-3 px-4">{w.zones?.length || 0}</td>
              <td className="py-3 px-4 space-x-2">
                <a href={`/warehouses/${w.id}/zones`} className="text-blue-600 hover:underline">Zones</a>
                {onDelete && <button onClick={() => onDelete(w.id)} className="text-red-600 hover:underline">Delete</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
