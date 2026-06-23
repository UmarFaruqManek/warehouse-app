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

const poCreateSchema = z.object({
  supplierId: z.number().int().positive(),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().min(0),
  })).min(1, 'At least one item required'),
})

const poStatusSchema = z.object({
  status: z.enum(['DRAFT', 'ORDERED', 'RECEIVED']),
  warehouseId: z.number().int().positive().optional().default(1),
})

router.get('/', async (req: AuthRequest, res: Response) => {
  const { status, supplierId } = req.query
  const pag = getPagination(req.query)
  const where: any = {}
  if (status) where.status = status
  if (supplierId) where.supplierId = Number(supplierId)
  const [pos, total] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where, include: { supplier: true, items: { include: { product: true } }, user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }, skip: (pag.page - 1) * pag.limit, take: pag.limit,
    }),
    prisma.purchaseOrder.count({ where }),
  ])
  res.json({ success: true, data: paginatedResponse(pos, total, pag) })
})

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: safeId(req.params.id) },
    include: { supplier: true, items: { include: { product: true } }, user: { select: { id: true, name: true } } },
  })
  if (!po) return res.status(404).json({ success: false, error: 'PO not found' })
  res.json({ success: true, data: po })
})

router.post('/', authorize('ADMIN', 'STAFF'), validate(poCreateSchema), async (req: AuthRequest, res: Response) => {
  const { supplierId, items } = req.body
  const poNumber = `PO-${Date.now()}`
  const totalAmount = items.reduce((sum: number, item: any) => sum + item.quantity * item.unitPrice, 0)
  const po = await prisma.purchaseOrder.create({
    data: {
      poNumber, supplierId, totalAmount, userId: req.user!.id,
      items: { create: items.map((i: any) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })) },
    },
    include: { items: { include: { product: true } }, supplier: true },
  })
  res.status(201).json({ success: true, data: po })
})

router.put('/:id/status', authorize('ADMIN', 'STAFF'), validate(poStatusSchema), async (req: AuthRequest, res: Response) => {
  const { status, warehouseId } = req.body
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: safeId(req.params.id) },
    include: { items: true },
  })
  if (!po) return res.status(404).json({ success: false, error: 'PO not found' })
  if (po.status === 'RECEIVED') {
    return res.status(400).json({ success: false, error: 'PO already received' })
  }
  const wid = warehouseId || 1
  const updated = await prisma.$transaction(async (tx) => {
    if (status === 'RECEIVED') {
      for (const item of po.items) {
        const existing = await tx.stock.findFirst({
          where: { productId: item.productId, warehouseId: wid, zoneId: null },
        })
        if (existing) {
          await tx.stock.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + item.quantity },
          })
        } else {
          await tx.stock.create({
            data: { productId: item.productId, warehouseId: wid, zoneId: null, quantity: item.quantity },
          })
        }
        await tx.stockTransaction.create({
          data: {
            productId: item.productId, warehouseId: wid, type: 'IN', quantity: item.quantity,
            referenceType: 'PO', referenceId: po.id, note: `PO ${po.poNumber}`, userId: req.user!.id,
          },
        })
      }
    }
    return tx.purchaseOrder.update({
      where: { id: po.id },
      data: { status, receivedDate: status === 'RECEIVED' ? new Date() : undefined },
      include: { items: { include: { product: true } }, supplier: true },
    })
  })
  res.json({ success: true, data: updated })
})

export default router
