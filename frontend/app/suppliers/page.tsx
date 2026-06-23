'use client'
import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { Supplier, PaginatedResult } from '@/types'
import SupplierTable from '@/components/suppliers/supplier-table'
import Pagination from '@/components/ui/pagination'

export default function SuppliersPage() {
  const [data, setData] = useState<PaginatedResult<Supplier>>({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const timer = useRef<any>()

  useEffect(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { setPage(1); load(1, search) }, 300)
  }, [search])

  useEffect(() => { load(page, search) }, [page])

  const load = async (p: number, s: string) => {
    const params = new URLSearchParams()
    params.append('page', String(p))
    if (s) params.append('search', s)
    api.get<PaginatedResult<Supplier>>(`/suppliers?${params}`).then(setData).catch(() => {})
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this supplier?')) return
    await api.delete(`/suppliers/${id}`)
    load(page, search)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <a href="/suppliers/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ New Supplier</a>
      </div>
      <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full px-3 py-2 border rounded-lg mb-4" />
      <div className="bg-white rounded-lg shadow">
        <SupplierTable suppliers={data.data} onDelete={handleDelete} />
        <div className="p-4 border-t">
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  )
}
