import { Router, Response } from 'express'
import { z } from 'zod'
import prisma from '../prisma'
import { authenticate, authorize } from '../middleware/auth'
import { AuthRequest } from '../types'
import { getPagination, paginatedResponse } from '../lib/paginate'
import { validate } from '../lib/validate'
import { safeId } from '../lib/safe-id'

const router = Router()
router.use(authenticate)

const productSchema = z.object({
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  description: z.string().optional().default(''),
  category: z.string().optional().default(''),
  unit: z.string().optional().default('pcs'),
  minStock: z.number().int().min(0).optional().default(0),
  price: z.number().min(0).optional().default(0),
  supplierId: z.number().int().positive().nullable().optional().default(null),
})

router.get('/', async (req: AuthRequest, res: Response) => {
  const { search, category } = req.query
  const pag = getPagination(req.query)
  const where: any = {}
  if (search) {
    where.OR = [
      { name: { contains: search as string } },
      { sku: { contains: search as string } },
    ]
  }
  if (category) where.category = category
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { supplier: true },
      orderBy: { name: 'asc' },
      skip: (pag.page - 1) * pag.limit,
      take: pag.limit,
    }),
    prisma.product.count({ where }),
  ])
  res.json({ success: true, data: paginatedResponse(products, total, pag) })
})

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: safeId(req.params.id) },
    include: { supplier: true, Stock: { include: { warehouse: true, zone: true } } },
  })
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' })
  res.json({ success: true, data: product })
})

router.post('/', authorize('ADMIN', 'STAFF'), validate(productSchema), async (req: AuthRequest, res: Response) => {
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
})

router.put('/:id', authorize('ADMIN', 'STAFF'), validate(productSchema), async (req: AuthRequest, res: Response) => {
  const id = safeId(req.params.id)
  const old = await prisma.product.findUnique({ where: { id } })
  if (!old) return res.status(404).json({ success: false, error: 'Product not found' })
  const { sku, name, description, category, unit, minStock, price, supplierId } = req.body
  const existing = await prisma.product.findFirst({ where: { sku, NOT: { id } } })
  if (existing) return res.status(400).json({ success: false, error: 'SKU already in use' })
  const product = await prisma.product.update({
    where: { id },
    data: { sku, name, description, category, unit, minStock, price, supplierId },
  })
  await prisma.auditLog.create({
    data: {
      userId: req.user!.id, action: 'UPDATE', entityType: 'Product',
      entityId: product.id, oldValue: JSON.stringify(old), newValue: JSON.stringify(product),
    },
  })
  res.json({ success: true, data: product })
})

router.delete('/:id', authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  const id = safeId(req.params.id)
  const old = await prisma.product.findUnique({ where: { id } })
  if (!old) return res.status(404).json({ success: false, error: 'Product not found' })
  await prisma.product.delete({ where: { id } })
  await prisma.auditLog.create({
    data: {
      userId: req.user!.id, action: 'DELETE', entityType: 'Product',
      entityId: id, oldValue: JSON.stringify(old),
    },
  })
  res.json({ success: true, data: null })
})

export default router
