import { Router, Response } from 'express'
import prisma from '../prisma'
import { authenticate, authorize } from '../middleware/auth'
import { AuthRequest } from '../types'

const router = Router()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status, supplierId } = req.query
    const where: any = {}
    if (status) where.status = status
    if (supplierId) where.supplierId = Number(supplierId)
    const pos = await prisma.purchaseOrder.findMany({
      where,
      include: { supplier: true, items: { include: { product: true } }, user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ success: true, data: pos })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: Number(req.params.id) },
      include: { supplier: true, items: { include: { product: true } }, user: { select: { id: true, name: true } } },
    })
    if (!po) return res.status(404).json({ success: false, error: 'PO not found' })
    res.json({ success: true, data: po })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/', authorize('ADMIN', 'STAFF'), async (req: AuthRequest, res: Response) => {
  try {
    const { supplierId, items } = req.body
    const count = await prisma.purchaseOrder.count()
    const poNumber = `PO-${String(count + 1).padStart(6, '0')}`
    const totalAmount = items.reduce((sum: number, item: any) => sum + item.quantity * item.unitPrice, 0)
    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber, supplierId, totalAmount, userId: req.user!.id,
        items: { create: items.map((i: any) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })) },
      },
      include: { items: { include: { product: true } }, supplier: true },
    })
    res.status(201).json({ success: true, data: po })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.put('/:id/status', authorize('ADMIN', 'STAFF'), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: Number(req.params.id) },
      include: { items: true },
    })
    if (!po) return res.status(404).json({ success: false, error: 'PO not found' })
    if (po.status === 'RECEIVED') {
      return res.status(400).json({ success: false, error: 'PO already received' })
    }
    const updated = await prisma.$transaction(async (tx) => {
      if (status === 'RECEIVED') {
        for (const item of po.items) {
          const existing = await tx.stock.findUnique({
            where: { productId_warehouseId_zoneId: { productId: item.productId, warehouseId: 1, zoneId: null } },
          })
          if (existing) {
            await tx.stock.update({
              where: { id: existing.id },
              data: { quantity: existing.quantity + item.quantity },
            })
          } else {
            await tx.stock.create({
              data: { productId: item.productId, warehouseId: 1, zoneId: null, quantity: item.quantity },
            })
          }
          await tx.stockTransaction.create({
            data: {
              productId: item.productId, warehouseId: 1, type: 'IN', quantity: item.quantity,
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
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
