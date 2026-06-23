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

const supplierSchema = z.object({
  name: z.string().min(1).max(200),
  contact: z.string().max(200).optional().default(''),
  phone: z.string().max(50).optional().default(''),
  email: z.string().max(200).optional().default(''),
  address: z.string().max(500).optional().default(''),
})

router.get('/', async (req: AuthRequest, res: Response) => {
  const { search } = req.query
  const pag = getPagination(req.query)
  const where: any = {}
  if (search) where.name = { contains: search as string }
  const [suppliers, total] = await Promise.all([
    prisma.supplier.findMany({ where, orderBy: { name: 'asc' }, skip: (pag.page - 1) * pag.limit, take: pag.limit }),
    prisma.supplier.count({ where }),
  ])
  res.json({ success: true, data: paginatedResponse(suppliers, total, pag) })
})

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id: safeId(req.params.id) },
    include: { Products: true },
  })
  if (!supplier) return res.status(404).json({ success: false, error: 'Supplier not found' })
  res.json({ success: true, data: supplier })
})

router.post('/', authorize('ADMIN'), validate(supplierSchema), async (req: AuthRequest, res: Response) => {
  const { name, contact, phone, email, address } = req.body
  const supplier = await prisma.supplier.create({ data: { name, contact, phone, email, address } })
  await prisma.auditLog.create({
    data: { userId: req.user!.id, action: 'CREATE', entityType: 'Supplier', entityId: supplier.id, newValue: JSON.stringify(supplier) },
  })
  res.status(201).json({ success: true, data: supplier })
})

router.put('/:id', authorize('ADMIN'), validate(supplierSchema), async (req: AuthRequest, res: Response) => {
  const id = safeId(req.params.id)
  const old = await prisma.supplier.findUnique({ where: { id } })
  if (!old) return res.status(404).json({ success: false, error: 'Supplier not found' })
  const { name, contact, phone, email, address } = req.body
  const supplier = await prisma.supplier.update({
    where: { id },
    data: { name, contact, phone, email, address },
  })
  await prisma.auditLog.create({
    data: { userId: req.user!.id, action: 'UPDATE', entityType: 'Supplier', entityId: supplier.id, oldValue: JSON.stringify(old), newValue: JSON.stringify(supplier) },
  })
  res.json({ success: true, data: supplier })
})

router.delete('/:id', authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  const id = safeId(req.params.id)
  const old = await prisma.supplier.findUnique({ where: { id } })
  if (!old) return res.status(404).json({ success: false, error: 'Supplier not found' })
  await prisma.supplier.delete({ where: { id } })
  await prisma.auditLog.create({
    data: { userId: req.user!.id, action: 'DELETE', entityType: 'Supplier', entityId: id, oldValue: JSON.stringify(old) },
  })
  res.json({ success: true, data: null })
})

export default router
