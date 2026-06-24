import { Router, Response } from 'express'
import prisma from '../prisma'
import { authenticate } from '../middleware/auth'
import { AuthRequest } from '../types'

const router = Router()
router.use(authenticate)

function escapeCSV(val: any): string {
  if (val == null) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function toCSV(headers: string[], rows: any[], fields: string[]): string {
  const header = headers.join(',')
  const body = rows.map(r => fields.map(f => escapeCSV(r[f])).join(',')).join('\n')
  return `${header}\n${body}`
}

router.get('/products/csv', async (_req: AuthRequest, res: Response) => {
  const products = await prisma.product.findMany({ orderBy: { name: 'asc' } })
  const csv = toCSV(
    ['SKU', 'Name', 'Category', 'Unit', 'Price', 'Min Stock'],
    products,
    ['sku', 'name', 'category', 'unit', 'price', 'minStock']
  )
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename=products.csv')
  res.send(csv)
})

router.get('/stock/csv', async (_req: AuthRequest, res: Response) => {
  const stock = await prisma.stock.findMany({
    include: { product: true, warehouse: true, zone: true },
    orderBy: [{ warehouseId: 'asc' }, { productId: 'asc' }],
  })
  const headers = ['Warehouse', 'Zone', 'SKU', 'Product', 'Quantity']
  const rows = stock.map(s => ({
    warehouse: s.warehouse.name,
    zone: s.zone?.name || '',
    sku: s.product.sku,
    product: s.product.name,
    quantity: s.quantity,
  }))
  const csv = toCSV(headers, rows, ['warehouse', 'zone', 'sku', 'product', 'quantity'])
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename=stock.csv')
  res.send(csv)
})

router.get('/transactions/csv', async (req: AuthRequest, res: Response) => {
  const { startDate, endDate } = req.query
  const where: any = {}
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = new Date(startDate as string)
    if (endDate) where.createdAt.lte = new Date(endDate as string)
  }
  const transactions = await prisma.stockTransaction.findMany({
    where, include: { product: true, warehouse: true, user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  const headers = ['Date', 'Type', 'SKU', 'Product', 'Warehouse', 'Qty', 'Note', 'User']
  const rows = transactions.map(t => ({
    date: t.createdAt.toISOString(),
    type: t.type,
    sku: t.product.sku,
    product: t.product.name,
    warehouse: t.warehouse.name,
    quantity: t.quantity,
    note: t.note,
    user: t.user?.name || '',
  }))
  const csv = toCSV(headers, rows, ['date', 'type', 'sku', 'product', 'warehouse', 'quantity', 'note', 'user'])
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv')
  res.send(csv)
})

export default router
