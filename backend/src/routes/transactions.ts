import { Router, Response } from 'express'
import { z } from 'zod'
import prisma from '../prisma'
import { authenticate } from '../middleware/auth'
import { AuthRequest } from '../types'
import { getPagination, paginatedResponse } from '../lib/paginate'
import { validate } from '../lib/validate'

const router = Router()
router.use(authenticate)

const stockInSchema = z.object({
  productId: z.number().int().positive(),
  warehouseId: z.number().int().positive(),
  zoneId: z.number().int().positive().nullable().optional().default(null),
  quantity: z.number().int().positive('Quantity must be positive integer'),
  note: z.string().max(500).optional().default(''),
})

const stockOutSchema = z.object({
  productId: z.number().int().positive(),
  warehouseId: z.number().int().positive(),
  zoneId: z.number().int().positive().nullable().optional().default(null),
  quantity: z.number().int().positive('Quantity must be positive integer'),
  note: z.string().max(500).optional().default(''),
})

router.get('/', async (req: AuthRequest, res: Response) => {
  const { type, startDate, endDate, productId } = req.query
  const pag = getPagination(req.query)
  const where: any = {}
  if (type) where.type = type
  if (productId) where.productId = Number(productId)
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = new Date(startDate as string)
    if (endDate) where.createdAt.lte = new Date(endDate as string)
  }
  const [transactions, total] = await Promise.all([
    prisma.stockTransaction.findMany({
      where, include: { product: true, warehouse: true, zone: true, user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }, skip: (pag.page - 1) * pag.limit, take: pag.limit,
    }),
    prisma.stockTransaction.count({ where }),
  ])
  res.json({ success: true, data: paginatedResponse(transactions, total, pag) })
})

router.post('/in', validate(stockInSchema), async (req: AuthRequest, res: Response) => {
  const { productId, warehouseId, zoneId, quantity, note } = req.body
  const tx = await prisma.$transaction(async (tx) => {
    const transaction = await tx.stockTransaction.create({
      data: {
        productId, warehouseId, zoneId, type: 'IN', quantity,
        referenceType: 'ADJUST', note, userId: req.user!.id,
      },
    })
    const existing = await tx.stock.findFirst({
      where: { productId, warehouseId, zoneId: zoneId ?? null },
    })
    if (existing) {
      await tx.stock.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      })
    } else {
      await tx.stock.create({
        data: { productId, warehouseId, zoneId, quantity },
      })
    }
    return transaction
  })
  res.status(201).json({ success: true, data: tx })
})

router.post('/out', validate(stockOutSchema), async (req: AuthRequest, res: Response) => {
  const { productId, warehouseId, zoneId, quantity, note } = req.body
  const tx = await prisma.$transaction(async (tx) => {
    const existing = await tx.stock.findFirst({
      where: { productId, warehouseId, zoneId: zoneId ?? null },
    })
    if (!existing || existing.quantity < quantity) {
      throw new Error('Insufficient stock')
    }
    const transaction = await tx.stockTransaction.create({
      data: {
        productId, warehouseId, zoneId, type: 'OUT', quantity,
        referenceType: 'ADJUST', note, userId: req.user!.id,
      },
    })
    await tx.stock.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity - quantity },
    })
    return transaction
  })
  res.status(201).json({ success: true, data: tx })
})

export default router
