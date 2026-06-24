'use client'
import { useState, useEffect, useRef } from 'react'
import { api, downloadExport } from '@/lib/api'
import { toast } from 'sonner'
import { Product, PaginatedResult } from '@/types'
import ProductTable from '@/components/products/product-table'
import { TableSkeleton } from '@/components/ui/skeleton'
import Pagination from '@/components/ui/pagination'

export default function ProductsPage() {
  const [data, setData] = useState<PaginatedResult<Product>>({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const timer = useRef<any>()

  useEffect(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      load(page, search)
    }, 300)
    return () => clearTimeout(timer.current)
  }, [page, search])

  const load = async (p: number, s: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    params.append('page', String(p))
    if (s) params.append('search', s)
    api.get<PaginatedResult<Product>>(`/products?${params}`).then(setData).catch(() => {}).finally(() => setLoading(false))
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return
    try {
      await api.delete(`/products/${id}`)
      toast.success('Product deleted')
      load(page, search)
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="space-x-2">
          <button onClick={() => downloadExport('products/csv', 'products.csv')} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">Export CSV</button>
          <a href="/products/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ New Product</a>
        </div>
      </div>
      <input
        placeholder="Search by name or SKU..." value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg mb-4"
      />
      {loading ? (
        <div className="bg-white rounded-lg shadow">
          <TableSkeleton rows={5} cols={5} />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <ProductTable products={data.data} onDelete={handleDelete} />
          <div className="p-4 border-t">
            <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  )
}
