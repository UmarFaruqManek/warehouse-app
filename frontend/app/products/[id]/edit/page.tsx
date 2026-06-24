'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { Product } from '@/types'
import ProductForm from '@/components/products/product-form'
import { PageSkeleton } from '@/components/ui/skeleton'

export default function EditProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    api.get<Product>(`/products/${id}`).then(setProduct).catch(() => {})
  }, [id])

  if (!product) return <PageSkeleton />
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm product={product} />
    </div>
  )
}
