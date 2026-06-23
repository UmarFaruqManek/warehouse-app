'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { Warehouse, Zone } from '@/types'

export default function ZonesPage() {
  const { id } = useParams()
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null)
  const [zones, setZones] = useState<{ name: string; code: string }[]>([])
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    api.get<Warehouse>(`/warehouses/${id}`).then(w => {
      setWarehouse(w)
      setZones(w.zones?.map(z => ({ name: z.name, code: z.code })) || [])
    }).catch(() => {})
  }, [id])

  const addZone = () => setZones([...zones, { name: '', code: '' }])
  const removeZone = (i: number) => setZones(zones.filter((_, idx) => idx !== i))
  const updateZone = (i: number, field: 'name' | 'code', value: string) => {
    const copy = [...zones]; copy[i] = { ...copy[i], [field]: value }; setZones(copy)
  }

  const saveZones = async () => {
    await api.put(`/warehouses/${id}/zones`, { zones: zones.filter(z => z.name && z.code) })
    setEditMode(false)
  }

  if (!warehouse) return <div>Loading...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Zones - {warehouse.name}</h1>
        <button onClick={() => setEditMode(!editMode)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          {editMode ? 'Cancel' : 'Edit Zones'}
        </button>
      </div>
      {editMode ? (
        <div className="bg-white rounded-lg shadow p-6">
          {zones.map((z, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input placeholder="Zone name" value={z.name} onChange={e => updateZone(i, 'name', e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" />
              <input placeholder="Code" value={z.code} onChange={e => updateZone(i, 'code', e.target.value)} className="w-32 px-3 py-2 border rounded-lg" />
              <button onClick={() => removeZone(i)} className="text-red-600 px-2">X</button>
            </div>
          ))}
          <button onClick={addZone} className="text-blue-600 text-sm mb-4">+ Add Zone</button>
          <div><button onClick={saveZones} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">Save Zones</button></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="text-left py-3 px-4">Name</th><th className="text-left py-3 px-4">Code</th></tr></thead>
            <tbody>{warehouse.zones?.map(z => (
              <tr key={z.id} className="border-b"><td className="py-3 px-4">{z.name}</td><td className="py-3 px-4 font-mono">{z.code}</td></tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}
