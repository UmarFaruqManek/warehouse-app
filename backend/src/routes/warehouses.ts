import { Router, Response } from 'express'
import prisma from '../prisma'
import { authenticate, authorize } from '../middleware/auth'
import { AuthRequest } from '../types'
import { getPagination, paginatedResponse } from '../lib/paginate'

const router = Router()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const pag = getPagination(req.query)
    const [warehouses, total] = await Promise.all([
      prisma.warehouse.findMany({ include: { zones: true }, orderBy: { name: 'asc' }, skip: (pag.page - 1) * pag.limit, take: pag.limit }),
      prisma.warehouse.count(),
    ])
    res.json({ success: true, data: paginatedResponse(warehouses, total, pag) })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: Number(req.params.id) },
      include: { zones: true, Stock: { include: { product: true, zone: true } } },
    })
    if (!warehouse) return res.status(404).json({ success: false, error: 'Warehouse not found' })
    res.json({ success: true, data: warehouse })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/', authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, location, code } = req.body
    const warehouse = await prisma.warehouse.create({ data: { name, location, code } })
    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'CREATE', entityType: 'Warehouse', entityId: warehouse.id, newValue: JSON.stringify(warehouse) },
    })
    res.status(201).json({ success: true, data: warehouse })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.put('/:id', authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const old = await prisma.warehouse.findUnique({ where: { id: Number(req.params.id) } })
    if (!old) return res.status(404).json({ success: false, error: 'Warehouse not found' })
    const { name, location, code } = req.body
    const warehouse = await prisma.warehouse.update({
      where: { id: Number(req.params.id) },
      data: { name, location, code },
    })
    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'UPDATE', entityType: 'Warehouse', entityId: warehouse.id, oldValue: JSON.stringify(old), newValue: JSON.stringify(warehouse) },
    })
    res.json({ success: true, data: warehouse })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.delete('/:id', authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const old = await prisma.warehouse.findUnique({ where: { id: Number(req.params.id) } })
    if (!old) return res.status(404).json({ success: false, error: 'Warehouse not found' })
    await prisma.warehouse.delete({ where: { id: Number(req.params.id) } })
    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'DELETE', entityType: 'Warehouse', entityId: Number(req.params.id), oldValue: JSON.stringify(old) },
    })
    res.json({ success: true, data: null })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.put('/:id/zones', authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const warehouseId = Number(req.params.id)
    const { zones } = req.body
    await prisma.zone.deleteMany({ where: { warehouseId } })
    const created = await Promise.all(
      zones.map((z: { name: string; code: string }) =>
        prisma.zone.create({ data: { warehouseId, name: z.name, code: z.code } })
      )
    )
    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'UPDATE', entityType: 'Warehouse', entityId: warehouseId, newValue: JSON.stringify({ zones: created }) },
    })
    res.json({ success: true, data: created })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
