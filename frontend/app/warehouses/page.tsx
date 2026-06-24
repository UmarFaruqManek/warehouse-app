'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Warehouse, PaginatedResult } from '@/types'
import WarehouseTable from '@/components/warehouses/warehouse-table'
import { TableSkeleton } from '@/components/ui/skeleton'
import Pagination from '@/components/ui/pagination'

export default function WarehousesPage() {
  const [data, setData] = useState<PaginatedResult<Warehouse>>({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [page])
  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.append('page', String(page))
    api.get<PaginatedResult<Warehouse>>(`/warehouses?${params}`).then(setData).catch(() => {}).finally(() => setLoading(false))
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this warehouse?')) return
    try {
      await api.delete(`/warehouses/${id}`)
      toast.success('Warehouse deleted')
      load()
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Warehouses</h1>
        <a href="/warehouses/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ New Warehouse</a>
      </div>
      {loading ? (
        <div className="bg-white rounded-lg shadow">
          <TableSkeleton rows={5} cols={5} />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <WarehouseTable warehouses={data.data} onDelete={handleDelete} />
          <div className="p-4 border-t">
            <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  )
}
