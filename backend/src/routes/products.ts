import { Router, Response } from 'express'
import prisma from '../prisma'
import { authenticate, authorize } from '../middleware/auth'
import { AuthRequest } from '../types'

const router = Router()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { search, category, warehouseId } = req.query
    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { sku: { contains: search as string } },
      ]
    }
    if (category) where.category = category
    const products = await prisma.product.findMany({
      where,
      include: { supplier: true },
      orderBy: { name: 'asc' },
    })
    res.json({ success: true, data: products })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
      include: { supplier: true, Stock: { include: { warehouse: true, zone: true } } },
    })
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' })
    res.json({ success: true, data: product })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/', authorize('ADMIN', 'STAFF'), async (req: AuthRequest, res: Response) => {
  try {
    const { sku, name, description, category, unit, minStock, price, supplierId } = req.body
    const existing = await prisma.product.findUnique({ where: { sku } })
    if (existing) {
      return res.status(400).json({ success: false, error: 'SKU already exists' })
    }
    const product = await prisma.product.create({
      data: { sku, name, description, category, unit, minStock, price, supplierId },
    })
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id, action: 'CREATE', entityType: 'Product',
        entityId: product.id, newValue: JSON.stringify(product),
      },
    })
    res.status(201).json({ success: true, data: product })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.put('/:id', authorize('ADMIN', 'STAFF'), async (req: AuthRequest, res: Response) => {
  try {
    const old = await prisma.product.findUnique({ where: { id: Number(req.params.id) } })
    if (!old) return res.status(404).json({ success: false, error: 'Product not found' })
    const { sku, name, description, category, unit, minStock, price, supplierId } = req.body
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: { sku, name, description, category, unit, minStock, price, supplierId },
    })
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id, action: 'UPDATE', entityType: 'Product',
        entityId: product.id, oldValue: JSON.stringify(old), newValue: JSON.stringify(product),
      },
    })
    res.json({ success: true, data: product })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.delete('/:id', authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const old = await prisma.product.findUnique({ where: { id: Number(req.params.id) } })
    if (!old) return res.status(404).json({ success: false, error: 'Product not found' })
    await prisma.product.delete({ where: { id: Number(req.params.id) } })
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id, action: 'DELETE', entityType: 'Product',
        entityId: Number(req.params.id), oldValue: JSON.stringify(old),
      },
    })
    res.json({ success: true, data: null })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
