import { Router, Response } from 'express'
import prisma from '../prisma'
import { authenticate } from '../middleware/auth'
import { AuthRequest } from '../types'
import { getPagination, paginatedResponse } from '../lib/paginate'

const router = Router()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
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
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/in', async (req: AuthRequest, res: Response) => {
  try {
    const { productId, warehouseId, zoneId, quantity, note } = req.body
    if (quantity <= 0) {
      return res.status(400).json({ success: false, error: 'Quantity must be positive' })
    }
    const tx = await prisma.$transaction(async (tx) => {
      const transaction = await tx.stockTransaction.create({
        data: {
          productId, warehouseId, zoneId, type: 'IN', quantity,
          referenceType: 'ADJUST', note, userId: req.user!.id,
        },
      })
      const existing = await tx.stock.findUnique({
        where: { productId_warehouseId_zoneId: { productId, warehouseId, zoneId } },
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
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/out', async (req: AuthRequest, res: Response) => {
  try {
    const { productId, warehouseId, zoneId, quantity, note } = req.body
    if (quantity <= 0) {
      return res.status(400).json({ success: false, error: 'Quantity must be positive' })
    }
    const tx = await prisma.$transaction(async (tx) => {
      const existing = await tx.stock.findUnique({
        where: { productId_warehouseId_zoneId: { productId, warehouseId, zoneId } },
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
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
