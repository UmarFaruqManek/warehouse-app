'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { Supplier } from '@/types'

export default function SupplierDetailPage() {
  const { id } = useParams()
  const [supplier, setSupplier] = useState<Supplier & { Products?: any[] } | null>(null)

  useEffect(() => {
    api.get<Supplier & { Products?: any[] }>(`/suppliers/${id}`).then(setSupplier).catch(() => {})
  }, [id])

  if (!supplier) return <div>Loading...</div>
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{supplier.name}</h1>
        {/* Edit link removed - no edit page available */}
      </div>
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-gray-500 text-sm">Contact</p><p>{supplier.contact || '-'}</p></div>
          <div><p className="text-gray-500 text-sm">Phone</p><p>{supplier.phone || '-'}</p></div>
          <div><p className="text-gray-500 text-sm">Email</p><p>{supplier.email || '-'}</p></div>
          <div><p className="text-gray-500 text-sm">Address</p><p>{supplier.address || '-'}</p></div>
        </div>
        {supplier.Products && supplier.Products.length > 0 && (
          <div>
            <h2 className="font-bold mb-2">Products from this Supplier</h2>
            <ul className="list-disc pl-5">{supplier.Products.map((p: any) => <li key={p.id}>{p.name} ({p.sku})</li>)}</ul>
          </div>
        )}
      </div>
    </div>
  )
}
