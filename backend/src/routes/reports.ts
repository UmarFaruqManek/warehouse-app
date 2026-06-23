import { Router, Response } from 'express'
import prisma from '../prisma'
import { authenticate, authorize } from '../middleware/auth'
import { AuthRequest } from '../types'

const router = Router()
router.use(authenticate)

router.get('/stock-value', authorize('ADMIN', 'MANAGER'), async (_req: AuthRequest, res: Response) => {
  const rows: any[] = await prisma.$queryRawUnsafe(`
    SELECT p.id, p.sku, p.name, p.price, p.unit,
           COALESCE(SUM(s.quantity), 0) as totalStock,
           p.price * COALESCE(SUM(s.quantity), 0) as totalValue
    FROM Product p
    LEFT JOIN Stock s ON s.productId = p.id
    GROUP BY p.id
    ORDER BY totalValue DESC
  `)
  res.json({ success: true, data: rows.map((r: any) => ({ ...r, totalStock: Number(r.totalStock), totalValue: Number(r.totalValue) })) })
})

router.get('/movement', authorize('ADMIN', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  const { startDate, endDate, warehouseId } = req.query
  const where: any = {}
  if (warehouseId) where.warehouseId = Number(warehouseId)
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = new Date(startDate as string)
    if (endDate) where.createdAt.lte = new Date(endDate as string)
  }
  const movements = await prisma.stockTransaction.findMany({
    where,
    include: { product: { select: { id: true, name: true, sku: true } }, warehouse: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ success: true, data: movements })
})

router.get('/slow-moving', authorize('ADMIN', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  const months = Number(req.query.months) || 3
  const threshold = Number(req.query.threshold) || 10
  const dateThreshold = new Date()
  dateThreshold.setMonth(dateThreshold.getMonth() - months)
  const rows: any[] = await prisma.$queryRawUnsafe(`
    SELECT p.id, p.sku, p.name, p.category,
           COALESCE(SUM(s.quantity), 0) as totalStock,
           COALESCE(t.movementCount, 0) as movementCount
    FROM Product p
    LEFT JOIN Stock s ON s.productId = p.id
    LEFT JOIN (
      SELECT productId, COUNT(*) as movementCount
      FROM StockTransaction
      WHERE createdAt >= ?
      GROUP BY productId
    ) t ON t.productId = p.id
    GROUP BY p.id
    HAVING movementCount <= ?
    ORDER BY totalStock DESC
  `, dateThreshold, threshold)
  res.json({ success: true, data: rows.map((r: any) => ({ ...r, totalStock: Number(r.totalStock), movementCount: Number(r.movementCount) })) })
})

export default router
