'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Product } from '@/types'
import ProductTable from '@/components/products/product-table'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])
  const load = async () => { const data = await api.get<Product[]>('/products'); setProducts(data) }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return
    await api.delete(`/products/${id}`)
    load()
  }

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <a href="/products/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ New Product</a>
      </div>
      <input
        placeholder="Search by name or SKU..." value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg mb-4"
      />
      <div className="bg-white rounded-lg shadow">
        <ProductTable products={filtered} onDelete={handleDelete} />
      </div>
    </div>
  )
}
