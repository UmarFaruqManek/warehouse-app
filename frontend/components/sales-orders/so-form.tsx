'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Product } from '@/types'

export default function SOForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [customerName, setCustomerName] = useState('')
  const [items, setItems] = useState<{ productId: string; quantity: number; unitPrice: number }[]>([])

  useEffect(() => { api.get<Product[]>('/products').then(setProducts).catch(() => {}) }, [])

  const addItem = () => setItems([...items, { productId: '', quantity: 1, unitPrice: 0 }])
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: string, value: any) => {
    const copy = [...items]; copy[i] = { ...copy[i], [field]: value }; setItems(copy)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/sales-orders', {
        customerName,
        items: items.map(i => ({ productId: Number(i.productId), quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) })),
      })
      toast.success('Sales order created')
      router.push('/sales-orders')
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Customer Name</label>
        <input value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" required />
      </div>
      <div><p className="font-medium mb-2">Items</p>
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <select value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)} className="flex-1 px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" required>
              <option value="">Select Product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
            </select>
            <input type="number" placeholder="Qty" value={item.quantity} onChange={e => updateItem(i, 'quantity', Number(e.target.value))} className="w-20 px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" min="1" required />
            <input type="number" placeholder="Price" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', Number(e.target.value))} className="w-28 px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" min="0" step="0.01" required />
            <button type="button" onClick={() => removeItem(i)} className="text-red-600 px-2">X</button>
          </div>
        ))}
        <button type="button" onClick={addItem} className="text-blue-600 text-sm">+ Add Item</button>
      </div>
      <button type="submit" disabled={loading} className={`bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {loading ? 'Saving...' : 'Create SO'}
      </button>
    </form>
  )
}
