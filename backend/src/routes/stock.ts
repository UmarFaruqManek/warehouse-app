import { Router, Response } from 'express'
import prisma from '../prisma'
import { authenticate } from '../middleware/auth'
import { AuthRequest } from '../types'

const router = Router()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { warehouseId, productId, belowMin } = req.query
    const where: any = {}
    if (warehouseId) where.warehouseId = Number(warehouseId)
    if (productId) where.productId = Number(productId)
    const stock = await prisma.stock.findMany({
      where,
      include: { product: true, warehouse: true, zone: true },
      orderBy: [{ warehouseId: 'asc' }, { productId: 'asc' }],
    })
    res.json({ success: true, data: stock })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/alerts', async (req: AuthRequest, res: Response) => {
  try {
    const alerts = await prisma.$queryRawUnsafe(`
      SELECT p.id, p.sku, p.name, p.minStock, p.unit,
             COALESCE(SUM(s.quantity), 0) as totalStock
      FROM Product p
      LEFT JOIN Stock s ON s.productId = p.id
      GROUP BY p.id
      HAVING totalStock <= p.minStock
      ORDER BY totalStock ASC
    `)
    res.json({ success: true, data: alerts })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
