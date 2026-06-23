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

const warehouseSchema = z.object({
  name: z.string().min(1).max(200),
  location: z.string().max(500).optional().default(''),
  code: z.string().min(1).max(50),
})

const zonesSchema = z.object({
  zones: z.array(z.object({
    name: z.string().min(1).max(200),
    code: z.string().min(1).max(50),
  })).min(0),
})

router.get('/', async (req: AuthRequest, res: Response) => {
  const pag = getPagination(req.query)
  const [warehouses, total] = await Promise.all([
    prisma.warehouse.findMany({ include: { zones: true }, orderBy: { name: 'asc' }, skip: (pag.page - 1) * pag.limit, take: pag.limit }),
    prisma.warehouse.count(),
  ])
  res.json({ success: true, data: paginatedResponse(warehouses, total, pag) })
})

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const warehouse = await prisma.warehouse.findUnique({
    where: { id: safeId(req.params.id) },
    include: { zones: true, Stock: { include: { product: true, zone: true } } },
  })
  if (!warehouse) return res.status(404).json({ success: false, error: 'Warehouse not found' })
  res.json({ success: true, data: warehouse })
})

router.post('/', authorize('ADMIN'), validate(warehouseSchema), async (req: AuthRequest, res: Response) => {
  const { name, location, code } = req.body
  const warehouse = await prisma.warehouse.create({ data: { name, location, code } })
  await prisma.auditLog.create({
    data: { userId: req.user!.id, action: 'CREATE', entityType: 'Warehouse', entityId: warehouse.id, newValue: JSON.stringify(warehouse) },
  })
  res.status(201).json({ success: true, data: warehouse })
})

router.put('/:id', authorize('ADMIN'), validate(warehouseSchema), async (req: AuthRequest, res: Response) => {
  const id = safeId(req.params.id)
  const old = await prisma.warehouse.findUnique({ where: { id } })
  if (!old) return res.status(404).json({ success: false, error: 'Warehouse not found' })
  const { name, location, code } = req.body
  const existing = await prisma.warehouse.findFirst({ where: { code, NOT: { id } } })
  if (existing) return res.status(400).json({ success: false, error: 'Warehouse code already in use' })
  const warehouse = await prisma.warehouse.update({
    where: { id },
    data: { name, location, code },
  })
  await prisma.auditLog.create({
    data: { userId: req.user!.id, action: 'UPDATE', entityType: 'Warehouse', entityId: warehouse.id, oldValue: JSON.stringify(old), newValue: JSON.stringify(warehouse) },
  })
  res.json({ success: true, data: warehouse })
})

router.delete('/:id', authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  const id = safeId(req.params.id)
  const old = await prisma.warehouse.findUnique({ where: { id } })
  if (!old) return res.status(404).json({ success: false, error: 'Warehouse not found' })
  await prisma.warehouse.delete({ where: { id } })
  await prisma.auditLog.create({
    data: { userId: req.user!.id, action: 'DELETE', entityType: 'Warehouse', entityId: id, oldValue: JSON.stringify(old) },
  })
  res.json({ success: true, data: null })
})

router.put('/:id/zones', authorize('ADMIN'), validate(zonesSchema), async (req: AuthRequest, res: Response) => {
  const warehouseId = safeId(req.params.id)
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
})

export default router
