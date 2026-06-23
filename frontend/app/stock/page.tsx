'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { StockItem, Product, Warehouse } from '@/types'
import StockTable from '@/components/stock/stock-table'

export default function StockPage() {
  const [stock, setStock] = useState<StockItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [filters, setFilters] = useState({ warehouseId: '', productId: '' })
  const [showIn, setShowIn] = useState(false)
  const [showOut, setShowOut] = useState(false)

  useEffect(() => {
    api.get<StockItem[]>('/stock').then(setStock).catch(() => {})
    api.get<Product[]>('/products').then(setProducts).catch(() => {})
    api.get<Warehouse[]>('/warehouses').then(setWarehouses).catch(() => {})
  }, [])

  const filtered = stock.filter(s => {
    if (filters.warehouseId && s.warehouseId !== Number(filters.warehouseId)) return false
    if (filters.productId && s.productId !== Number(filters.productId)) return false
    return true
  })

  const [form, setForm] = useState({ productId: '', warehouseId: '', zoneId: '', quantity: 1, note: '' })

  const handleStockIn = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.post('/transactions/in', { ...form, productId: Number(form.productId), warehouseId: Number(form.warehouseId), zoneId: form.zoneId ? Number(form.zoneId) : null, quantity: Number(form.quantity) })
    setShowIn(false); setForm({ productId: '', warehouseId: '', zoneId: '', quantity: 1, note: '' })
    api.get<StockItem[]>('/stock').then(setStock).catch(() => {})
  }

  const handleStockOut = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.post('/transactions/out', { ...form, productId: Number(form.productId), warehouseId: Number(form.warehouseId), zoneId: form.zoneId ? Number(form.zoneId) : null, quantity: Number(form.quantity) })
    setShowOut(false); setForm({ productId: '', warehouseId: '', zoneId: '', quantity: 1, note: '' })
    api.get<StockItem[]>('/stock').then(setStock).catch(() => {})
  }

  const Modal = ({ title, onSubmit, onClose }: any) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center" onClick={onClose}>
      <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg shadow-lg w-96" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <div className="space-y-3">
          <select value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required>
            <option value="">Select Product</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
          </select>
          <select value={form.warehouseId} onChange={e => setForm({ ...form, warehouseId: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required>
            <option value="">Select Warehouse</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <input type="number" min="1" placeholder="Quantity" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" required />
          <input placeholder="Note (optional)" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Submit</button>
        </div>
      </form>
    </div>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Stock</h1>
        <div className="space-x-2">
          <button onClick={() => setShowIn(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Stock In</button>
          <button onClick={() => setShowOut(true)} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">Stock Out</button>
        </div>
      </div>
      <div className="flex gap-4 mb-4">
        <select value={filters.warehouseId} onChange={e => setFilters({ ...filters, warehouseId: e.target.value })} className="px-3 py-2 border rounded-lg">
          <option value="">All Warehouses</option>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <select value={filters.productId} onChange={e => setFilters({ ...filters, productId: e.target.value })} className="px-3 py-2 border rounded-lg">
          <option value="">All Products</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-lg shadow"><StockTable stock={filtered} /></div>

      {showIn && <Modal title="Stock In" onSubmit={handleStockIn} onClose={() => setShowIn(false)} />}
      {showOut && <Modal title="Stock Out" onSubmit={handleStockOut} onClose={() => setShowOut(false)} />}
    </div>
  )
}
