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

const soCreateSchema = z.object({
  customerName: z.string().min(1).max(200),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().min(0),
  })).min(1, 'At least one item required'),
})

const soStatusSchema = z.object({
  status: z.enum(['DRAFT', 'CONFIRMED', 'SHIPPED']),
  warehouseId: z.number().int().positive(),
})

router.get('/', async (req: AuthRequest, res: Response) => {
  const { status } = req.query
  const pag = getPagination(req.query)
  const where: any = {}
  if (status) where.status = status
  const [sos, total] = await Promise.all([
    prisma.salesOrder.findMany({
      where, include: { items: { include: { product: true } }, user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }, skip: (pag.page - 1) * pag.limit, take: pag.limit,
    }),
    prisma.salesOrder.count({ where }),
  ])
  res.json({ success: true, data: paginatedResponse(sos, total, pag) })
})

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const so = await prisma.salesOrder.findUnique({
    where: { id: safeId(req.params.id) },
    include: { items: { include: { product: true } }, user: { select: { id: true, name: true } } },
  })
  if (!so) return res.status(404).json({ success: false, error: 'SO not found' })
  res.json({ success: true, data: so })
})

router.post('/', authorize('ADMIN', 'STAFF'), validate(soCreateSchema), async (req: AuthRequest, res: Response) => {
  const { customerName, items } = req.body
  const soNumber = `SO-${Date.now()}`
  const so = await prisma.salesOrder.create({
    data: {
      soNumber, customerName, userId: req.user!.id,
      items: { create: items.map((i: any) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })) },
    },
    include: { items: { include: { product: true } } },
  })
  res.status(201).json({ success: true, data: so })
})

router.put('/:id/status', authorize('ADMIN', 'STAFF'), validate(soStatusSchema), async (req: AuthRequest, res: Response) => {
  const { status, warehouseId } = req.body
  const so = await prisma.salesOrder.findUnique({
    where: { id: safeId(req.params.id) },
    include: { items: true },
  })
  if (!so) return res.status(404).json({ success: false, error: 'SO not found' })
  if (so.status === 'SHIPPED') {
    return res.status(400).json({ success: false, error: 'SO already shipped' })
  }
  const wid = warehouseId || 1
  const updated = await prisma.$transaction(async (tx) => {
    if (status === 'SHIPPED') {
      for (const item of so.items) {
        const existing = await tx.stock.findFirst({
          where: { productId: item.productId, warehouseId: wid, zoneId: null },
        })
        if (!existing || existing.quantity < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productId}`)
        }
        await tx.stock.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity - item.quantity },
        })
        await tx.stockTransaction.create({
          data: {
            productId: item.productId, warehouseId: wid, type: 'OUT', quantity: item.quantity,
            referenceType: 'SO', referenceId: so.id, note: `SO ${so.soNumber}`, userId: req.user!.id,
          },
        })
      }
    }
    return tx.salesOrder.update({
      where: { id: so.id },
      data: { status, shippedDate: status === 'SHIPPED' ? new Date() : undefined },
      include: { items: { include: { product: true } } },
    })
  })
  res.json({ success: true, data: updated })
})

export default router
