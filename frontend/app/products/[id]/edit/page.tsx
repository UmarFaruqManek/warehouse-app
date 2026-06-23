'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { Product } from '@/types'
import ProductForm from '@/components/products/product-form'

export default function EditProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    api.get<Product>(`/products/${id}`).then(setProduct).catch(() => {})
  }, [id])

  if (!product) return <div className="p-6">Loading...</div>
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm product={product} />
    </div>
  )
}
