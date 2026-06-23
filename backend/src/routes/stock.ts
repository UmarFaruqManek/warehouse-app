import { Router, Response } from 'express'
import prisma from '../prisma'
import { authenticate } from '../middleware/auth'
import { AuthRequest } from '../types'
import { getPagination, paginatedResponse } from '../lib/paginate'

const router = Router()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { warehouseId, productId } = req.query
    const pag = getPagination(req.query)
    const where: any = {}
    if (warehouseId) where.warehouseId = Number(warehouseId)
    if (productId) where.productId = Number(productId)
    const [stock, total] = await Promise.all([
      prisma.stock.findMany({
        where, include: { product: true, warehouse: true, zone: true },
        orderBy: [{ warehouseId: 'asc' }, { productId: 'asc' }],
        skip: (pag.page - 1) * pag.limit, take: pag.limit,
      }),
      prisma.stock.count({ where }),
    ])
    res.json({ success: true, data: paginatedResponse(stock, total, pag) })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/alerts', async (req: AuthRequest, res: Response) => {
  const rows: any[] = await prisma.$queryRawUnsafe(`
    SELECT p.id, p.sku, p.name, p.minStock, p.unit,
           COALESCE(SUM(s.quantity), 0) as totalStock
    FROM Product p
    LEFT JOIN Stock s ON s.productId = p.id
    GROUP BY p.id
    HAVING COALESCE(SUM(s.quantity), 0) <= p.minStock
    ORDER BY totalStock ASC
  `)
  res.json({ success: true, data: rows.map((r: any) => ({ ...r, totalStock: Number(r.totalStock) })) })
})

export default router
